import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { commerce } from "@/lib/commerce";
import { formatPrice, formatDate } from "@/lib/format";
import { RetryPayment } from "@/components/shop/RetryPayment";
export const metadata: Metadata = { title: "Commande enregistrée", robots: { index: false } };
export const dynamic = "force-dynamic";
export default async function Confirmation({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ paid?: string; cancelled?: string }> }) {
  const { id } = await params;
  const sp = await searchParams;
  const o = await commerce.getOrder(id);
  if (!o) notFound();
  return (
    <div className="container-x pt-28 md:pt-36 max-w-3xl">
      <p className="m-center t-condensed text-blue-sky text-xl">Commande {o.id}</p>
      <h1 className="m-center t-display text-[clamp(34px,7vw,96px)] leading-[0.85] mt-2">Merci 💙🩷</h1>
      {o.paymentStatus === "paid" || sp.paid ? (
        <p className="mt-6 text-white/75 max-w-xl">Paiement reçu — votre commande est confirmée ({formatDate(o.createdAt)}). Un email de confirmation arrive à <b>{o.customer.email}</b>. {o.shippingMethod.id === "event" ? "Rendez-vous au stand Merch du prochain événement." : "On prépare votre pièce avec amour, puis on l'expédie."}</p>
      ) : sp.cancelled ? (
        <div className="mt-6 max-w-xl">
          <p className="text-white/75">Le paiement a été annulé. Votre commande est conservée : vous pouvez réessayer.</p>
          <RetryPayment orderId={o.id} />
        </div>
      ) : (
        <div className="mt-6 max-w-xl">
          <p className="text-white/75">Votre commande est enregistrée ({formatDate(o.createdAt)}) — paiement en attente.</p>
          <Link href={`/paiement/commande/${o.id}`} className="btn btn-brand mt-4">Payer maintenant</Link>
        </div>
      )}
      <div className="mt-8 border border-white/10 rounded-[3px] divide-y divide-white/10">
        {o.lines.map((l) => (
          <div key={l.variantId} className="p-4 flex justify-between gap-4 text-sm">
            <span>{l.productTitle} <span className="text-white/50">· {l.variantTitle} × {l.quantity}</span></span>
            <span className="tabular-nums">{formatPrice(l.lineTotal)}</span>
          </div>
        ))}
        <div className="p-4 flex justify-between text-sm text-white/70"><span>Livraison — {o.shippingMethod.label}</span><span className="tabular-nums">{o.shipping.amount ? formatPrice(o.shipping) : "Offert"}</span></div>
        <div className="p-4 flex justify-between font-semibold"><span>Total</span><span className="tabular-nums">{formatPrice(o.total)}</span></div>
      </div>
      <div className="mt-8 flex gap-3"><Link href="/shop" className="btn btn-primary">Continuer</Link><Link href="/events" className="btn btn-ghost">Les événements</Link></div>
    </div>
  );
}
