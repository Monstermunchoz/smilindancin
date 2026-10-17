import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin/auth";
import { COLLECTIONS } from "@/lib/data/products";
import { PageTitle } from "@/components/admin/ui";
import { ProductForm } from "@/components/admin/ProductForm";
export default async function NewProduct() {
  if (!(await isAdmin())) redirect("/admin/login");
  return (
    <div>
      <Link href="/admin/products" className="text-xs text-white/50 hover:text-white">← Shop</Link>
      <PageTitle title="Nouveau produit" sub="Photos, fiche, tailles, couleurs, prix et visibilité." />
      <ProductForm collections={COLLECTIONS.map((c) => ({ handle: c.handle, title: c.title }))} />
    </div>
  );
}
