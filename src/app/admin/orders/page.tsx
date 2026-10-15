import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin/auth";
import { commerce } from "@/lib/commerce";
import { formatPrice, formatDate } from "@/lib/format";
import { PageTitle, StatusBadge, STATUS, Empty } from "@/components/admin/ui";
import type { OrderStatus } from "@/lib/commerce/types";

export default async function OrdersPage({ searchParams }: { searchParams: Promise<{ status?: string; q?: string }> }) {
  if (!(await isAdmin())) redirect("/admin/login");
  const { status, q } = await searchParams;
  let orders = await commerce.listOrders();
  if (status && status in STATUS) orders = orders.filter((o) => o.status === status);
  if (q) orders = orders.filter((o) => [o.id, o.customer.email, o.customer.firstName, o.customer.lastName].join(" ").toLowerCase().includes(q.toLowerCase()));
  return (
    <div>
      <PageTitle title="Commandes" sub={`${orders.length} commande${orders.length > 1 ? "s" : ""}`} />
      <div className="flex flex-wrap gap-2 mb-5 items-center">
        <Link href="/admin/orders" className={`px-3 py-1.5 rounded-full text-xs font-semibold ${!status ? "bg-white text-black" : "bg-white/8 text-white/70 hover:bg-white/15"}`}>Toutes</Link>
        {(Object.keys(STATUS) as OrderStatus[]).map((s) => (
          <Link key={s} href={`/admin/orders?status=${s}`} className={`px-3 py-1.5 rounded-full text-xs font-semibold ${status === s ? "bg-white text-black" : "bg-white/8 text-white/70 hover:bg-white/15"}`}>{STATUS[s].label}</Link>
        ))}
        <form className="ml-auto"><input name="q" defaultValue={q} placeholder="Rechercher (n°, email, nom)" className="bg-white/5 border border-white/15 rounded-full px-4 py-2 text-xs outline-none focus:border-white w-64" /></form>
      </div>
      {orders.length === 0 ? <Empty text="Aucune commande." /> : (
        <div className="overflow-x-auto border border-white/10 rounded-[4px]">
          <table className="w-full text-sm min-w-[760px]">
            <thead><tr className="t-label text-white/45 text-left border-b border-white/10"><th className="px-4 py-3">N°</th><th className="px-4 py-3">Date</th><th className="px-4 py-3">Client</th><th className="px-4 py-3">Articles</th><th className="px-4 py-3">Livraison</th><th className="px-4 py-3">Statut</th><th className="px-4 py-3">Paiement</th><th className="px-4 py-3 text-right">Total</th></tr></thead>
            <tbody className="divide-y divide-white/10">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-white/[0.03]">
                  <td className="px-4 py-3"><Link href={`/admin/orders/${o.id}`} className="t-dot hover:text-blue-sky">{o.id}</Link></td>
                  <td className="px-4 py-3 text-white/60 whitespace-nowrap">{formatDate(o.createdAt, { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" })}</td>
                  <td className="px-4 py-3"><p>{o.customer.firstName} {o.customer.lastName}</p><p className="text-xs text-white/45">{o.customer.email}</p></td>
                  <td className="px-4 py-3 text-white/70">{o.lines.reduce((n, l) => n + l.quantity, 0)}</td>
                  <td className="px-4 py-3 text-white/70 text-xs">{o.shippingMethod.label}</td>
                  <td className="px-4 py-3"><StatusBadge s={o.status} /></td>
                  <td className="px-4 py-3 text-xs">{o.paymentStatus === "paid" ? <span className="text-emerald-300">Payé</span> : o.paymentStatus === "refunded" ? <span className="text-pink">Remboursé</span> : <span className="text-yellow-300">Non payé</span>}</td>
                  <td className="px-4 py-3 text-right tabular-nums font-semibold">{formatPrice(o.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
