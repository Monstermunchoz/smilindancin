import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTicketOrder, ticketsForOrder } from "@/lib/tickets/service";
import { ticketQrSvg } from "@/lib/tickets/qr";
import { TicketCard } from "@/components/tickets/TicketCard";
import { currentUser } from "@/lib/account/auth";
export const metadata: Metadata = { title: "Mes billets", robots: { index: false } };
export const dynamic = "force-dynamic";
export default async function Billets({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ k?: string; paid?: string }> }) {
  const { id } = await params;
  const { k, paid } = await searchParams;
  const o = await getTicketOrder(id);
  const user = await currentUser();
  if (!o || (o.accessKey !== k && user?.email !== o.email)) notFound();
  const tickets = await ticketsForOrder(o.id);
  const qrs = await Promise.all(tickets.map((t) => ticketQrSvg(t.code)));
  return (
    <div className="container-x pt-28 md:pt-36 pb-20">
      <div className="m-center mb-10">
        <p className="t-condensed text-blue-sky text-xl">Commande {o.id}</p>
        <h1 className="t-display text-[clamp(34px,8vw,104px)] leading-[0.85] mt-2">{paid ? "C'est validé 💙🩷" : "Tes billets"}</h1>
        <p className="text-white/70 mt-4 max-w-xl">{tickets.length} billet{tickets.length > 1 ? "s" : ""} pour {o.eventTitle}. Présente le QR code à l'entrée (capture d'écran acceptée). Retrouve-les à tout moment dans ton <Link href="/compte" className="underline">espace client</Link>.</p>
      </div>
      {o.status !== "paid" ? (
        <div className="m-center"><p className="text-white/70">Paiement en attente.</p><Link href={`/paiement/billets/${o.id}?k=${o.accessKey}`} className="btn btn-brand mt-5">Payer maintenant</Link></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">{tickets.map((t, i) => <TicketCard key={t.id} ticket={t} qrSvg={qrs[i]} />)}</div>
      )}
    </div>
  );
}
