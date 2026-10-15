/**
 * Modèle de données commerce — indépendant du moteur (local JSON ou Shopify).
 * Les montants sont en centimes d'euro (EUR).
 */

export type Money = { amount: number; currency: "EUR" };

export type ProductImage = {
  src: string;
  alt: string;
  /** "mockup" = graphisme réel posé sur silhouette neutre (généré) ; "photo" = photo réelle fournie. */
  kind: "mockup" | "photo" | "worn";
  view?: "front" | "back" | "detail" | "worn";
};

export type VariantOption = { name: "Taille" | "Couleur"; value: string };

export type Variant = {
  id: string;
  sku: string;
  title: string; // "Noir / M"
  options: VariantOption[];
  price: Money;
  compareAtPrice?: Money | null;
  available: boolean;
  stock: number | null; // null = inconnu (Shopify gère)
};

export type Product = {
  id: string;
  handle: string;
  title: string;
  subtitle?: string;
  description: string;
  details: string[]; // matière, grammage, impression…
  category: "tee" | "hoodie" | "cap" | "tote" | "accessory";
  collection: string; // handle
  tags: string[];
  images: ProductImage[];
  colors: { name: string; hex: string }[];
  sizes: string[];
  variants: Variant[];
  price: Money; // prix de départ
  compareAtPrice?: Money | null;
  status: "active" | "draft" | "archived" | "coming_soon";
  featured?: boolean;
  /** Vrai = données de démonstration (prix/tailles/stock non confirmés par la marque). */
  demo: boolean;
  /** Preuve d'existence du graphisme (fichier client / post). */
  provenance: string;
  createdAt: string;
};

export type Collection = {
  id: string;
  handle: string;
  title: string;
  tagline: string;
  description: string;
  image: string;
  productHandles: string[];
};

export type CartLine = {
  id: string; // variantId
  productHandle: string;
  productTitle: string;
  variantId: string;
  variantTitle: string;
  options: VariantOption[];
  image: string;
  unitPrice: Money;
  quantity: number;
  maxQuantity: number | null;
};

export type OrderStatus =
  | "pending_payment"
  | "paid"
  | "preparing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

export type Order = {
  id: string; // SD-2026-0001
  number: number;
  createdAt: string;
  updatedAt: string;
  status: OrderStatus;
  paymentStatus: "unpaid" | "paid" | "refunded";
  paymentProvider: "none" | "shopify" | "stripe";
  customer: {
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
  };
  shippingAddress: {
    line1: string;
    line2?: string;
    postalCode: string;
    city: string;
    country: string;
  };
  shippingMethod: { id: string; label: string; price: Money };
  lines: Array<CartLine & { lineTotal: Money }>;
  subtotal: Money;
  shipping: Money;
  total: Money;
  note?: string;
  timeline: Array<{ at: string; label: string; by: "client" | "admin" | "system" }>;
  source: "web" | "admin" | "shopify";
  demo: boolean;
};

export type ShippingMethod = {
  id: string;
  label: string;
  description: string;
  price: Money;
  eta: string;
};
