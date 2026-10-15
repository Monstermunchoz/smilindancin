import Link from "next/link";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin/auth";
import { commerce } from "@/lib/commerce";
import { PageTitle } from "@/components/admin/ui";
import { ProductEditor } from "@/components/admin/ProductEditor";
export default async function ProductAdmin({ params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) redirect("/admin/login");
  const { id } = await params;
  const p = (await commerce.listProducts({ includeDrafts: true })).find((x) => x.id === id);
  if (!p) notFound();
  return (
    <div>
      <Link href="/admin/products" className="text-xs text-white/50 hover:text-white">← Produits</Link>
      <PageTitle title={p.title} sub={p.subtitle} action={<Link href={`/shop/${p.handle}`} target="_blank" className="btn btn-ghost !py-2.5">Voir la fiche</Link>} />
      <div className="flex gap-2 mb-6 overflow-x-auto">{p.images.map((im) => <div key={im.src} className="relative w-20 aspect-[4/5] shrink-0 overflow-hidden rounded-[2px]"><Image src={im.src} alt={im.alt} fill sizes="80px" className="object-cover" /></div>)}</div>
      <ProductEditor product={p} />
    </div>
  );
}
