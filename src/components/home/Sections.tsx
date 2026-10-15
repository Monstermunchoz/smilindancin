"use client";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { Product } from "@/lib/commerce/types";
import type { SDEvent } from "@/lib/data/events";
import type { Article } from "@/lib/data/journal";
import { VISUALS } from "@/lib/data/products";
import { ProductCard } from "@/components/shop/ProductCard";
import { Reveal, RevealMask } from "@/components/ui/Reveal";
import { Globe } from "@/components/ui/Globe";
import { NewsletterForm } from "@/components/ui/NewsletterForm";
import { formatDate, formatPrice } from "@/lib/format";

const ease = [0.16, 1, 0.3, 1] as const;

/* ---------- Marquee ---------- */
export function BrandMarquee({ dark = true }: { dark?: boolean }) {
  const items = ["Smilin’", "Lovin’", "Dancin’", "Movin’", "Dreamin’", "Shinin’", "Jumpin’"];
  return (
    <div className={`marquee overflow-hidden py-4 border-y ${dark ? "border-white/10" : "border-black/10"}`} aria-hidden>
      <div className="marquee-track" style={{ ["--marquee-speed" as string]: "24s" }}>
        {[0, 1].map((k) => (
          <span key={k} className="flex">
            {items.map((w, i) => (
              <span key={i} className="t-display text-[46px] md:text-[64px] pr-10 flex items-center gap-10">
                <span className={i % 2 ? "g-neon-text" : dark ? "text-white" : "text-black"}>{w}</span>
                <span className="text-pink text-2xl not-italic">💙🩷</span>
              </span>
            ))}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ---------- Drops 2026 ---------- */
export function Drops({ products }: { products: Product[] }) {
  const [groovers, vip] = products;
  if (!groovers || !vip) return null;
  return (
    <section className="container-x pt-20 md:pt-28">
      <Reveal>
        <div className="flex flex-wrap items-end justify-between gap-6 mb-8 md:mb-12">
          <h2 className="t-display text-[clamp(44px,8vw,120px)]">
            Nouvelle <span className="g-neon-text">co’</span> 2026
          </h2>
          <p className="max-w-sm text-white/70 text-sm md:text-base">Deux visuels dévoilés au Mexico Show, en pré-commande sur le festival : Groovers — never miss the drop, et The Real VIP is on the dancefloor.</p>
        </div>
      </Reveal>
      <div className="grid md:grid-cols-12 gap-4 md:gap-6">
        <RevealMask className="md:col-span-7">
          <Link href={`/shop/${groovers.handle}`} className="group relative block aspect-[4/5] md:aspect-[5/6] overflow-hidden rounded-[3px]">
            <Image src="/merch/photos/campaign-groovers-realvip-crop.jpg" alt={groovers.images[0].alt} fill sizes="(max-width:768px) 100vw, 60vw" className="object-cover object-top transition-transform duration-[1.4s] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.04]" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            <div className="absolute inset-x-5 bottom-5 md:inset-x-8 md:bottom-8 flex items-end justify-between gap-4">
              <div>
                <p className="t-condensed text-blue-sky text-lg">Never miss the drop</p>
                <p className="t-display text-4xl md:text-6xl">Groovers</p>
              </div>
              <span className="btn btn-primary hidden sm:inline-flex">Découvrir</span>
            </div>
          </Link>
        </RevealMask>
        <div className="md:col-span-5 flex flex-col gap-4 md:gap-6">
          <RevealMask delay={0.15}>
            <Link href={`/shop/${vip.handle}`} className="group relative block aspect-[4/5] md:aspect-[5/6] overflow-hidden rounded-[3px]">
              <Image src="/merch/photos/real-vip-tee-white-back.jpg" alt={vip.images[0].alt} fill sizes="(max-width:768px) 100vw, 40vw" className="object-cover transition-transform duration-[1.4s] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.04]" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute inset-x-5 bottom-5 md:inset-x-8 md:bottom-8">
                <p className="t-condensed text-pink text-lg">Is on the dancefloor</p>
                <p className="t-display text-4xl md:text-5xl">The Real VIP</p>
              </div>
            </Link>
          </RevealMask>
          <Reveal delay={0.25} className="hidden md:block">
            <p className="text-sm text-white/60 leading-relaxed">T-shirts sur pré-commande sur le festival · Casquettes, bandanas, bobs — stock limité. Tarifs communiqués par la marque.</p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ---------- Les 9 visuels — sélecteur interactif ---------- */
export function VisualPicker({ products }: { products: Product[] }) {
  const [active, setActive] = useState(VISUALS[3].id); // We Push The Sky
  const reduce = useReducedMotion();
  const v = VISUALS.find((x) => x.id === active)!;
  const tee = products.find((p) => p.id === `tee-${v.id}`);
  const hoodie = products.find((p) => p.id === `hoodie-${v.id}`);
  const photo = v.photos[0];
  return (
    <section className="relative mt-24 md:mt-36 py-20 md:py-28 bg-ink overflow-hidden">
      <div className="absolute inset-0 globe-grid opacity-70 pointer-events-none" />
      <div className="container-x relative">
        <Reveal>
          <div className="grid lg:grid-cols-2 gap-6 items-end mb-10 md:mb-14">
            <h2 className="t-display text-[clamp(44px,8vw,120px)] leading-[0.85]">
              9 visuels<br /><span className="text-white/40">au choix</span>
            </h2>
            <p className="max-w-md text-white/70 lg:justify-self-end">La Smilers & Dancers Collection : chaque visuel existe en t-shirt (6 coupes, devant petit ou dos grand) et en sweat à capuche brodé. Noir, blanc, gris. Made in France, du XS au XXL.</p>
          </div>
        </Reveal>

        <div className="grid lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] gap-8 lg:gap-14 items-start">
          {/* Grille des 9 visuels */}
          <div className="grid grid-cols-3 gap-2 md:gap-3">
            {VISUALS.map((x) => (
              <button
                key={x.id}
                onClick={() => setActive(x.id)}
                aria-pressed={active === x.id}
                className={`relative aspect-square overflow-hidden rounded-[3px] transition-[transform,box-shadow,opacity] duration-500 ease-[cubic-bezier(.16,1,.3,1)] ${active === x.id ? "ring-2 ring-pink scale-[1.02] z-10 shadow-[0_20px_60px_-20px_rgba(169,66,107,.8)]" : "opacity-70 hover:opacity-100 hover:scale-[1.02]"}`}
              >
                <Image src={x.tile} alt={`Visuel ${x.n} — ${x.title}`} fill sizes="(max-width:1024px) 33vw, 20vw" className="object-cover" />
                <span className="absolute bottom-1.5 right-2 text-[10px] font-bold text-white/80 bg-black/60 rounded px-1.5 py-0.5">{x.n}</span>
              </button>
            ))}
          </div>

          {/* Détail du visuel actif */}
          <div className="relative min-h-[420px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={v.id}
                initial={reduce ? false : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? undefined : { opacity: 0, y: -10 }}
                transition={{ duration: 0.5, ease }}
                className="grid sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-5"
              >
                <div className="relative aspect-[4/5] overflow-hidden rounded-[3px] bg-ink-2">
                  <Image src={photo.src} alt={photo.alt} fill sizes="(max-width:640px) 100vw, 30vw" className="object-cover" />
                </div>
                <div className="flex flex-col">
                  <p className="t-condensed text-blue-sky text-lg">Visuel n°{v.n}</p>
                  <h3 className="t-display text-3xl md:text-4xl mt-1 leading-[0.9]">{v.title}</h3>
                  <p className="text-sm text-white/55 mt-2">{v.subtitle}</p>
                  <p className="text-sm text-white/75 mt-4 leading-relaxed">{v.description}</p>
                  <div className="mt-auto pt-6 space-y-2.5">
                    {tee && (
                      <Link href={`/shop/${tee.handle}`} className="flex items-center justify-between border border-white/15 rounded-full px-5 py-3 hover:border-white hover:bg-white/5 transition-colors">
                        <span className="text-sm font-semibold">T-shirt · 6 coupes</span>
                        <span className="text-sm tabular-nums text-white/70">dès {formatPrice(2500)}</span>
                      </Link>
                    )}
                    {hoodie && (
                      <Link href={`/shop/${hoodie.handle}`} className="flex items-center justify-between border border-white/15 rounded-full px-5 py-3 hover:border-white hover:bg-white/5 transition-colors">
                        <span className="text-sm font-semibold">Sweat à capuche brodé</span>
                        <span className="text-sm tabular-nums text-white/70">{formatPrice(hoodie.price)}</span>
                      </Link>
                    )}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Featured grid ---------- */
export function Featured({ products }: { products: Product[] }) {
  return (
    <section className="container-x pt-20 md:pt-28">
      <Reveal>
        <div className="flex items-end justify-between gap-6 mb-8">
          <h2 className="t-display text-[clamp(40px,6vw,88px)]">Les pièces<br /><span className="text-white/40">du moment</span></h2>
          <Link href="/shop" className="btn btn-ghost shrink-0">Tout le shop</Link>
        </div>
      </Reveal>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-3 gap-y-8 md:gap-x-5">
        {products.slice(0, 8).map((p, i) => (
          <ProductCard key={p.id} product={p} priority={i < 2} />
        ))}
      </div>
    </section>
  );
}

/* ---------- Campagne éditoriale ---------- */
export function Campaign() {
  const shots = [
    { src: "/merch/photos/music-is-my-power-tee-back.jpg", alt: "Music Is My Power — plage", cls: "md:col-span-5 md:row-span-2 aspect-[4/5]" },
    { src: "/merch/photos/feet-on-the-ground-croptop-white.jpg", alt: "Feet On The Ground — crop top, lac d'Annecy", cls: "md:col-span-4 aspect-[4/5]" },
    { src: "/merch/photos/bob-black-wordmark.jpg", alt: "Bob noir brodé", cls: "md:col-span-3 aspect-[4/5]" },
    { src: "/merch/photos/together-tee-white-cap-pink.jpg", alt: "Together — t-shirt oversize blanc", cls: "md:col-span-4 aspect-[4/5]" },
    { src: "/merch/photos/hoodies-trio-lake.jpg", alt: "Sweats au bord du lac", cls: "md:col-span-3 aspect-[4/5]" },
  ];
  return (
    <section className="relative mt-24 md:mt-36">
      <div className="container-x">
        <Reveal>
          <div className="max-w-3xl mb-10 md:mb-14">
            <p className="t-condensed text-pink text-xl mb-3">Smilers & Dancers Collection</p>
            <h2 className="t-display text-[clamp(44px,9vw,140px)] leading-[0.82]">
              Feet on the ground<br /><span className="text-white/35">to dance</span>
            </h2>
          </div>
        </Reveal>
        <div className="grid grid-cols-2 md:grid-cols-12 gap-3 md:gap-4">
          {shots.map((s, i) => (
            <RevealMask key={s.src} delay={i * 0.08} className={`${s.cls} ${i === 0 ? "col-span-2" : ""}`}>
              <div className="relative w-full h-full overflow-hidden rounded-[3px] bg-ink-2">
                <Image src={s.src} alt={s.alt} fill sizes="(max-width:768px) 50vw, 40vw" className="object-cover" />
              </div>
            </RevealMask>
          ))}
        </div>
        <Reveal delay={0.1}>
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-white/55 max-w-lg">Spirit in the clouds to dream. Photos : @smilin.dancin — highlight Merch'. Annecy, Lyon, plages et sommets.</p>
            <Link href="/collections/smilers-dancers" className="btn btn-primary">Voir la collection</Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------- Events ---------- */
export function EventsSection({ events }: { events: SDEvent[] }) {
  const [latest, prev] = events;
  return (
    <section className="relative mt-24 md:mt-36 overflow-hidden">
      <div className="absolute right-[-10%] top-[-10%] pointer-events-none opacity-60 hidden lg:block">
        <Globe size={700} speed={90} id="events" />
      </div>
      <div className="container-x relative">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-6 mb-10">
            <h2 className="t-display text-[clamp(44px,8vw,120px)]">Events</h2>
            <div className="text-right">
              <p className="t-label text-white/50">Prochaine date</p>
              <p className="t-condensed text-2xl md:text-3xl">Info à venir — suivez <a href="https://www.instagram.com/smilin.dancin/" className="g-neon-text" target="_blank" rel="noreferrer">@smilin.dancin</a></p>
            </div>
          </div>
        </Reveal>
        {latest && (
          <RevealMask>
            <Link href={`/events/${latest.slug}`} className="group relative block aspect-[4/5] sm:aspect-[16/10] lg:aspect-[21/9] overflow-hidden rounded-[3px]">
              <Image src={latest.cover} alt={latest.title} fill sizes="100vw" className="object-cover transition-transform duration-[1.6s] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.03]" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
              <div className="absolute inset-x-5 bottom-5 md:inset-x-10 md:bottom-10 grid md:grid-cols-[1fr_auto] items-end gap-6">
                <div>
                  <p className="t-condensed text-xl md:text-2xl text-blue-sky">{latest.dateLabel} · {latest.venue.name}</p>
                  <p className="t-display text-[12vw] md:text-[7vw] leading-[0.85] mt-2">{latest.title}</p>
                  <p className="text-white/70 mt-3 max-w-xl text-sm md:text-base">{latest.concept}</p>
                </div>
                <span className="btn btn-primary">Revivre l'édition</span>
              </div>
            </Link>
          </RevealMask>
        )}
        <div className="grid md:grid-cols-2 gap-4 mt-4">
          {prev && (
            <Reveal>
              <Link href={`/events/${prev.slug}`} className="group flex gap-5 items-center border border-white/10 rounded-[3px] p-4 hover:border-white/30 transition-colors">
                <div className="relative w-28 md:w-40 aspect-[16/10] overflow-hidden rounded-[2px] shrink-0">
                  <Image src={prev.poster} alt={prev.title} fill sizes="160px" className="object-cover" />
                </div>
                <div>
                  <p className="t-label text-white/50">{formatDate(prev.date)}</p>
                  <p className="t-display text-2xl md:text-3xl mt-1">{prev.title}</p>
                  <p className="text-xs text-white/60 mt-1">{prev.edition}</p>
                </div>
              </Link>
            </Reveal>
          )}
          <Reveal delay={0.1}>
            <Link href="/events" className="group flex items-center justify-between border border-white/10 rounded-[3px] p-5 md:p-6 h-full hover:border-white/30 transition-colors">
              <div>
                <p className="t-display text-2xl md:text-3xl">Toutes les éditions</p>
                <p className="text-xs text-white/60 mt-1">Isla Electrónica 2025 · Mexico Show 2026 · After Ski 2025</p>
              </div>
              <span className="text-3xl text-white/40 group-hover:text-pink transition-colors">→</span>
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ---------- Journal ---------- */
export function JournalSection({ articles }: { articles: Article[] }) {
  return (
    <section className="container-x mt-24 md:mt-36">
      <Reveal>
        <div className="flex items-end justify-between gap-6 mb-8">
          <h2 className="t-display text-[clamp(40px,6vw,88px)]">Journal</h2>
          <Link href="/journal" className="btn btn-ghost shrink-0">Tous les articles</Link>
        </div>
      </Reveal>
      <div className="grid md:grid-cols-3 gap-5">
        {articles.slice(0, 3).map((a, i) => (
          <Reveal key={a.slug} delay={i * 0.08}>
            <Link href={`/journal/${a.slug}`} className="group block">
              <div className="relative aspect-[4/3] overflow-hidden rounded-[3px] bg-ink-2">
                <Image src={a.cover} alt={a.coverAlt} fill sizes="(max-width:768px) 100vw, 33vw" className="object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.04]" />
              </div>
              <p className="t-label text-pink mt-4">{a.category} · {formatDate(a.date, { day: "numeric", month: "short", year: "numeric" })}</p>
              <h3 className="font-semibold text-lg leading-snug mt-1.5 group-hover:text-blue-sky transition-colors">{a.title}</h3>
              <p className="text-sm text-white/55 mt-1.5 line-clamp-2">{a.excerpt}</p>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ---------- Brand statement ---------- */
export function BrandStatement() {
  return (
    <section className="relative mt-24 md:mt-36 py-24 md:py-36 overflow-hidden bg-sand text-black light">
      <div className="absolute inset-0 pointer-events-none">
        <Image src="/photos/terrasse.jpg" alt="" fill sizes="100vw" className="object-cover opacity-[0.14] mix-blend-multiply" />
      </div>
      <div className="container-x relative grid lg:grid-cols-[1.2fr_1fr] gap-10 lg:gap-20 items-center">
        <Reveal>
          <h2 className="t-display text-[clamp(40px,7vw,104px)] leading-[0.85]">
            De la musique,<br />des sourires,<br /><span className="text-pink">des souvenirs.</span>
          </h2>
        </Reveal>
        <Reveal delay={0.15}>
          <div className="space-y-5 text-base md:text-lg leading-relaxed text-black/80">
            <p>Smilin' Dancin' est né à Lyon en janvier 2025 de deux amis, Flow et Lucho, après des années à parcourir les festivals. Bien plus qu'un concept événementiel : un état d'esprit fait de good vibes, de partage et d'amour, porté par la musique.</p>
            <p>Des événements intimistes et à thème — La Isla Electrónica, le Mexico Show — et une ligne de vêtements Made in France pour continuer à danser une fois la fête finie. Electronic Music Events & Clothing.</p>
            <Link href="/about" className="btn btn-dark">Notre histoire</Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------- Newsletter bloc ---------- */
export function NewsletterBlock() {
  return (
    <section className="container-x mt-24 md:mt-36">
      <div className="relative overflow-hidden rounded-[4px] g-brand p-8 md:p-14 grain">
        <div className="absolute -right-20 -top-20 opacity-50 pointer-events-none">
          <Globe size={420} glow={false} id="nl" speed={80} />
        </div>
        <div className="relative max-w-2xl">
          <h2 className="t-display text-[clamp(36px,6vw,80px)] text-white leading-[0.85]">The world<br />is groove</h2>
          <p className="text-white/85 mt-5 mb-7 max-w-md">Soyez prévenu·e des drops, des pré-commandes et des prochaines dates avant tout le monde.</p>
          <NewsletterForm source="home" />
        </div>
      </div>
    </section>
  );
}
