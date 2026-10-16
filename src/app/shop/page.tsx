import type { Metadata } from "next";
import { commerce } from "@/lib/commerce";
import { ShopGrid } from "@/components/shop/ShopGrid";
export const metadata: Metadata = { title: "Shop", description: "T-shirts, sweats à capuche et accessoires Smilin' Dancin'. 9 visuels, Made in France, XS à XXL." };
export const dynamic = "force-dynamic";
export default async function ShopPage() {
  const products = await commerce.listProducts();
  return <ShopGrid products={products} title="Shop" intro="Smilers & Dancers Collection : 9 visuels, 6 coupes, sweats brodés. Et la nouvelle co' 2026." />;
}
