import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { commerce } from "@/lib/commerce";
import { getTicketOrder } from "@/lib/tickets/service";
import { DemoPayment } from "@/components/payment/DemoPayment";
export const metadata: Metadata = { title: "Paiement", robots: { index: false } };
export const dynamic = "force-dynamic";
export default async function Paiement({ params, searchParams }: { params: Promise<{ kind: string; id: string }>; searchParams: Promise<{ k?: string }> }) {
  const { kind, id } = await params;
  const { k } = await searchParams;
  if (kind === "billets") {
    const o = await getTicketOrder(id);
    if (!o || o.accessKey !== k) notFound();
    if (o.status === "paid") redirect(`/billets/${o.id}?k=${o.accessKey}`);
    return (
      <div className="container-x pt-28 md:pt-36 pb-20">
        <h1 className="m-center t-display text-[clamp(34px,7vw,88px)] leading-[0.85] mb-8">Paiement</h1>
        <DemoPayment kind="billets" id={o.id} accessKey={o.accessKey} amount={o.total} label={`${o.items.reduce((n, i) => n + i.quantity, 0)} billet(s), ${o.eventTitle}`} />
      </div>
    );
  }
  if (kind === "commande") {
    const o = await commerce.getOrder(id);
    if (!o) notFound();
    if (o.paymentStatus === "paid") redirect(`/checkout/confirmation/${o.id}`);
    return (
      <div className="container-x pt-28 md:pt-36 pb-20">
        <h1 className="m-center t-display text-[clamp(34px,7vw,88px)] leading-[0.85] mb-8">Paiement</h1>
        <DemoPayment kind="commande" id={o.id} amount={o.total.amount} label={`Commande ${o.id}`} />
      </div>
    );
  }
  notFound();
}
