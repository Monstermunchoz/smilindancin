import type { Collection, Order, Product, ShippingMethod } from "./types";

/**
 * Interface commune. Deux implémentations :
 *  - local  : données JSON (démo) + commandes enregistrées dans data/runtime (sans paiement)
 *  - shopify: Storefront API (catalogue/panier/checkout) + Admin API (commandes) — à configurer
 */
export interface CommerceProvider {
  readonly name: "local" | "shopify";
  listProducts(opts?: { includeDrafts?: boolean }): Promise<Product[]>;
  getProduct(handle: string): Promise<Product | null>;
  listCollections(): Promise<Collection[]>;
  getCollection(handle: string): Promise<(Collection & { products: Product[] }) | null>;
  searchProducts(q: string): Promise<Product[]>;
  shippingMethods(): Promise<ShippingMethod[]>;
  createOrder(input: CreateOrderInput): Promise<Order>;
  listOrders(): Promise<Order[]>;
  getOrder(id: string): Promise<Order | null>;
  updateOrder(id: string, patch: Partial<Pick<Order, "status" | "paymentStatus" | "note">>, by?: "admin" | "system"): Promise<Order | null>;
  updateProduct(id: string, patch: Partial<Product>): Promise<Product | null>;
  setVariantStock(productId: string, variantId: string, stock: number): Promise<Product | null>;
}

export type CreateOrderInput = {
  customer: Order["customer"];
  shippingAddress: Order["shippingAddress"];
  shippingMethodId: string;
  lines: { variantId: string; quantity: number }[];
  note?: string;
};

export class CommerceError extends Error {
  constructor(
    message: string,
    public code: "OUT_OF_STOCK" | "NOT_FOUND" | "INVALID" | "UNAVAILABLE",
    public details?: unknown,
  ) {
    super(message);
  }
}
