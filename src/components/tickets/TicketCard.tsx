import type { Ticket } from "@/lib/tickets/types";
import { formatPrice } from "@/lib/format";

export function TicketCard({ ticket, qrSvg }: { ticket: Ticket; qrSvg: string }) {
  return (
    <article className="relative mx-auto w-full max-w-[360px] rounded-[18px] overflow-hidden bg-white text-black shadow-[0_30px_80px_-30px_rgba(55,84,143,.7)]">
      <div className="g-brand grain px-5 pt-5 pb-6 text-white">
        <div className="flex justify-between items-start gap-3">
          <p className="t-label text-white/80">Smilin' Dancin'</p>
          <p className={`t-label text-[10px] px-2 py-1 rounded-full ${ticket.status === "used" ? "bg-black/40" : "bg-white/20"}`}>{ticket.status === "used" ? "Scanné" : ticket.status === "cancelled" ? "Annulé" : "Valide"}</p>
        </div>
        <p className="t-display text-3xl leading-[0.9] mt-4">{ticket.eventTitle}</p>
        <p className="text-xs text-white/80 mt-2">{ticket.eventDateLabel}</p>
      </div>
      <div className="relative h-0">
        <span className="absolute -left-3 -top-3 w-6 h-6 rounded-full bg-[var(--background)]" />
        <span className="absolute -right-3 -top-3 w-6 h-6 rounded-full bg-[var(--background)]" />
        <span className="absolute left-5 right-5 top-0 border-t-2 border-dashed border-black/15" />
      </div>
      <div className="px-5 pt-6 pb-5">
        <div className="mx-auto w-[200px] h-[200px] [&>svg]:w-full [&>svg]:h-full" dangerouslySetInnerHTML={{ __html: qrSvg }} aria-label={`QR code du billet ${ticket.code}`} role="img" />
        <p className="t-dot text-center text-lg tracking-[0.25em] mt-2">{ticket.code}</p>
        <dl className="grid grid-cols-2 gap-3 mt-4 text-xs">
          <div><dt className="text-black/45">Nom</dt><dd className="font-semibold">{ticket.holderName}</dd></div>
          <div className="text-right"><dt className="text-black/45">Tarif</dt><dd className="font-semibold">{ticket.tierName} · {formatPrice(ticket.price)}</dd></div>
          <div><dt className="text-black/45">Billet</dt><dd className="font-semibold">{ticket.id}</dd></div>
          <div className="text-right"><dt className="text-black/45">Commande</dt><dd className="font-semibold">{ticket.orderId}</dd></div>
        </dl>
        {ticket.demo && <p className="text-[10px] text-center text-black/40 mt-4">Billet de démonstration</p>}
      </div>
    </article>
  );
}
