import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { isAdmin } from "@/lib/admin/auth";
import { readTable, writeTable, withLock } from "@/lib/db";
import { sanitize, buildVariants, uniqueHandle } from "@/lib/admin/products";
import type { Product } from "@/lib/commerce/types";

export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const inp = sanitize(await req.json().catch(() => ({})));
  if (!inp.title) return NextResponse.json({ error: "Le nom du produit est obligatoire" }, { status: 400 });
  if (inp.status === "active" && !inp.price) return NextResponse.json({ error: "Indique un prix pour mettre le produit en vente" }, { status: 400 });
  if (inp.status === "active" && !inp.images.length) return NextResponse.json({ error: "Ajoute au moins une photo pour mettre le produit en vente" }, { status: 400 });
  const product = await withLock(async () => {
    const products = await readTable("products");
    const id = `p-${randomUUID().slice(0, 8)}`;
    const p: Product = {
      id,
      handle: uniqueHandle(inp.title, products.map((x) => x.handle)),
      title: inp.title,
      subtitle: inp.subtitle,
      description: inp.description,
      details: inp.details,
      category: inp.category,
      collection: inp.collection,
      tags: inp.tags,
      images: inp.images,
      colors: inp.colors.length ? inp.colors : [{ name: "Unique", hex: "#111114" }],
      sizes: inp.sizes.length ? inp.sizes : ["TU"],
      variants: inp.status === "coming_soon" ? [] : buildVariants(id, inp),
      price: { amount: inp.price, currency: "EUR" },
      compareAtPrice: inp.compareAt ? { amount: inp.compareAt, currency: "EUR" } : null,
      status: inp.status,
      featured: inp.featured,
      preorder: inp.preorder,
      custom: true,
      demo: false,
      provenance: "Ajouté depuis l'espace admin",
      createdAt: new Date().toISOString().slice(0, 10),
    };
    products.unshift(p);
    await writeTable("products", products);
    return p;
  });
  return NextResponse.json({ product });
}
