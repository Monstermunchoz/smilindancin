import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin/auth";
import { commerce } from "@/lib/commerce";
import { PageTitle } from "@/components/admin/ui";
import { ProductList } from "@/components/admin/ProductList";
export default async function ProductsAdmin() {
  if (!(await isAdmin())) redirect("/admin/login");
  const [products, orders] = await Promise.all([commerce.listProducts({ includeDrafts: true }), commerce.listOrders()]);
  const sold: Record<string, number> = {};
  for (const o of orders) if (o.paymentStatus === "paid") for (const l of o.lines) sold[l.productHandle] = (sold[l.productHandle] ?? 0) + l.quantity;
  return (
    <div>
      <PageTitle title="Shop" sub={`${products.length} produits · ${products.filter((p) => p.status === "active").length} en vente`} action={<Link href="/admin/products/new" className="btn btn-brand !py-3">+ Ajouter un produit</Link>} />
      <ProductList products={products} sold={sold} />
    </div>
  );
}
