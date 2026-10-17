import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin/auth";
import { commerce } from "@/lib/commerce";
import { COLLECTIONS } from "@/lib/data/products";
import { PageTitle } from "@/components/admin/ui";
import { ProductForm } from "@/components/admin/ProductForm";
import { StockEditor } from "@/components/admin/StockEditor";
export default async function ProductAdmin({ params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) redirect("/admin/login");
  const { id } = await params;
  const p = (await commerce.listProducts({ includeDrafts: true })).find((x) => x.id === id);
  if (!p) notFound();
  return (
    <div>
      <Link href="/admin/products" className="text-xs text-white/50 hover:text-white">← Shop</Link>
      <PageTitle title={p.title} sub={p.subtitle} action={<Link href={`/shop/${p.handle}`} target="_blank" className="btn btn-ghost !py-2.5">Voir la fiche</Link>} />
      <ProductForm product={p} collections={COLLECTIONS.map((c) => ({ handle: c.handle, title: c.title }))} />
      <StockEditor product={p} />
    </div>
  );
}
