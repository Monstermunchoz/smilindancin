import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ticketedEvents, getTierViews } from "@/lib/tickets/service";
import { pastEvents } from "@/lib/data/events";
import { formatPrice } from "@/lib/format";
export const metadata: Metadata = { title: "Billetterie", description: "Billets Smilin' Dancin' : Early Bird, Regular, Last Release. Billets nominatifs avec QR code." };
export const dynamic = "force-dynamic";
export default async function Billetterie() {
  const events = ticketedEvents();
  const views = await Promise.all(events.map((e) => getTierViews(e.slug)));
  return (
    <div className="container-x pt-28 md:pt-36">
      <div className="m-center mb-10">
        <p className="t-condensed text-blue-sky text-xl">Billets nominatifs · QR code · paiement sécurisé</p>
        <h1 className="t-display text-[clamp(34px,9vw,128px)] leading-[0.85] mt-2">Billetterie</h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {events.map((e, i) => {
          const v = views[i];
          const open = v.find((t) => t.status === "on_sale");
          return (
            <Link key={e.slug} href={`/billetterie/${e.slug}`} className="group relative block aspect-square overflow-hidden rounded-[2px] border border-white/10">
              <Image src={e.cover} alt={e.title} fill sizes="(max-width:768px) 100vw, 50vw" className="object-cover transition-transform duration-[1.4s] group-hover:scale-[1.04]" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
              <div className="m-center absolute inset-x-5 bottom-5 md:inset-x-8 md:bottom-8">
                <p className="t-label text-blue-sky">{e.dateLabel}</p>
                <p className="t-display text-[clamp(34px,6vw,64px)] leading-[0.9] mt-2">{e.title}</p>
                <p className="text-sm text-white/70 mt-2">{e.venue.name}</p>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  {open ? <span className="btn btn-primary">{open.name} · {formatPrice(open.price)}</span> : <span className="btn btn-ghost">Complet</span>}
                </div>
              </div>
              {e.demo && <span className="absolute top-4 left-4 t-label text-[10px] bg-pink px-2.5 py-1.5 rounded-full">Démo</span>}
            </Link>
          );
        })}
      </div>
      <section className="mt-20">
        <h2 className="m-center t-label text-white/50 mb-4">Éditions passées (billetterie Shotgun)</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {pastEvents().map((e) => (
            <Link key={e.slug} href={`/events/${e.slug}`} className="m-center flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border border-white/10 rounded-[2px] p-4 hover:border-white/30 transition-colors">
              <span className="font-semibold">{e.title}</span><span className="text-xs text-white/50">{e.dateLabel}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
