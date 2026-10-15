import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { commerce } from "@/lib/commerce";
import { ShopGrid } from "@/components/shop/ShopGrid";
export const dynamic = "force-dynamic";
export async function generateMetadata({ params }: { params: Promise<{ handle: string }> }): Promise<Metadata> {
  const { handle } = await params;
  const c = await commerce.getCollection(handle);
  return c ? { title: c.title, description: c.description } : {};
}
export default async function CollectionPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const c = await commerce.getCollection(handle);
  if (!c) notFound();
  return <ShopGrid products={c.products} title={c.title} intro={c.description} />;
}
