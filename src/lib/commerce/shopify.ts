/**
 * SHOPIFY — adaptateur (à activer).
 * ---------------------------------------------------------------------------
 * Ce fichier documente et prépare la connexion Shopify. Il n'est utilisé que si
 * COMMERCE_PROVIDER=shopify ET que les variables d'environnement sont présentes.
 *
 * Variables (.env.local) :
 *   COMMERCE_PROVIDER=shopify
 *   SHOPIFY_STORE_DOMAIN=smilin-dancin.myshopify.com
 *   SHOPIFY_STOREFRONT_ACCESS_TOKEN=...        (Storefront API — public-safe, lecture catalogue + panier)
 *   SHOPIFY_ADMIN_ACCESS_TOKEN=...             (Admin API — SERVEUR UNIQUEMENT, pour l'espace admin : commandes, stocks)
 *   SHOPIFY_API_VERSION=2026-07
 *
 * Étapes de connexion :
 *   1. Shopify Admin → Settings → Apps and sales channels → Develop apps → Create an app « Smilin' Dancin' site ».
 *   2. Configure Storefront API scopes : unauthenticated_read_product_listings, unauthenticated_read_product_inventory,
 *      unauthenticated_write_checkouts, unauthenticated_read_checkouts, unauthenticated_read_content.
 *   3. Configure Admin API scopes : read_orders, write_orders, read_products, write_products, read_inventory, write_inventory, read_customers.
 *   4. Install app → copier les tokens dans .env.local (jamais dans le code, jamais préfixés NEXT_PUBLIC_).
 *   5. Créer les produits dans Shopify avec les mêmes handles que src/lib/data/products.ts
 *      (ou adapter mapProduct ci-dessous). Options : Coupe / Impression / Couleur / Taille.
 *   6. Passer COMMERCE_PROVIDER=shopify, relancer. Le checkout redirige vers le checkout Shopify (paiement sécurisé).
 *
 * Note : les montants Shopify sont des chaînes décimales ; on convertit en centimes.
 */
import type { CommerceProvider } from "./provider";
import { CommerceError } from "./provider";
import type { Collection, Order, Product, ShippingMethod } from "./types";

const domain = process.env.SHOPIFY_STORE_DOMAIN;
const storefrontToken = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
const adminToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
const apiVersion = process.env.SHOPIFY_API_VERSION ?? "2026-07";

export const shopifyConfigured = Boolean(domain && storefrontToken);
export const shopifyAdminConfigured = Boolean(domain && adminToken);

async function storefront<T>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
  if (!shopifyConfigured) throw new CommerceError("Shopify n'est pas configuré", "UNAVAILABLE");
  const res = await fetch(`https://${domain}/api/${apiVersion}/graphql.json`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Shopify-Storefront-Access-Token": storefrontToken! },
    body: JSON.stringify({ query, variables }),
    next: { revalidate: 60 },
  });
  const json = (await res.json()) as { data: T; errors?: unknown };
  if (json.errors) throw new CommerceError("Erreur Storefront API", "UNAVAILABLE", json.errors);
  return json.data;
}

type SfMoney = { amount: string; currencyCode: string };
type SfProduct = {
  id: string;
  handle: string;
  title: string;
  description: string;
  tags: string[];
  productType: string;
  featuredImage?: { url: string; altText?: string | null } | null;
  images: { nodes: { url: string; altText?: string | null }[] };
  options: { name: string; values: string[] }[];
  variants: {
    nodes: {
      id: string;
      sku?: string | null;
      title: string;
      availableForSale: boolean;
      quantityAvailable?: number | null;
      price: SfMoney;
      compareAtPrice?: SfMoney | null;
      selectedOptions: { name: string; value: string }[];
    }[];
  };
  priceRange: { minVariantPrice: SfMoney };
};

const cents = (m: SfMoney) => Math.round(parseFloat(m.amount) * 100);

