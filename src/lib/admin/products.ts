import type { Product, Variant } from "@/lib/commerce/types";
import { slug } from "@/lib/data/products";

export type ProductInput = {
  title: string;
  subtitle: string;
  description: string;
  category: Product["category"];
  collection: string;
  status: Product["status"];
  featured: boolean;
  preorder: boolean;
  price: number; // centimes
  compareAt: number | null;
  sizes: string[];
  colors: { name: string; hex: string }[];
  details: string[];
  tags: string[];
  images: Product["images"];
  stock: number | null; // stock par variante à la création (null = à la demande)
};

const CATS: Product["category"][] = ["tee", "hoodie", "cap", "tote", "accessory"];
const STATUSES: Product["status"][] = ["active", "draft", "archived", "coming_soon"];

export function sanitize(b: Record<string, unknown>): ProductInput {
  const s = (v: unknown, m: number) => (typeof v === "string" ? v.trim().slice(0, m) : "");
  const arr = (v: unknown, m: number, n = 40) => (Array.isArray(v) ? v.map((x) => s(x, m)).filter(Boolean).slice(0, n) : []);
  const colors = Array.isArray(b.colors)
    ? (b.colors as Record<string, unknown>[]).map((c) => ({ name: s(c?.name, 40), hex: /^#[0-9a-f]{6}$/i.test(String(c?.hex)) ? String(c.hex) : "#111114" })).filter((c) => c.name).slice(0, 12)
    : [];
  const images = Array.isArray(b.images)
    ? (b.images as Record<string, unknown>[])
        .map((im) => ({ src: s(im?.src, 300), alt: s(im?.alt, 200), kind: (["photo", "worn", "mockup"].includes(String(im?.kind)) ? im.kind : "photo") as Product["images"][number]["kind"], ...(["front", "back", "detail", "worn"].includes(String(im?.view)) ? { view: im.view as Product["images"][number]["view"] } : {}) }))
        .filter((im) => im.src.startsWith("/"))
        .slice(0, 12)
    : [];
  const price = Math.max(0, Math.round(Number(b.price) || 0));
  return {
    title: s(b.title, 120),
    subtitle: s(b.subtitle, 160),
    description: s(b.description, 4000),
    category: CATS.includes(b.category as Product["category"]) ? (b.category as Product["category"]) : "tee",
    collection: s(b.collection, 60) || "smilers-dancers",
    status: STATUSES.includes(b.status as Product["status"]) ? (b.status as Product["status"]) : "draft",
    featured: Boolean(b.featured),
    preorder: Boolean(b.preorder),
    price,
    compareAt: b.compareAt ? Math.max(0, Math.round(Number(b.compareAt))) || null : null,
    sizes: arr(b.sizes, 12, 12),
    colors,
    details: arr(b.details, 200, 20),
    tags: arr(b.tags, 40, 20),
    images,
    stock: b.stock === null || b.stock === "" || b.stock === undefined ? null : Math.max(0, Math.floor(Number(b.stock) || 0)),
  };
}

/** Variantes couleurs × tailles. Conserve le stock des variantes existantes quand on modifie. */
export function buildVariants(id: string, inp: ProductInput, previous: Variant[] = []): Variant[] {
  const sizes = inp.sizes.length ? inp.sizes : ["TU"];
  const colors = inp.colors.length ? inp.colors : [{ name: "Unique", hex: "#111114" }];
  const out: Variant[] = [];
  for (const c of colors) {
    for (const size of sizes) {
      const vid = `${id}--hoodie--${slug(c.name)}--${slug(size)}`;
      const prev = previous.find((v) => v.id === vid);
      const stock = prev ? prev.stock : inp.stock;
      out.push({
        id: vid,
        sku: `SD-${id.slice(-6).toUpperCase()}-${slug(c.name).slice(0, 3).toUpperCase()}-${slug(size).toUpperCase()}`,
        title: `${c.name} / ${size}`,
        options: [{ name: "Couleur", value: c.name }, { name: "Taille", value: size }],
        price: { amount: inp.price, currency: "EUR" },
        compareAtPrice: inp.compareAt ? { amount: inp.compareAt, currency: "EUR" } : null,
        available: stock === null ? true : stock > 0,
        stock,
      });
    }
  }
  return out;
}

export function uniqueHandle(title: string, taken: string[]) {
  const base = slug(title) || "produit";
  let h = base, i = 2;
  while (taken.includes(h)) h = `${base}-${i++}`;
  return h;
}
