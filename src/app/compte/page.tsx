import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { currentUser } from "@/lib/account/auth";
import { readTable } from "@/lib/db";
import { AuthForms, LogoutButton } from "@/components/account/AuthForms";
import { ticketQrSvg } from "@/lib/tickets/qr";
import { TicketCard } from "@/components/tickets/TicketCard";
import { formatPrice, formatDate } from "@/lib/format";
import { STATUS } from "@/components/admin/ui";
export const metadata: Metadata = { title: "Espace client", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function Compte() {
  const user = await currentUser();
  if (!user) {
    return (
      <div className="container-x pt-28 md:pt-36 pb-20">
        <div className="m-center mb-10">
          <h1 className="t-display text-[clamp(34px,8vw,104px)] leading-[0.85]">Espace client</h1>
          <p className="text-white/65 mt-4 max-w-md">Tes billets avec QR code, tes commandes et précommandes, au même endroit.</p>
        </div>
        <AuthForms />
      </div>
    );
  }
  const [orders, tickets, ticketOrders] = await Promise.all([readTable("orders"), readTable("tickets"), readTable("ticketOrders")]);
  const myOrders = orders.filter((o) => o.customer.email.toLowerCase() === user.email);
  const myTickets = tickets.filter((t) => t.email === user.email && t.status !== "cancelled");
  const pendingTickets = ticketOrders.filter((o) => o.email === user.email && o.status === "pending_payment");
  const qrs = await Promise.all(myTickets.map((t) => ticketQrSvg(t.code)));
  return (
    <div className="container-x pt-28 md:pt-36 pb-20">
      <div className="m-center flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <p className="t-condensed text-blue-sky text-xl">Salut {user.firstName} 💙🩷</p>
          <h1 className="t-display text-[clamp(34px,8vw,104px)] leading-[0.85] mt-2">Mon espace</h1>
          <p className="text-sm text-white/50 mt-3">{user.email} · membre depuis {formatDate(user.createdAt, { month: "long", year: "numeric" })}</p>
        </div>
        <LogoutButton />
      </div>

      <section>
        <div className="m-center flex flex-wrap items-end justify-between gap-4 mb-6">
          <h2 className="t-display text-[clamp(28px,5vw,56px)]">Mes billets</h2>
          <Link href="/billetterie" className="btn btn-ghost !py-3">Billetterie</Link>
        </div>
        {pendingTickets.map((o) => (
          <Link key={o.id} href={`/paiement/billets/${o.id}?k=${o.accessKey}`} className="m-center flex flex-col sm:flex-row sm:justify-between gap-2 border border-pink/40 bg-pink/5 rounded-[2px] p-4 mb-4 text-sm">
            <span>{o.id} · {o.eventTitle}, paiement en attente</span><span className="font-semibold">Payer {formatPrice(o.total)}</span>
          </Link>
        ))}
        {myTickets.length === 0 ? (
          <div className="m-center border border-white/10 rounded-[2px] p-8"><p className="text-white/60">Aucun billet pour l'instant.</p></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">{myTickets.map((t, i) => <TicketCard key={t.id} ticket={t} qrSvg={qrs[i]} />)}</div>
        )}
      </section>

      <section className="mt-16">
        <div className="m-center flex flex-wrap items-end justify-between gap-4 mb-6">
          <h2 className="t-display text-[clamp(28px,5vw,56px)]">Mes commandes</h2>
          <Link href="/shop" className="btn btn-ghost !py-3">Shop</Link>
        </div>
        {myOrders.length === 0 ? (
          <div className="m-center border border-white/10 rounded-[2px] p-8"><p className="text-white/60">Aucune commande pour l'instant.</p></div>
        ) : (
          <div className="space-y-3">
            {myOrders.map((o) => (
              <article key={o.id} className="border border-white/10 rounded-[2px] p-4 sm:p-5">
                <div className="flex flex-wrap justify-between gap-2 mb-3">
                  <p className="t-dot">{o.id}</p>
                  <p className="text-xs text-white/55">{formatDate(o.createdAt)} · <span className="text-white">{STATUS[o.status].label}</span></p>
                </div>
                <div className="flex gap-2 overflow-x-auto hide-scroll">
                  {o.lines.map((l) => (
                    <div key={l.variantId} className="flex items-center gap-3 shrink-0 pr-3">
                      <div className="relative w-12 aspect-[4/5] overflow-hidden rounded-[2px]"><Image src={l.image} alt="" fill sizes="48px" className="object-cover" /></div>
                      <div className="text-xs"><p className="font-semibold">{l.productTitle}</p><p className="text-white/50">{l.variantTitle} × {l.quantity}</p></div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center mt-3 pt-3 border-t border-white/10 text-sm">
                  <span className="text-white/55">{o.shippingMethod.label}</span>
                  <span className="font-semibold tabular-nums">{formatPrice(o.total)}</span>
                </div>
                {o.paymentStatus !== "paid" && <Link href={`/paiement/commande/${o.id}`} className="btn btn-brand !py-3 mt-3">Payer</Link>}
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
