import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { commerce } from "@/lib/commerce";
import { ProductView } from "@/components/shop/ProductView";
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ handle: string }> }): Promise<Metadata> {
  const { handle } = await params;
  const p = await commerce.getProduct(handle);
  if (!p) return {};
  return { title: `${p.title} · ${p.category === "hoodie" ? "Sweat à capuche" : p.category === "tee" ? "T-shirt" : "Accessoire"}`, description: p.description, openGraph: { images: [p.images[0]?.src] } };
}

export default async function ProductPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const product = await commerce.getProduct(handle);
  if (!product || product.status === "draft" || product.status === "archived") notFound();
  const all = await commerce.listProducts();
  const visual = product.id.replace(/^(tee|hoodie)-/, "");
  const sibling = all.find((p) => p.id !== product.id && p.id.replace(/^(tee|hoodie)-/, "") === visual) ?? null;
  const related = all.filter((p) => p.id !== product.id && p.id !== sibling?.id && p.category === product.category).sort(() => 0.5 - Math.random());
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description,
    image: product.images.map((i) => i.src),
    brand: { "@type": "Brand", name: "Smilin' Dancin'" },
    offers: product.variants.length
      ? { "@type": "AggregateOffer", priceCurrency: "EUR", lowPrice: Math.min(...product.variants.map((v) => v.price.amount)) / 100, highPrice: Math.max(...product.variants.map((v) => v.price.amount)) / 100, availability: "https://schema.org/InStock" }
      : undefined,
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ProductView product={product} related={related} sibling={sibling} />
    </>
  );
}
