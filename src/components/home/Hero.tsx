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

  return (
    <section ref={ref} className="relative min-h-[100svh] overflow-hidden bg-black grain">
      {/* Photo campagne 2026 — Groovers / The Real VIP (Instagram @smilin.dancin, highlight Merch') */}
      <motion.div style={{ y: imgY }} className="absolute inset-0">
        <Image
          src="/merch/photos/campaign-groovers-realvip.jpg"
          alt="Campagne 2026 : t-shirts Groovers et The Real VIP is on the dancefloor"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[50%_30%] md:object-[50%_35%]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-black/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />
      </motion.div>

      {/* Globe néon — l'emblème */}
      <motion.div
        className="absolute -right-[12vw] md:right-[4vw] top-[14vh] md:top-[10vh] pointer-events-none"
        initial={reduce ? false : { opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.6, delay: 0.6, ease }}
      >
        <Globe size={420} className="md:scale-[1.25] lg:scale-[1.5] origin-top-right" id="hero" />
      </motion.div>

      <motion.div style={{ y: textY }} className="relative container-x min-h-[100svh] flex flex-col justify-end pb-10 md:pb-16 pt-28">
        <motion.p
          initial={reduce ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9, ease }}
          className="t-condensed text-[18px] md:text-[22px] text-blue-sky mb-4 tracking-[0.12em]"
        >
          Electronic Music Events & Clothing — Lyon
        </motion.p>
        <h1 className="t-display text-[22vw] sm:text-[17vw] md:text-[13.5vw] leading-[0.82] text-white">
          <span className="block overflow-hidden pb-[0.06em] text-[#5d7fc4]">{word("Smilin’", 0.15)}</span>
          <span className="block overflow-hidden pb-[0.06em] text-[#c45a84] pl-[0.9em] md:pl-[1.4em]">{word("Dancin’", 0.3)}</span>
        </h1>
        <div className="mt-8 md:mt-10 grid md:grid-cols-[1fr_auto] gap-6 md:gap-10 items-end">
          <motion.p
            initial={reduce ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1, ease }}
            className="max-w-md text-base md:text-lg text-white/80 leading-snug"
          >
            De la musique, des sourires, des souvenirs. La collection Smilers & Dancers — 9 visuels, Made in France — et deux nouveaux drops dévoilés au Mexico Show.
          </motion.p>
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.1, ease }}
            className="flex flex-wrap gap-3"
          >
            <Link href="/shop" className="btn btn-primary">Voir le shop</Link>
            <Link href="/events" className="btn btn-ghost">Les événements</Link>
          </motion.div>
        </div>
      </motion.div>

      <motion.div
        aria-hidden
        className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/40"
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
