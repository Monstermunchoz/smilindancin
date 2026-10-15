import { readTable, writeTable, withLock, nextOrderNumber } from "@/lib/db";
import { COLLECTIONS } from "@/lib/data/products";
import type { Order, ShippingMethod, CartLine, Money } from "./types";
import { CommerceError, type CommerceProvider, type CreateOrderInput } from "./provider";

const eur = (amount: number): Money => ({ amount, currency: "EUR" });

export const SHIPPING_METHODS: ShippingMethod[] = [
  { id: "colissimo", label: "Colissimo domicile", description: "France métropolitaine", price: eur(590), eta: "2–4 jours ouvrés" },
  { id: "relais", label: "Point relais", description: "Mondial Relay / Colissimo", price: eur(390), eta: "3–5 jours ouvrés" },
  { id: "event", label: "Retrait à l'événement", description: "Stand Merch, prochain événement Smilin' Dancin'", price: eur(0), eta: "Le jour J" },
];

const now = () => new Date().toISOString();

export const localProvider: CommerceProvider = {
  name: "local",

  async listProducts(opts) {
    const products = await readTable("products");
    return opts?.includeDrafts ? products : products.filter((p) => p.status === "active" || p.status === "coming_soon");
  },

  async getProduct(handle) {
    const products = await readTable("products");
    return products.find((p) => p.handle === handle) ?? null;
  },

  async listCollections() {
    return COLLECTIONS;
  },

  async getCollection(handle) {
    const c = COLLECTIONS.find((c) => c.handle === handle);
    if (!c) return null;
    const products = (await this.listProducts()).filter((p) => c.productHandles.includes(p.handle));
    return { ...c, products };
  },

  async searchProducts(q) {
    const needle = q.trim().toLowerCase();
    if (!needle) return [];
    const products = await this.listProducts();
    return products.filter((p) =>
      [p.title, p.subtitle, p.description, ...p.tags, p.category].filter(Boolean).join(" ").toLowerCase().includes(needle),
    );
  },

  async shippingMethods() {
    return SHIPPING_METHODS;
  },

  async createOrder(input: CreateOrderInput) {
    return withLock(async () => {
      const products = await readTable("products");
      const method = SHIPPING_METHODS.find((m) => m.id === input.shippingMethodId);
      if (!method) throw new CommerceError("Mode de livraison inconnu", "INVALID");
      if (!input.lines.length) throw new CommerceError("Panier vide", "INVALID");
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(input.customer.email)) throw new CommerceError("Email invalide", "INVALID");

      const lines: Order["lines"] = [];
      for (const l of input.lines) {
        const product = products.find((p) => p.variants.some((v) => v.id === l.variantId));
        const variant = product?.variants.find((v) => v.id === l.variantId);
        if (!product || !variant) throw new CommerceError(`Variante introuvable : ${l.variantId}`, "NOT_FOUND");
        if (product.status !== "active") throw new CommerceError(`${product.title} n'est pas disponible`, "UNAVAILABLE");
        const qty = Math.max(1, Math.min(10, Math.floor(l.quantity)));
        if (variant.stock !== null && variant.stock < qty) {
          throw new CommerceError(`Stock insuffisant pour ${product.title} (${variant.title})`, "OUT_OF_STOCK", { variantId: variant.id, available: variant.stock });
        }
        const line: CartLine & { lineTotal: Money } = {
          id: variant.id,
          productHandle: product.handle,
          productTitle: product.title + (product.preorder ? " (précommande)" : ""),
          variantId: variant.id,
          variantTitle: variant.title,
          options: variant.options,
          image: product.images[0]?.src ?? "",
          unitPrice: variant.price,
          quantity: qty,
          maxQuantity: variant.stock,
          lineTotal: eur(variant.price.amount * qty),
        };
        lines.push(line);
        if (variant.stock !== null) {
          variant.stock -= qty;
          variant.available = variant.stock > 0;
        }
      }

      const subtotal = eur(lines.reduce((s, l) => s + l.lineTotal.amount, 0));
      const number = await nextOrderNumber();
      const id = `SD-${new Date().getFullYear()}-${String(number).padStart(4, "0")}`;
      const order: Order = {
        id,
        number,
        createdAt: now(),
        updatedAt: now(),
        status: "pending_payment",
        paymentStatus: "unpaid",
        paymentProvider: "none",
        customer: input.customer,
        shippingAddress: input.shippingAddress,
        shippingMethod: { id: method.id, label: method.label, price: method.price },
        lines,
        subtotal,
        shipping: method.price,
        total: eur(subtotal.amount + method.price.amount),
        note: input.note,
        timeline: [{ at: now(), label: "Commande créée (mode démo — paiement non activé)", by: "client" }],
        source: "web",
        demo: true,
      };

      const orders = await readTable("orders");
      orders.unshift(order);
      await writeTable("orders", orders);
      await writeTable("products", products);
      return order;
    });
  },

  async listOrders() {
    return readTable("orders");
  },

  async getOrder(id) {
    const orders = await readTable("orders");
    return orders.find((o) => o.id === id) ?? null;
  },

  async updateOrder(id, patch, by = "admin") {
    return withLock(async () => {
      const orders = await readTable("orders");
      const o = orders.find((o) => o.id === id);
      if (!o) return null;
      if (patch.status && patch.status !== o.status) {
        o.timeline.push({ at: now(), label: `Statut → ${patch.status}`, by });
        o.status = patch.status;
      }
      if (patch.paymentStatus && patch.paymentStatus !== o.paymentStatus) {
        o.timeline.push({ at: now(), label: `Paiement → ${patch.paymentStatus}`, by });
        o.paymentStatus = patch.paymentStatus;
      }
      if (patch.note !== undefined) o.note = patch.note;
      o.updatedAt = now();
      await writeTable("orders", orders);
      return o;
    });
  },

  async updateProduct(id, patch) {
    return withLock(async () => {
      const products = await readTable("products");
      const p = products.find((p) => p.id === id);
      if (!p) return null;
      Object.assign(p, patch, { id: p.id });
      await writeTable("products", products);
      return p;
    });
  },

  async setVariantStock(productId, variantId, stock) {
    return withLock(async () => {
      const products = await readTable("products");
      const p = products.find((p) => p.id === productId);
      const v = p?.variants.find((v) => v.id === variantId);
      if (!p || !v) return null;
      v.stock = Math.max(0, Math.floor(stock));
      v.available = v.stock > 0;
      await writeTable("products", products);
      return p;
    });
  },
};
