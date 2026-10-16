import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin/auth";
import { commerce } from "@/lib/commerce";
import { formatPrice } from "@/lib/format";
import { PageTitle } from "@/components/admin/ui";
const STATUS_LABEL: Record<string, string> = { active: "Actif", draft: "Brouillon", archived: "Archivé", coming_soon: "À venir" };
export default async function ProductsAdmin() {
  if (!(await isAdmin())) redirect("/admin/login");
  const products = await commerce.listProducts({ includeDrafts: true });
  return (
    <div>
      <PageTitle title="Produits" sub={`${products.length} produits · ${products.reduce((n, p) => n + p.variants.length, 0)} variantes · source : Instagram @smilin.dancin (post collection 2024-2025)`} />
      <div className="overflow-x-auto border border-white/10 rounded-[4px]">
        <table className="w-full text-sm min-w-[720px]">
          <thead><tr className="t-label text-white/45 text-left border-b border-white/10"><th className="px-4 py-3">Produit</th><th className="px-4 py-3">Catégorie</th><th className="px-4 py-3">Collection</th><th className="px-4 py-3">Variantes</th><th className="px-4 py-3">Prix</th><th className="px-4 py-3">Statut</th><th className="px-4 py-3">Mis en avant</th></tr></thead>
          <tbody className="divide-y divide-white/10">
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-white/[0.03]">
                <td className="px-4 py-2.5"><Link href={`/admin/products/${p.id}`} className="flex items-center gap-3 hover:text-blue-sky"><span className="relative w-9 aspect-[4/5] overflow-hidden rounded-[2px] shrink-0 bg-ink-2"><Image src={p.images[0]?.src} alt="" fill sizes="36px" className="object-cover" /></span><span><span className="block font-semibold">{p.title}</span><span className="block text-xs text-white/45">{p.subtitle}</span></span></Link></td>
                <td className="px-4 py-2.5 text-white/70">{p.category}</td>
                <td className="px-4 py-2.5 text-white/70">{p.collection}</td>
                <td className="px-4 py-2.5 tabular-nums text-white/70">{p.variants.length}</td>
                <td className="px-4 py-2.5 tabular-nums">{p.variants.length ? `${formatPrice(Math.min(...p.variants.map((v) => v.price.amount)))}${p.category === "tee" ? " à " + formatPrice(Math.max(...p.variants.map((v) => v.price.amount))) : ""}` : <span className="text-white/40">à confirmer</span>}</td>
                <td className="px-4 py-2.5"><span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${p.status === "active" ? "bg-emerald-400/15 text-emerald-300" : p.status === "coming_soon" ? "bg-blue-sky/15 text-blue-sky" : "bg-white/10 text-white/60"}`}>{STATUS_LABEL[p.status]}</span></td>
                <td className="px-4 py-2.5">{p.featured ? "★" : <span className="text-white/25">·</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
