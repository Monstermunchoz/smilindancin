import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { EVENTS, getEvent } from "@/lib/data/events";
import { Reveal, RevealMask } from "@/components/ui/Reveal";
import { formatDate } from "@/lib/format";

export function generateStaticParams() { return EVENTS.map((e) => ({ slug: e.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params; const e = getEvent(slug);
  return e ? { title: `${e.title} — ${e.dateLabel}`, description: e.concept, openGraph: { images: [e.poster] } } : {};
}

export default async function EventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const e = getEvent(slug);
  if (!e) notFound();
  const others = EVENTS.filter((x) => x.slug !== e.slug);
  const jsonLd = { "@context": "https://schema.org", "@type": "MusicEvent", name: `Smilin' Dancin' présente ${e.title}`, startDate: e.date, eventStatus: "https://schema.org/EventScheduled", location: { "@type": "Place", name: e.venue.name, address: e.venue.address }, image: e.poster, description: e.concept, organizer: { "@type": "Organization", name: "Smilin' Dancin'", url: "https://www.instagram.com/smilin.dancin/" }, offers: { "@type": "Offer", url: e.ticketUrl } };
  return (
    <article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <header className="relative min-h-[80svh] flex items-end overflow-hidden">
        <Image src={e.cover} alt={e.title} fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/20" />
        <div className="absolute inset-0 opacity-30 mix-blend-multiply" style={{ background: `linear-gradient(135deg, ${e.theme.from}, ${e.theme.to})` }} />
        <div className="container-x relative pb-12 pt-32 w-full">
          <p className="t-condensed text-xl md:text-2xl text-blue-sky">{e.dateLabel}{e.hours ? ` · ${e.hours}` : ""} · {e.venue.name}</p>
          <h1 className="t-display text-[clamp(52px,12vw,180px)] leading-[0.82] mt-2">{e.title}</h1>
          <p className="text-white/80 mt-4 max-w-2xl text-base md:text-lg">{e.concept}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href={e.ticketUrl} target="_blank" rel="noreferrer" className="btn btn-primary">{e.status === "past" ? "Page Shotgun" : "Billets sur Shotgun"}</a>
            {e.venue.mapsUrl && <a href={e.venue.mapsUrl} target="_blank" rel="noreferrer" className="btn btn-ghost">Itinéraire</a>}
          </div>
        </div>
      </header>

      <div className="container-x grid lg:grid-cols-[2fr_1fr] gap-12 lg:gap-20 pt-16">
        <div className="space-y-12">
          <Reveal>
            <div className="space-y-4 text-white/80 text-base md:text-lg leading-relaxed max-w-2xl">
              {e.description.map((p, i) => <p key={i}>{p}</p>)}
            </div>
          </Reveal>
          {e.stages && (
            <Reveal>
              <h2 className="t-display text-3xl mb-4">3 scènes</h2>
              <div className="grid sm:grid-cols-3 gap-3">
                {e.stages.map((s) => (
                  <div key={s.name} className="border border-white/10 rounded-[3px] p-4"><p className="font-semibold">{s.name}</p><p className="t-dot text-sm text-blue-sky mt-1">{s.hours}</p></div>
                ))}
              </div>
            </Reveal>
          )}
          <Reveal>
            <h2 className="t-display text-3xl mb-4">Line-up</h2>
            <ul className="flex flex-wrap gap-2">
              {e.lineup.map((a) => (
                <li key={a.name} className="border border-white/15 rounded-full px-4 py-2 text-sm">
                  <span className="font-semibold">{a.name}</span>
                  {a.from && <span className="text-white/50"> · {a.from}</span>}
                  {a.role && <span className="text-pink"> · {a.role}</span>}
                </li>
              ))}
            </ul>
          </Reveal>
          {e.photos.length > 0 && (
            <section>
              <h2 className="t-display text-3xl mb-4">Souvenirs</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {e.photos.map((p, i) => (
                  <RevealMask key={p.src} delay={i * 0.05} className={i === 0 ? "col-span-2 md:col-span-2 md:row-span-2" : ""}>
                    <a href={p.sourceUrl} target="_blank" rel="noreferrer" className="group relative block aspect-[4/3] overflow-hidden rounded-[3px] h-full">
                      <Image src={p.src} alt={p.alt} fill sizes="(max-width:768px) 50vw, 33vw" className="object-cover transition-transform duration-[1.2s] group-hover:scale-[1.04]" />
                      {p.credit && <span className="absolute bottom-2 left-2 t-label text-[10px] bg-black/60 px-2 py-1 rounded text-white/80">{p.credit}</span>}
                    </a>
                  </RevealMask>
                ))}
              </div>
            </section>
          )}
        </div>
        <aside className="space-y-8 lg:sticky lg:top-24 self-start">
          <div className="relative aspect-[16/9] overflow-hidden rounded-[3px]"><Image src={e.poster} alt={`Affiche ${e.title}`} fill sizes="400px" className="object-cover" /></div>
          <div>
            <p className="t-label text-white/50 mb-2">Lieu</p>
            <p className="font-semibold">{e.venue.name}</p>
            <p className="text-sm text-white/65">{e.venue.address}</p>
            <p className="text-sm text-white/65">{e.venue.city}</p>
          </div>
          <div>
            <p className="t-label text-white/50 mb-2">Infos pratiques</p>
            <ul className="text-sm text-white/75 space-y-1.5">{e.practical.map((p) => <li key={p} className="flex gap-2"><span className="text-pink">✦</span>{p}</li>)}</ul>
          </div>
          <div>
            <p className="t-label text-white/50 mb-2">Vibe</p>
            <div className="flex flex-wrap gap-2">{e.genres.map((g) => <span key={g} className="t-label text-[10px] border border-white/15 rounded-full px-2.5 py-1 text-white/70">{g}</span>)}</div>
          </div>
          {e.interested && <p className="t-dot text-sm text-white/50">{e.interested} intéressé·e·s sur Shotgun</p>}
          <p className="text-xs text-white/40">Source : <a href={e.sourceUrl} className="underline" target="_blank" rel="noreferrer">{new URL(e.sourceUrl).hostname}</a></p>
        </aside>
      </div>

      <section className="container-x mt-24">
        <h2 className="t-label text-white/50 mb-4">Autres éditions</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {others.map((o) => (
            <Link key={o.slug} href={`/events/${o.slug}`} className="group flex gap-5 items-center border border-white/10 rounded-[3px] p-4 hover:border-white/30 transition-colors">
              <div className="relative w-32 aspect-[16/10] overflow-hidden rounded-[2px] shrink-0"><Image src={o.poster} alt="" fill sizes="128px" className="object-cover" /></div>
              <div><p className="t-label text-white/50">{formatDate(o.date)}</p><p className="t-display text-2xl mt-1">{o.title}</p></div>
            </Link>
          ))}
        </div>
      </section>
    </article>
  );
}