function mapProduct(p: SfProduct): Product {
  const colors = p.options.find((o) => /couleur|color/i.test(o.name))?.values ?? [];
  const sizes = p.options.find((o) => /taille|size/i.test(o.name))?.values ?? [];
  return {
    id: p.id,
    handle: p.handle,
    title: p.title,
    description: p.description,
    details: [],
    category: /sweat|hoodie/i.test(p.productType) ? "hoodie" : /tee|t-shirt/i.test(p.productType) ? "tee" : "accessory",
    collection: "",
    tags: p.tags,
    images: p.images.nodes.map((i) => ({ src: i.url, alt: i.altText ?? p.title, kind: "photo" as const })),
    colors: colors.map((name) => ({ name, hex: "#888" })),
    sizes,
    variants: p.variants.nodes.map((v) => ({
      id: v.id,
      sku: v.sku ?? "",
      title: v.title,
      options: v.selectedOptions.map((o) => ({ name: (/taille|size/i.test(o.name) ? "Taille" : "Couleur") as "Taille" | "Couleur", value: o.value })),
      price: { amount: cents(v.price), currency: "EUR" },
      compareAtPrice: v.compareAtPrice ? { amount: cents(v.compareAtPrice), currency: "EUR" } : null,
      available: v.availableForSale,
      stock: v.quantityAvailable ?? null,
    })),
    price: { amount: cents(p.priceRange.minVariantPrice), currency: "EUR" },
    status: "active",
    demo: false,
    provenance: "Shopify",
    createdAt: "",
  };
}

const PRODUCT_FIELDS = `
  id handle title description tags productType
  featuredImage { url altText }
  images(first: 10) { nodes { url altText } }
  options { name values }
  priceRange { minVariantPrice { amount currencyCode } }
  variants(first: 100) { nodes { id sku title availableForSale quantityAvailable price { amount currencyCode } compareAtPrice { amount currencyCode } selectedOptions { name value } } }
`;

export const shopifyProvider: CommerceProvider = {
  name: "shopify",
  async listProducts() {
    const data = await storefront<{ products: { nodes: SfProduct[] } }>(`{ products(first: 100) { nodes { ${PRODUCT_FIELDS} } } }`);
    return data.products.nodes.map(mapProduct);
  },
  async getProduct(handle) {
    const data = await storefront<{ product: SfProduct | null }>(`query($h:String!){ product(handle:$h){ ${PRODUCT_FIELDS} } }`, { h: handle });
    return data.product ? mapProduct(data.product) : null;
  },
  async listCollections() {
    const data = await storefront<{ collections: { nodes: { id: string; handle: string; title: string; description: string; image?: { url: string } | null }[] } }>(
      `{ collections(first: 20) { nodes { id handle title description image { url } } } }`,
    );
    return data.collections.nodes.map((c) => ({ id: c.id, handle: c.handle, title: c.title, tagline: "", description: c.description, image: c.image?.url ?? "", productHandles: [] })) as Collection[];
  },
  async getCollection(handle) {
    const data = await storefront<{ collection: { id: string; handle: string; title: string; description: string; image?: { url: string } | null; products: { nodes: SfProduct[] } } | null }>(
      `query($h:String!){ collection(handle:$h){ id handle title description image { url } products(first:100){ nodes { ${PRODUCT_FIELDS} } } } }`,
      { h: handle },
    );
    if (!data.collection) return null;
    const c = data.collection;
    const products = c.products.nodes.map(mapProduct);
    return { id: c.id, handle: c.handle, title: c.title, tagline: "", description: c.description, image: c.image?.url ?? "", productHandles: products.map((p) => p.handle), products };
  },
  async searchProducts(q) {
    const data = await storefront<{ products: { nodes: SfProduct[] } }>(`query($q:String!){ products(first: 50, query:$q) { nodes { ${PRODUCT_FIELDS} } } }`, { q });
    return data.products.nodes.map(mapProduct);
  },
  async shippingMethods(): Promise<ShippingMethod[]> {
    // Avec Shopify, la livraison est calculée dans le checkout Shopify.
    return [];
  },
  async createOrder(): Promise<Order> {
    // Avec Shopify, on crée un Cart (cartCreate) puis on redirige vers checkoutUrl.
    // Voir src/app/api/checkout/shopify/route.ts (à implémenter lors de la connexion).
    throw new CommerceError("Avec Shopify, le paiement passe par le checkout Shopify (cartCreate → checkoutUrl).", "UNAVAILABLE");
  },
  async listOrders() {
    if (!shopifyAdminConfigured) return [];
    // Admin API REST : GET /admin/api/{version}/orders.json?status=any — à mapper vers Order.
    return [];
  },
  async getOrder() {
    return null;
  },
  async updateOrder() {
    return null;
  },
  async updateProduct() {
    return null;
  },
  async setVariantStock() {
    return null;
  },
};
