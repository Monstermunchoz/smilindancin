import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin/auth";
import { commerce } from "@/lib/commerce";
import { formatPrice } from "@/lib/format";
import { PageTitle, Empty } from "@/components/admin/ui";

/** Détail du merch vendu : par produit, puis par variante (coupe, couleur, taille). */
export default async function Ventes() {
  if (!(await isAdmin())) redirect("/admin/login");
  const [orders, products] = await Promise.all([commerce.listOrders(), commerce.listProducts({ includeDrafts: true })]);
  const paid = orders.filter((o) => o.paymentStatus === "paid");
  type Row = { handle: string; title: string; image: string; qty: number; total: number; orders: Set<string>; variants: Record<string, number>; sizes: Record<string, number>; colors: Record<string, number> };
  const map: Record<string, Row> = {};
  for (const o of paid) for (const l of o.lines) {
    const r = (map[l.productHandle] ??= { handle: l.productHandle, title: l.productTitle, image: l.image, qty: 0, total: 0, orders: new Set(), variants: {}, sizes: {}, colors: {} });
    r.qty += l.quantity;
    r.total += l.lineTotal.amount;
    r.orders.add(o.id);
    r.variants[l.variantTitle] = (r.variants[l.variantTitle] ?? 0) + l.quantity;
    const size = l.options.find((x) => x.name === "Taille")?.value;
    const color = l.options.find((x) => x.name === "Couleur")?.value;
    if (size) r.sizes[size] = (r.sizes[size] ?? 0) + l.quantity;
    if (color) r.colors[color] = (r.colors[color] ?? 0) + l.quantity;
  }
  const rows = Object.values(map).sort((a, b) => b.qty - a.qty);
  const pieces = rows.reduce((n, r) => n + r.qty, 0);
  const ca = rows.reduce((n, r) => n + r.total, 0);
  const allSizes: Record<string, number> = {};
  rows.forEach((r) => Object.entries(r.sizes).forEach(([k, v]) => (allSizes[k] = (allSizes[k] ?? 0) + v)));
  const sizeOrder = ["XS", "S", "M", "L", "XL", "XXL", "TU"];
  const maxSize = Math.max(1, ...Object.values(allSizes));
  const pid = (h: string) => products.find((p) => p.handle === h)?.id;

  return (
    <div>
      <Link href="/admin" className="text-xs text-white/50 hover:text-white">← Tableau de bord</Link>
      <PageTitle title="Merch vendu" sub={`${pieces} pièce${pieces > 1 ? "s" : ""} · ${formatPrice(ca)} · ${paid.length} commande${paid.length > 1 ? "s" : ""} payée${paid.length > 1 ? "s" : ""}`} action={<Link href="/admin/orders" className="btn btn-ghost !py-2.5">Toutes les commandes</Link>} />
      {rows.length === 0 ? <Empty text="Aucune pièce vendue pour l'instant." /> : (
        <>
          <section className="border border-white/10 rounded-[16px] p-5 bg-white/[.02] mb-4">
            <p className="t-label text-white/50 mb-4">Tailles les plus vendues</p>
            <div className="flex items-end gap-2 sm:gap-4 h-32">
              {sizeOrder.filter((s) => allSizes[s]).map((s) => (
                <div key={s} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                  <span className="text-xs tabular-nums text-white/70">{allSizes[s]}</span>
                  <span className="w-full max-w-12 rounded-t-[6px] g-brand" style={{ height: `${(allSizes[s] / maxSize) * 100}%` }} />
                  <span className="text-xs font-semibold">{s}</span>
                </div>
              ))}
            </div>
          </section>
          <div className="space-y-2">
            {rows.map((r, i) => (
              <details key={r.handle} className="group border border-white/10 rounded-[16px] bg-white/[.02] open:border-white/25 overflow-hidden" open={i === 0}>
                <summary className="flex items-center gap-3 p-3.5 cursor-pointer list-none">
                  <span className="t-dot text-white/40 w-6 text-center shrink-0">{i + 1}</span>
                  <span className="relative w-12 aspect-[4/5] rounded-[8px] overflow-hidden bg-ink-2 shrink-0">{r.image && <Image src={r.image} alt="" fill sizes="48px" className="object-cover" />}</span>
                  <span className="flex-1 min-w-0">
                    <span className="block font-semibold truncate">{r.title}</span>
                    <span className="block text-xs text-white/50 mt-0.5">{r.orders.size} commande{r.orders.size > 1 ? "s" : ""}</span>
                  </span>
                  <span className="text-right shrink-0">
                    <span className="block t-dot text-xl tabular-nums">{r.qty}</span>
                    <span className="block text-xs text-white/55 tabular-nums">{formatPrice(r.total)}</span>
                  </span>
                  <span className="text-white/40 transition-transform group-open:rotate-180 shrink-0">▾</span>
                </summary>
                <div className="px-4 pb-4 pt-1 grid md:grid-cols-[1.4fr_1fr] gap-4">
                  <div>
                    <p className="t-label text-white/45 mb-2">Par variante</p>
                    <ul className="divide-y divide-white/10 text-sm">
                      {Object.entries(r.variants).sort((a, b) => b[1] - a[1]).map(([v, n]) => <li key={v} className="py-2 flex justify-between gap-3"><span className="truncate text-white/80">{v}</span><span className="tabular-nums shrink-0">{n}</span></li>)}
                    </ul>
                  </div>
                  <div className="space-y-3">
                    {Object.keys(r.colors).length > 0 && <div><p className="t-label text-white/45 mb-2">Couleurs</p><div className="flex flex-wrap gap-2">{Object.entries(r.colors).map(([c, n]) => <span key={c} className="rounded-full border border-white/15 px-3 py-1.5 text-xs">{c} · {n}</span>)}</div></div>}
                    <div className="flex flex-wrap gap-2 pt-1">
                      <Link href={`/admin/orders?q=${encodeURIComponent(r.handle)}`} className="btn btn-primary !py-2.5 !text-[11px]">Voir les commandes</Link>
                      {pid(r.handle) && <Link href={`/admin/products/${pid(r.handle)}`} className="btn btn-ghost !py-2.5 !text-[11px]">Fiche produit</Link>}
                    </div>
                  </div>
                </div>
              </details>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
