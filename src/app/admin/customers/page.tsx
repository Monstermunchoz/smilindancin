import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin/auth";
import { commerce } from "@/lib/commerce";
import { formatPrice, formatDate } from "@/lib/format";
import { PageTitle, Empty } from "@/components/admin/ui";
export default async function Customers() {
  if (!(await isAdmin())) redirect("/admin/login");
  const orders = await commerce.listOrders();
  const map = new Map<string, { email: string; name: string; orders: number; total: number; last: string; city: string }>();
  for (const o of orders) {
    const k = o.customer.email.toLowerCase();
    const c = map.get(k) ?? { email: o.customer.email, name: `${o.customer.firstName} ${o.customer.lastName}`, orders: 0, total: 0, last: o.createdAt, city: o.shippingAddress.city };
    c.orders++; if (o.status !== "cancelled" && o.status !== "refunded") c.total += o.total.amount; if (o.createdAt > c.last) c.last = o.createdAt;
    map.set(k, c);
  }
  const customers = [...map.values()].sort((a, b) => b.total - a.total);
  return (
    <div>
      <PageTitle title="Clients" sub={`${customers.length} client${customers.length > 1 ? "s" : ""} (dérivés des commandes)`} />
      {customers.length === 0 ? <Empty text="Aucun client pour le moment." /> : (
        <div className="overflow-x-auto border border-white/10 rounded-[4px]"><table className="w-full text-sm min-w-[600px]"><thead><tr className="t-label text-white/45 text-left border-b border-white/10"><th className="px-4 py-3">Nom</th><th className="px-4 py-3">Email</th><th className="px-4 py-3">Ville</th><th className="px-4 py-3">Commandes</th><th className="px-4 py-3">Dernière</th><th className="px-4 py-3 text-right">Total</th></tr></thead>
          <tbody className="divide-y divide-white/10">{customers.map((c) => <tr key={c.email}><td className="px-4 py-2.5 font-semibold">{c.name}</td><td className="px-4 py-2.5 text-white/70">{c.email}</td><td className="px-4 py-2.5 text-white/70">{c.city}</td><td className="px-4 py-2.5 tabular-nums">{c.orders}</td><td className="px-4 py-2.5 text-white/60">{formatDate(c.last)}</td><td className="px-4 py-2.5 text-right tabular-nums font-semibold">{formatPrice(c.total)}</td></tr>)}</tbody></table></div>
      )}
    </div>
  );
}
