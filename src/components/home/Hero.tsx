"use client";
import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { Globe } from "@/components/ui/Globe";

const ease = [0.16, 1, 0.3, 1] as const;

export function Hero() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], ["0%", reduce ? "0%" : "18%"]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", reduce ? "0%" : "-30%"]);

  const word = (w: string, delay: number) =>
    w.split("").map((ch, i) => (
      <motion.span
        key={i}
        className="inline-block"
        initial={reduce ? false : { y: "110%", rotate: 6, opacity: 0 }}
        animate={{ y: "0%", rotate: 0, opacity: 1 }}
        transition={{ duration: 1, delay: delay + i * 0.035, ease }}
      >
        {ch}
      </motion.span>
    ));

  const intro = "De la musique, des sourires, des souvenirs. La collection Smilers & Dancers : 9 visuels Made in France, et deux nouveaux drops dévoilés au Mexico Show.";
  const fade = (delay: number) => ({ initial: reduce ? false : { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.8, delay, ease } }) as const;

  return (
    <section ref={ref} className="relative min-h-[100svh] overflow-hidden bg-black grain">
      {/* Photo campagne 2026 (Groovers / The Real VIP) */}
      <motion.div style={{ y: imgY }} className="absolute inset-0">
        <Image
          src="/merch/photos/campagne-2026.jpg"
          alt="Campagne 2026 : t-shirts Groovers et The Real VIP is on the dancefloor"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[50%_30%] md:object-[50%_35%]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-black/30" />
        <div className="hidden md:block absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />
        {/* Mobile : voile sombre centré sur l'emblème pour faire ressortir le titre */}
        <div className="md:hidden absolute inset-0 bg-[radial-gradient(75%_42%_at_50%_44%,rgba(0,0,0,.72),rgba(0,0,0,.25)_70%,transparent)]" />
        <div className="md:hidden absolute inset-x-0 bottom-0 h-[45%] bg-gradient-to-t from-black via-black/90 to-transparent" />
      </motion.div>

      {/* ---------- MOBILE : l'emblème (Terre + titre) au centre, texte et boutons en bas ---------- */}
      <div className="md:hidden relative min-h-[100svh] flex flex-col px-5 pt-20 pb-8 text-center">
        <div className="relative flex-1 flex items-center justify-center">
          <motion.div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none w-[min(118vw,64svh)] aspect-square"
            initial={reduce ? false : { opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.9, scale: 1 }}
            transition={{ duration: 1.6, delay: 0.5, ease }}
          >
            <Globe fluid id="hero-m" />
          </motion.div>
          <div className="relative w-full">
            <motion.p {...fade(0.9)} className="t-condensed text-[15px] text-blue-sky tracking-[0.14em]">
              Electronic Music Events & Clothing · Lyon
            </motion.p>
            <h1 className="t-display text-[clamp(52px,18.5vw,92px)] leading-[0.86] mt-3 hero-glow">
              <span className="block overflow-hidden whitespace-nowrap pb-[0.06em] text-[#7a9be0]">{word("Smilin’", 0.15)}</span>
              <span className="block overflow-hidden whitespace-nowrap pb-[0.06em] text-[#e06a9f]">{word("Dancin’", 0.3)}</span>
            </h1>
          </div>
        </div>
        <div className="relative">
          <motion.p {...fade(1)} className="text-[15px] leading-relaxed text-white max-w-[34ch] mx-auto">{intro}</motion.p>
          <motion.div {...fade(1.1)} className="mt-6 grid grid-cols-2 gap-3">
            <Link href="/shop" className="btn btn-primary !px-3 !py-[15px]">Voir le shop</Link>
            <Link href="/events" className="btn btn-ghost !px-3 !py-[15px]">Événements</Link>
          </motion.div>
        </div>
      </div>

      {/* ---------- TABLETTE / PC ---------- */}
      <motion.div
        className="hidden md:block absolute right-[4vw] top-[10vh] pointer-events-none"
        initial={reduce ? false : { opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.6, delay: 0.6, ease }}
      >
        <Globe size={420} className="md:scale-[1.25] lg:scale-[1.5] origin-top-right" id="hero" />
      </motion.div>

      <motion.div style={{ y: textY }} className="hidden md:flex relative container-x min-h-[100svh] flex-col justify-end pb-16 pt-28">
        <motion.p {...fade(0.9)} className="t-condensed text-[22px] text-blue-sky mb-4 tracking-[0.12em]">
          Electronic Music Events & Clothing · Lyon
        </motion.p>
        <h1 className="t-display text-[14vw] lg:text-[13vw] 2xl:text-[200px] leading-[0.84] text-white">
          <span className="block overflow-hidden whitespace-nowrap pb-[0.06em] text-[#5d7fc4]">{word("Smilin’", 0.15)}</span>
          <span className="block overflow-hidden whitespace-nowrap pb-[0.06em] text-[#c45a84] sm:pl-[0.9em] lg:pl-[1.4em]">{word("Dancin’", 0.3)}</span>
        </h1>
        <div className="mt-10 grid grid-cols-[1fr_auto] gap-10 items-end">
          <motion.p {...fade(1)} className="max-w-md text-lg text-white/80 leading-snug">{intro}</motion.p>
          <motion.div {...fade(1.1)} className="flex flex-wrap gap-3">
            <Link href="/shop" className="btn btn-primary">Voir le shop</Link>
            <Link href="/events" className="btn btn-ghost">Les événements</Link>
          </motion.div>
        </div>
      </motion.div>

      <motion.div
        aria-hidden
        className="hidden md:block absolute bottom-4 left-1/2 -translate-x-1/2 text-white/40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8 }}
      >
        <motion.div animate={reduce ? undefined : { y: [0, 6, 0] }} transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}>
          <svg width="18" height="28" viewBox="0 0 18 28" fill="none" stroke="currentColor" strokeWidth="1.3"><rect x="1" y="1" width="16" height="26" rx="8" /><path d="M9 7v6" strokeLinecap="round" /></svg>
        </motion.div>
      </motion.div>
    </section>
  );
}
