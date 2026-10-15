import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin/auth";
import { commerce } from "@/lib/commerce";
import { PageTitle, Stat, Empty } from "@/components/admin/ui";
export default async function StockPage() {
  if (!(await isAdmin())) redirect("/admin/login");
  const products = await commerce.listProducts({ includeDrafts: true });
  const tracked = products.flatMap((p) => p.variants.filter((v) => v.stock !== null).map((v) => ({ p, v })));
  const onDemand = products.reduce((n, p) => n + p.variants.filter((v) => v.stock === null).length, 0);
  const out = tracked.filter((x) => x.v.stock === 0);
  const low = tracked.filter((x) => x.v.stock !== null && x.v.stock > 0 && x.v.stock <= 2);
  return (
    <div>
      <PageTitle title="Stock" sub="Les variantes sans stock saisi sont fabriquées à la demande." />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
        <Stat label="Variantes suivies" value={String(tracked.length)} /><Stat label="À la demande" value={String(onDemand)} /><Stat label="Épuisées" value={String(out.length)} /><Stat label="Stock faible" value={String(low.length)} />
      </div>
      {tracked.length === 0 ? <Empty text="Aucun stock saisi. Ouvrez un produit pour saisir des quantités par variante." /> : (
        <div className="overflow-x-auto border border-white/10 rounded-[4px]">
          <table className="w-full text-sm min-w-[600px]"><thead><tr className="t-label text-white/45 text-left border-b border-white/10"><th className="px-4 py-3">Produit</th><th className="px-4 py-3">Variante</th><th className="px-4 py-3">SKU</th><th className="px-4 py-3 text-right">Stock</th></tr></thead>
            <tbody className="divide-y divide-white/10">{tracked.sort((a, b) => (a.v.stock ?? 0) - (b.v.stock ?? 0)).map(({ p, v }) => <tr key={v.id}><td className="px-4 py-2.5"><Link href={`/admin/products/${p.id}`} className="hover:text-blue-sky">{p.title}</Link></td><td className="px-4 py-2.5 text-white/70">{v.title}</td><td className="px-4 py-2.5 t-dot text-xs text-white/45">{v.sku}</td><td className={`px-4 py-2.5 text-right tabular-nums font-semibold ${v.stock === 0 ? "text-pink" : (v.stock ?? 0) <= 2 ? "text-yellow-300" : ""}`}>{v.stock}</td></tr>)}</tbody></table>
        </div>
      )}
    </div>
  );
}
