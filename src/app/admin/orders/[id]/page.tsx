import Link from "next/link";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin/auth";
import { commerce } from "@/lib/commerce";
import { formatPrice, formatDate } from "@/lib/format";
import { PageTitle, StatusBadge, Card } from "@/components/admin/ui";
import { OrderActions } from "@/components/admin/OrderActions";

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) redirect("/admin/login");
  const { id } = await params;
  const o = await commerce.getOrder(id);
  if (!o) notFound();
  return (
    <div>
      <Link href="/admin/orders" className="text-xs text-white/50 hover:text-white">← Commandes</Link>
      <PageTitle title={o.id} sub={`${formatDate(o.createdAt, { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })} · ${o.source}${o.demo ? " · démo (sans paiement)" : ""}`} action={<StatusBadge s={o.status} />} />
      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-4">
        <div className="space-y-4">
          <Card title="Articles">
            <ul className="divide-y divide-white/10">
              {o.lines.map((l) => (
                <li key={l.variantId} className="py-3 flex gap-4 items-center">
                  <div className="relative w-12 aspect-[4/5] overflow-hidden rounded-[2px] shrink-0"><Image src={l.image} alt="" fill sizes="48px" className="object-cover" /></div>
                  <div className="flex-1 min-w-0"><p className="text-sm font-semibold">{l.productTitle}</p><p className="text-xs text-white/50">{l.variantTitle}</p></div>
                  <p className="text-sm text-white/70 tabular-nums">{l.quantity} × {formatPrice(l.unitPrice)}</p>
                  <p className="text-sm font-semibold tabular-nums w-20 text-right">{formatPrice(l.lineTotal)}</p>
                </li>
              ))}
            </ul>
            <div className="mt-4 pt-4 border-t border-white/10 text-sm space-y-1">
              <div className="flex justify-between text-white/70"><span>Sous-total</span><span className="tabular-nums">{formatPrice(o.subtotal)}</span></div>
              <div className="flex justify-between text-white/70"><span>Livraison ({o.shippingMethod.label})</span><span className="tabular-nums">{formatPrice(o.shipping)}</span></div>
              <div className="flex justify-between font-semibold text-base"><span>Total</span><span className="tabular-nums">{formatPrice(o.total)}</span></div>
            </div>
          </Card>
          <div className="grid sm:grid-cols-2 gap-4">
            <Card title="Client"><p className="font-semibold">{o.customer.firstName} {o.customer.lastName}</p><p className="text-sm text-white/70">{o.customer.email}</p>{o.customer.phone && <p className="text-sm text-white/70">{o.customer.phone}</p>}</Card>
            <Card title="Adresse"><p className="text-sm">{o.shippingAddress.line1}</p>{o.shippingAddress.line2 && <p className="text-sm">{o.shippingAddress.line2}</p>}<p className="text-sm">{o.shippingAddress.postalCode} {o.shippingAddress.city}</p><p className="text-sm text-white/60">{o.shippingAddress.country}</p></Card>
          </div>
          <Card title="Historique">
            <ol className="space-y-2 text-sm">{[...o.timeline].reverse().map((t, i) => <li key={i} className="flex gap-3"><span className="t-dot text-xs text-white/45 w-32 shrink-0">{formatDate(t.at, { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}</span><span>{t.label} <span className="text-white/40">· {t.by}</span></span></li>)}</ol>
          </Card>
        </div>
        <Card title="Actions"><OrderActions order={o} /></Card>
      </div>
    </div>
  );
}
