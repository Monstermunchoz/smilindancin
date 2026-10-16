import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin/auth";
import { readTable } from "@/lib/db";
import { ticketedEvents, tierViews } from "@/lib/tickets/service";
import { formatPrice, formatDate } from "@/lib/format";
import { PageTitle, Stat, Card, Empty } from "@/components/admin/ui";
import { TierEditor } from "@/components/admin/TierEditor";

export default async function AdminBilletterie() {
  if (!(await isAdmin())) redirect("/admin/login");
  const [sales, tOrders, tickets] = await Promise.all([readTable("tierSales"), readTable("ticketOrders"), readTable("tickets")]);
  const events = ticketedEvents();
  const paid = tOrders.filter((o) => o.status === "paid");
  return (
    <div>
      <PageTitle title="Billetterie" sub="Tarifs progressifs : chaque tarif ouvre quand le précédent est épuisé." action={<Link href="/admin/checkin" className="btn btn-primary !py-2.5">Scanner les billets</Link>} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
        <Stat label="CA billetterie" value={formatPrice(paid.reduce((s, o) => s + o.total, 0))} hint={`${paid.length} commande(s) payée(s)`} />
        <Stat label="Billets émis" value={String(tickets.filter((t) => t.status !== "cancelled").length)} />
        <Stat label="Entrées validées" value={String(tickets.filter((t) => t.status === "used").length)} />
        <Stat label="Paiements en attente" value={String(tOrders.filter((o) => o.status === "pending_payment").length)} hint="places réservées" />
      </div>
      {events.map((e) => {
        const views = tierViews(e, sales);
        const sold = views.reduce((n, v) => n + v.sold, 0);
        const quota = views.reduce((n, v) => n + v.quota, 0);
        return (
          <Card key={e.slug} title={`${e.title}, ${e.dateLabel}${e.ticketing?.demo ? " · démo" : ""}`} className="mb-4">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <p className="text-sm text-white/70">{sold} / {quota} places · remplissage {Math.round((sold / Math.max(1, quota)) * 100)}%</p>
              <Link href={`/billetterie/${e.slug}`} target="_blank" className="text-xs u-line">Voir la page publique</Link>
            </div>
            <div className="overflow-x-auto -mx-5"><table className="w-full text-sm min-w-[720px]">
              <thead><tr className="t-label text-white/45 text-left border-b border-white/10"><th className="px-4 py-2">Tarif</th><th className="px-4 py-2">Prix</th><th className="px-4 py-2">Quota</th><th className="px-4 py-2">Ventes</th><th className="px-4 py-2">CA</th><th className="px-4 py-2"></th></tr></thead>
              <tbody className="divide-y divide-white/10">{views.map((v) => <TierEditor key={v.id} eventSlug={e.slug} tier={v} />)}</tbody>
            </table></div>
          </Card>
        );
      })}
      <Card title="Dernières commandes de billets">
        {tOrders.length === 0 ? <Empty text="Aucune commande de billets." /> : (
          <div className="overflow-x-auto -mx-5"><table className="w-full text-sm min-w-[640px]">
            <tbody className="divide-y divide-white/10">{tOrders.slice(0, 25).map((o) => (
              <tr key={o.id}>
                <td className="px-4 py-2.5 t-dot">{o.id}</td>
                <td className="px-4 py-2.5 text-white/60">{formatDate(o.createdAt, { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}</td>
                <td className="px-4 py-2.5">{o.firstName} {o.lastName}<p className="text-xs text-white/45">{o.email}</p></td>
                <td className="px-4 py-2.5 text-white/70 text-xs">{o.items.map((i) => `${i.tierName} ×${i.quantity}`).join(", ")}</td>
                <td className="px-4 py-2.5 text-xs">{o.status === "paid" ? <span className="text-emerald-300">Payée</span> : o.status === "pending_payment" ? <span className="text-yellow-300">En attente</span> : o.status}</td>
                <td className="px-4 py-2.5 text-right tabular-nums font-semibold">{formatPrice(o.total)}</td>
                <td className="px-4 py-2.5 text-right">{o.status === "paid" && <Link href={`/billets/${o.id}?k=${o.accessKey}`} target="_blank" className="text-xs u-line">Billets</Link>}</td>
              </tr>
            ))}</tbody>
          </table></div>
        )}
      </Card>
    </div>
  );
}
