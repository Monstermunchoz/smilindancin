import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin/auth";
import { commerce } from "@/lib/commerce";
import { readTable } from "@/lib/db";
import { formatPrice, formatDate } from "@/lib/format";
import { PageTitle, Stat, Card, StatusBadge, Empty } from "@/components/admin/ui";
import { BarChart } from "@/components/admin/BarChart";
import { shopifyConfigured } from "@/lib/commerce/shopify";

export default async function Dashboard() {
  if (!(await isAdmin())) redirect("/admin/login");
  const [orders, products, newsletter, messages] = await Promise.all([commerce.listOrders(), commerce.listProducts({ includeDrafts: true }), readTable("newsletter"), readTable("contact")]);
  const live = orders.filter((o) => o.status !== "cancelled" && o.status !== "refunded");
  const revenue = live.reduce((s, o) => s + o.total.amount, 0);
  const paid = orders.filter((o) => o.paymentStatus === "paid").reduce((s, o) => s + o.total.amount, 0);
  const avg = live.length ? revenue / live.length : 0;
  const pending = orders.filter((o) => o.status === "pending_payment").length;
  const toShip = orders.filter((o) => o.status === "paid" || o.status === "preparing").length;
  const days = Array.from({ length: 14 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - (13 - i)); return d; });
  const chart = days.map((d) => { const k = d.toISOString().slice(0, 10); return { label: d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" }), value: live.filter((o) => o.createdAt.slice(0, 10) === k).reduce((s, o) => s + o.total.amount, 0) }; });
  const lowStock = products.flatMap((p) => p.variants.filter((v) => v.stock !== null && v.stock <= 2).map((v) => ({ p, v })));
  const top = Object.values(live.flatMap((o) => o.lines).reduce<Record<string, { title: string; qty: number; total: number }>>((acc, l) => { const k = l.productTitle; acc[k] = acc[k] ?? { title: k, qty: 0, total: 0 }; acc[k].qty += l.quantity; acc[k].total += l.lineTotal.amount; return acc; }, {})).sort((a, b) => b.qty - a.qty).slice(0, 5);
  const unread = messages.filter((m) => !m.read).length;

  return (
    <div>
      <PageTitle title="Tableau de bord" sub={`${formatDate(new Date().toISOString(), { weekday: "long", day: "numeric", month: "long" })} · moteur : ${shopifyConfigured ? "Shopify" : "local (démo)"}`} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <Stat label="Chiffre d'affaires" value={formatPrice(revenue)} hint={`${formatPrice(paid)} encaissés`} href="/admin/orders" />
        <Stat label="Commandes" value={String(live.length)} hint={`${pending} en attente de paiement`} href="/admin/orders" />
        <Stat label="Panier moyen" value={formatPrice(avg)} hint="hors annulées" />
        <Stat label="À expédier" value={String(toShip)} hint="payées + en préparation" href="/admin/orders?status=paid" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mt-3 md:mt-4">
        <Stat label="Produits actifs" value={String(products.filter((p) => p.status === "active").length)} hint={`${products.filter((p) => p.status === "coming_soon").length} à venir`} href="/admin/products" />
        <Stat label="Variantes" value={String(products.reduce((n, p) => n + p.variants.length, 0))} hint={`${lowStock.length} en stock faible`} href="/admin/stock" />
        <Stat label="Newsletter" value={String(newsletter.length)} hint="inscrit·e·s" href="/admin/newsletter" />
        <Stat label="Messages" value={String(unread)} hint="non lus" href="/admin/messages" />
      </div>

      <div className="grid lg:grid-cols-[1.3fr_1fr] gap-4 mt-6">
        <Card title="Ventes — 14 derniers jours">
          <BarChart data={chart} format={(v) => formatPrice(v)} />
        </Card>
        <Card title="Meilleures ventes">
          {top.length === 0 ? <Empty text="Aucune vente pour le moment." /> : (
            <ul className="divide-y divide-white/10">{top.map((t) => <li key={t.title} className="py-2.5 flex justify-between text-sm"><span className="truncate pr-4">{t.title}</span><span className="tabular-nums text-white/70">{t.qty} · {formatPrice(t.total)}</span></li>)}</ul>
          )}
        </Card>
      </div>

      <div className="grid lg:grid-cols-[1.3fr_1fr] gap-4 mt-4">
        <Card title="Dernières commandes">
          {orders.length === 0 ? <Empty text="Aucune commande. Passez une commande test depuis le site pour la voir apparaître ici." /> : (
            <table className="w-full text-sm">
              <tbody className="divide-y divide-white/10">
                {orders.slice(0, 6).map((o) => (
                  <tr key={o.id}>
                    <td className="py-2.5 pr-3"><Link href={`/admin/orders/${o.id}`} className="t-dot hover:text-blue-sky">{o.id}</Link></td>
                    <td className="py-2.5 pr-3 text-white/70 truncate max-w-[160px]">{o.customer.firstName} {o.customer.lastName}</td>
                    <td className="py-2.5 pr-3"><StatusBadge s={o.status} /></td>
                    <td className="py-2.5 text-right tabular-nums">{formatPrice(o.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <Link href="/admin/orders" className="inline-block mt-4 text-xs text-white/60 hover:text-white u-line">Toutes les commandes</Link>
        </Card>
        <Card title="Stock faible">
          {lowStock.length === 0 ? <Empty text="Aucune alerte. Les variantes sans stock saisi sont « à la demande »." /> : (
            <ul className="divide-y divide-white/10 text-sm">{lowStock.slice(0, 8).map(({ p, v }) => <li key={v.id} className="py-2 flex justify-between gap-3"><span className="truncate">{p.title} · {v.title}</span><span className={v.stock === 0 ? "text-pink" : "text-yellow-300"}>{v.stock}</span></li>)}</ul>
          )}
        </Card>
      </div>
    </div>
  );
}
