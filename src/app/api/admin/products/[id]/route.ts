import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin/auth";
import { commerce } from "@/lib/commerce";
import { readTable, writeTable, withLock, deleteFile } from "@/lib/db";
import { sanitize, buildVariants } from "@/lib/admin/products";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  if (body.variantId !== undefined && body.stock !== undefined) {
    const p = await commerce.setVariantStock(id, body.variantId, Number(body.stock));
    return p ? NextResponse.json({ product: p }) : NextResponse.json({ error: "Introuvable" }, { status: 404 });
  }
  const product = await withLock(async () => {
    const products = await readTable("products");
    const p = products.find((x) => x.id === id);
    if (!p) return null;
    const inp = sanitize({ ...p, price: p.price.amount, compareAt: p.compareAtPrice?.amount ?? null, ...body });
    Object.assign(p, {
      title: inp.title || p.title,
      subtitle: inp.subtitle,
      description: inp.description,
      details: inp.details,
      tags: inp.tags,
      images: inp.images.length ? inp.images : p.images,
      status: inp.status,
      featured: inp.featured,
      preorder: inp.preorder,
      price: { amount: inp.price, currency: "EUR" },
      compareAtPrice: inp.compareAt ? { amount: inp.compareAt, currency: "EUR" } : null,
    });
    if (p.custom) {
      // produits créés dans l'admin : catégorie, collection, couleurs, tailles et variantes modifiables
      Object.assign(p, { category: inp.category, collection: inp.collection, colors: inp.colors.length ? inp.colors : [{ name: "Unique", hex: "#111114" }], sizes: inp.sizes.length ? inp.sizes : ["TU"] });
      p.variants = inp.status === "coming_soon" ? [] : buildVariants(p.id, inp, p.variants);
    } else if (body.price !== undefined && p.variants.length && p.category !== "tee") {
      // produits du catalogue d'origine (sweats, accessoires) : le prix s'applique à toutes les variantes
      p.variants.forEach((v) => (v.price = { amount: inp.price, currency: "EUR" }));
    }
    await writeTable("products", products);
    return p;
  });
  return product ? NextResponse.json({ product }) : NextResponse.json({ error: "Introuvable" }, { status: 404 });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const { id } = await params;
  const removed = await withLock(async () => {
    const products = await readTable("products");
    const i = products.findIndex((x) => x.id === id);
    if (i < 0) return null;
    const [p] = products.splice(i, 1);
    await writeTable("products", products);
    return p;
  });
  if (!removed) return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  for (const im of removed.images) if (im.src.startsWith("/api/files/")) await deleteFile(im.src.split("/").pop()!);
  return NextResponse.json({ ok: true });
}
