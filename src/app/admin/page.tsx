import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin/auth";
import { commerce } from "@/lib/commerce";
import { readTable, dbMode } from "@/lib/db";
import { ticketedEvents, tierViews } from "@/lib/tickets/service";
import { formatPrice, formatDate } from "@/lib/format";
import { PageTitle, Stat, Card, StatusBadge, Empty } from "@/components/admin/ui";
import { DualBars } from "@/components/admin/DualBars";
import { stripeConfigured } from "@/lib/stripe";

export default async function Dashboard() {
  if (!(await isAdmin())) redirect("/admin/login");
  const [orders, products, newsletter, messages, tOrders, tickets, sales, users] = await Promise.all([
    commerce.listOrders(), commerce.listProducts({ includeDrafts: true }), readTable("newsletter"), readTable("contact"), readTable("ticketOrders"), readTable("tickets"), readTable("tierSales"), readTable("users"),
  ]);
  const shopPaid = orders.filter((o) => o.paymentStatus === "paid");
  const shopRevenue = shopPaid.reduce((s, o) => s + o.total.amount, 0);
  const tPaid = tOrders.filter((o) => o.status === "paid");
  const tRevenue = tPaid.reduce((s, o) => s + o.total, 0);
  const preorders = orders.filter((o) => o.lines.some((l) => l.productTitle.includes("précommande")) && o.status !== "cancelled");
  const toShip = orders.filter((o) => o.status === "paid" || o.status === "preparing").length;
  const itemsSold = shopPaid.reduce((n, o) => n + o.lines.reduce((m, l) => m + l.quantity, 0), 0);
  const validTickets = tickets.filter((t) => t.status !== "cancelled");
  const checked = tickets.filter((t) => t.status === "used").length;

  const days = Array.from({ length: 14 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - (13 - i)); return d; });
  const chart = days.map((d) => {
    const k = d.toISOString().slice(0, 10);
    return { label: d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" }), shop: shopPaid.filter((o) => o.createdAt.slice(0, 10) === k).reduce((s, o) => s + o.total.amount, 0), tickets: tPaid.filter((o) => (o.paidAt ?? o.createdAt).slice(0, 10) === k).reduce((s, o) => s + o.total, 0) };
  });
  const top = Object.values(shopPaid.flatMap((o) => o.lines).reduce<Record<string, { title: string; qty: number; total: number }>>((acc, l) => { const k = l.productTitle; acc[k] = acc[k] ?? { title: k, qty: 0, total: 0 }; acc[k].qty += l.quantity; acc[k].total += l.lineTotal.amount; return acc; }, {})).sort((a, b) => b.qty - a.qty).slice(0, 6);
  const events = ticketedEvents().map((e) => ({ e, v: tierViews(e, sales) }));
  const lowStock = products.flatMap((p) => p.variants.filter((v) => v.stock !== null && v.stock <= 2).map((v) => ({ p, v })));
  const feed = [
    ...orders.map((o) => ({ at: o.createdAt, kind: "Shop", id: o.id, who: `${o.customer.firstName} ${o.customer.lastName}`, amount: o.total.amount, paid: o.paymentStatus === "paid", href: `/admin/orders/${o.id}` })),
    ...tOrders.map((o) => ({ at: o.createdAt, kind: "Billets", id: o.id, who: `${o.firstName} ${o.lastName}`, amount: o.total, paid: o.status === "paid", href: "/admin/billetterie" })),
  ].sort((a, b) => b.at.localeCompare(a.at)).slice(0, 10);

  return (
    <div>
      <PageTitle title="Tableau de bord" sub={`${formatDate(new Date().toISOString(), { weekday: "long", day: "numeric", month: "long" })} · paiement ${stripeConfigured ? "Stripe" : "démo"} · données ${dbMode === "postgres" ? "Supabase" : dbMode === "redis" ? "Upstash Redis" : dbMode === "file" ? "locales" : "éphémères ⚠︎ (connecter Supabase)"}`} />

      <div className="relative overflow-hidden rounded-[6px] g-brand grain p-6 md:p-8 mb-4">
        <p className="t-label text-white/80">Chiffre d'affaires encaissé</p>
        <p className="t-dot text-5xl md:text-6xl mt-2 tabular-nums">{formatPrice(shopRevenue + tRevenue)}</p>
        <div className="flex flex-wrap gap-x-8 gap-y-2 mt-4 text-sm text-white/85">
          <span>Vêtements <b className="tabular-nums">{formatPrice(shopRevenue)}</b></span>
          <span>Billetterie <b className="tabular-nums">{formatPrice(tRevenue)}</b></span>
          <span>Clients inscrits <b>{users.length}</b></span>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <Stat label="Commandes shop" value={String(orders.length)} hint={`${shopPaid.length} payées · ${itemsSold} pièces`} href="/admin/orders" />
        <Stat label="À expédier" value={String(toShip)} hint={`${preorders.length} précommande(s)`} href="/admin/orders?status=paid" />
        <Stat label="Billets vendus" value={String(validTickets.length)} hint={`${tPaid.length} commande(s)`} href="/admin/billetterie" />
        <Stat label="Entrées validées" value={`${checked}`} hint={`sur ${validTickets.length} billets`} href="/admin/checkin" />
      </div>

      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-4 mt-4">
        <Card title="Ventes, 14 derniers jours"><DualBars data={chart} format={(v) => formatPrice(v)} /></Card>
        <Card title="Jauges billetterie">
          {events.map(({ e, v }) => (
            <div key={e.slug} className="mb-4 last:mb-0">
              <p className="text-sm font-semibold mb-2">{e.title}{e.ticketing?.demo ? <span className="text-white/40 font-normal"> · démo</span> : null}</p>
              {v.map((t) => (
                <div key={t.id} className="mb-2">
                  <div className="flex justify-between text-xs text-white/70 mb-1"><span>{t.name} <span className="text-white/40">{formatPrice(t.price)}</span></span><span className="tabular-nums">{t.sold}/{t.quota}{t.status === "sold_out" ? " · SOLD OUT" : t.status === "upcoming" ? " · en attente" : ""}</span></div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden"><div className="h-full g-brand" style={{ width: `${t.progress * 100}%` }} /></div>
                </div>
              ))}
            </div>
          ))}
        </Card>
      </div>

      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-4 mt-4">
        <Card title="Activité récente">
          {feed.length === 0 ? <Empty text="Aucune vente pour l'instant. Passe une commande ou réserve un billet depuis le site pour la voir ici." /> : (
            <div className="overflow-x-auto -mx-5"><table className="w-full text-sm min-w-[520px]"><tbody className="divide-y divide-white/10">
              {feed.map((f) => (
                <tr key={f.id}>
                  <td className="px-5 py-2.5"><span className={`t-label text-[10px] px-2 py-1 rounded-full ${f.kind === "Shop" ? "bg-blue/30" : "bg-pink/30"}`}>{f.kind}</span></td>
                  <td className="px-2 py-2.5"><Link href={f.href} className="t-dot hover:text-blue-sky">{f.id}</Link></td>
                  <td className="px-2 py-2.5 text-white/70 truncate max-w-[140px]">{f.who}</td>
                  <td className="px-2 py-2.5 text-xs">{f.paid ? <span className="text-emerald-300">Payé</span> : <span className="text-yellow-300">En attente</span>}</td>
                  <td className="px-5 py-2.5 text-right tabular-nums">{formatPrice(f.amount)}</td>
                </tr>
              ))}
            </tbody></table></div>
          )}
        </Card>
        <Card title="Meilleures ventes vêtements">
          {top.length === 0 ? <Empty text="Aucune vente." /> : <ul className="divide-y divide-white/10">{top.map((t) => <li key={t.title} className="py-2.5 flex justify-between text-sm gap-3"><span className="truncate">{t.title}</span><span className="tabular-nums text-white/70 shrink-0">{t.qty} · {formatPrice(t.total)}</span></li>)}</ul>}
        </Card>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mt-4">
        <Stat label="Produits actifs" value={String(products.filter((p) => p.status === "active").length)} hint={`${products.filter((p) => p.preorder).length} en précommande`} href="/admin/products" />
        <Stat label="Stock faible" value={String(lowStock.length)} hint="variantes ≤ 2" href="/admin/stock" />
        <Stat label="Newsletter" value={String(newsletter.length)} hint="inscrit·e·s" href="/admin/newsletter" />
        <Stat label="Messages" value={String(messages.filter((m) => !m.read).length)} hint="non lus" href="/admin/messages" />
      </div>

      {orders.length > 0 && (
        <Card title="Dernières commandes shop" className="mt-4">
          <div className="overflow-x-auto -mx-5"><table className="w-full text-sm min-w-[520px]"><tbody className="divide-y divide-white/10">
            {orders.slice(0, 6).map((o) => (
              <tr key={o.id}><td className="px-5 py-2.5"><Link href={`/admin/orders/${o.id}`} className="t-dot hover:text-blue-sky">{o.id}</Link></td><td className="px-2 py-2.5 text-white/70">{o.customer.firstName} {o.customer.lastName}</td><td className="px-2 py-2.5"><StatusBadge s={o.status} /></td><td className="px-5 py-2.5 text-right tabular-nums">{formatPrice(o.total)}</td></tr>
            ))}
          </tbody></table></div>
        </Card>
      )}
    </div>
  );
}
