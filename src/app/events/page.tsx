import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { pastEvents, upcomingEvents, NEXT_DATE_HINT } from "@/lib/data/events";
import { RevealMask } from "@/components/ui/Reveal";
import { Globe } from "@/components/ui/Globe";
import { formatDate } from "@/lib/format";
export const metadata: Metadata = { title: "Événements", description: "Les festivals Smilin' Dancin' : Isla Electrónica 2025, Mexico Show 2026, au Yacht près de Lyon. Billetterie sur Shotgun." };

export default function EventsPage() {
  const up = upcomingEvents();
  const past = pastEvents();
  return (
    <div className="pt-28 md:pt-36">
      <div className="container-x relative overflow-hidden">
        <div className="absolute -right-40 -top-40 opacity-50 pointer-events-none hidden md:block"><Globe size={560} id="ev" /></div>
        <div className="relative">
          <p className="t-condensed text-blue-sky text-xl">Smilin' Dancin' Festival · Le Yacht · 20 min au nord de Lyon</p>
          <h1 className="t-display text-[clamp(48px,10vw,140px)] leading-[0.82] mt-2">Events</h1>
        </div>

        <section className="relative mt-12 md:mt-16">
          <h2 className="t-label text-white/50 mb-4">À venir</h2>
          {up.length === 0 ? (
            <div className="border border-white/15 rounded-[3px] p-6 md:p-10 grid md:grid-cols-[1fr_auto] gap-6 items-center">
              <div>
                <p className="t-display text-3xl md:text-5xl">{NEXT_DATE_HINT.value}</p>
                <p className="text-white/65 mt-3 max-w-xl">{NEXT_DATE_HINT.note}</p>
              </div>
              <div className="flex gap-3">
                <a href="https://www.instagram.com/smilin.dancin/" target="_blank" rel="noreferrer" className="btn btn-primary">Instagram</a>
                <a href={NEXT_DATE_HINT.shotgunUrl} target="_blank" rel="noreferrer" className="btn btn-ghost">Shotgun</a>
              </div>
            </div>
          ) : (
            up.map((e) => <EventRow key={e.slug} e={e} />)
          )}
        </section>

        <section className="mt-16 md:mt-24">
          <h2 className="t-label text-white/50 mb-4">Éditions passées</h2>
          <div className="space-y-4">
            {past.map((e, i) => (
              <RevealMask key={e.slug} delay={i * 0.05}>
                <EventRow e={e} />
              </RevealMask>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function EventRow({ e }: { e: ReturnType<typeof pastEvents>[number] }) {
  return (
    <Link href={`/events/${e.slug}`} className="group grid md:grid-cols-[2fr_3fr] gap-0 border border-white/10 rounded-[3px] overflow-hidden hover:border-white/30 transition-colors">
      <div className="relative aspect-[16/10] md:aspect-auto md:min-h-[260px] overflow-hidden">
        <Image src={e.cover} alt={e.title} fill sizes="(max-width:768px) 100vw, 40vw" className="object-cover transition-transform duration-[1.4s] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.04]" />
        <div className="absolute inset-0 opacity-40 mix-blend-multiply" style={{ background: `linear-gradient(135deg, ${e.theme.from}, ${e.theme.to})` }} />
      </div>
      <div className="p-6 md:p-8 flex flex-col">
        <p className="t-label text-white/50">{formatDate(e.date)} {e.hours ? `· ${e.hours}` : ""}</p>
        <p className="t-display text-3xl md:text-5xl mt-2 leading-[0.9]">{e.title} <span className="not-italic text-xl">{e.theme.emoji}</span></p>
        <p className="text-xs text-white/55 mt-1">{e.edition} · {e.venue.name}</p>
        <p className="text-sm text-white/75 mt-4 max-w-xl">{e.concept}</p>
        <div className="mt-auto pt-5 flex flex-wrap gap-2">
          {e.genres.slice(0, 5).map((g) => <span key={g} className="t-label text-[10px] border border-white/15 rounded-full px-2.5 py-1 text-white/70">{g}</span>)}
        </div>
      </div>
    </Link>
  );
}
