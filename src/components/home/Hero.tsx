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
  const imgY = useTransform(scrollYProgress, [0, 1], ["-4%", reduce ? "-4%" : "6%"]);

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
    <section ref={ref} className="relative overflow-hidden bg-black grain pt-28 md:pt-32 pb-14 md:pb-20">
      {/* Globe néon : l'emblème, sur le fond noir uniquement */}
      <motion.div
        className="hidden lg:block absolute -left-[14vw] top-[8vh] pointer-events-none"
        initial={reduce ? false : { opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.3, scale: 1 }}
        transition={{ duration: 1.6, delay: 0.6, ease }}
      >
        <Globe size={560} id="hero" />
      </motion.div>

      <div className="m-center relative container-x grid lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] gap-10 lg:gap-14 items-center">
        <div className="order-1">
          <motion.p
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9, ease }}
            className="t-condensed text-[18px] md:text-[22px] text-blue-sky mb-4 tracking-[0.12em]"
          >
            Electronic Music Events & Clothing · Lyon
          </motion.p>
          <h1 className="t-display text-[clamp(44px,15.5vw,96px)] sm:text-[13vw] lg:text-[8.4vw] 2xl:text-[164px] leading-[0.84] text-white">
            <span className="block overflow-hidden whitespace-nowrap pb-[0.06em] text-[#5d7fc4]">{word("Smilin’", 0.15)}</span>
            <span className="block overflow-hidden whitespace-nowrap pb-[0.06em] text-[#c45a84] lg:pl-[0.6em]">{word("Dancin’", 0.3)}</span>
          </h1>
          <motion.p
            initial={reduce ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1, ease }}
            className="hidden lg:block mt-10 max-w-md text-lg text-white/80 leading-snug"
          >
            De la musique, des sourires, des souvenirs. La collection Smilers & Dancers : 9 visuels Made in France, et deux nouveaux drops dévoilés au Mexico Show.
          </motion.p>
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.1, ease }}
            className="hidden lg:flex flex-wrap gap-3 mt-8"
          >
            <Link href="/shop" className="btn btn-primary">Voir le shop</Link>
            <Link href="/events" className="btn btn-ghost">Les événements</Link>
          </motion.div>
        </div>

        {/* Photo campagne 2026, sans aucun texte par-dessus */}
        <motion.div
          className="order-2 relative w-full aspect-[4/5] sm:aspect-[5/4] lg:aspect-[4/5] overflow-hidden rounded-[4px]"
          initial={reduce ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, delay: 0.4, ease }}
        >
          <motion.div style={{ y: imgY }} className="absolute inset-[-6%_0]">
            <Image
              src="/merch/photos/campagne-2026.jpg"
              alt="Campagne 2026 : t-shirts Groovers et The Real VIP is on the dancefloor"
              fill
              priority
              sizes="(max-width:1024px) 100vw, 42vw"
              className="object-cover object-[50%_30%]"
            />
          </motion.div>
        </motion.div>

        <div className="order-3 lg:hidden">
          <p className="max-w-md text-base text-white/80 leading-snug">De la musique, des sourires, des souvenirs. La collection Smilers & Dancers : 9 visuels Made in France, et deux nouveaux drops dévoilés au Mexico Show.</p>
          <div className="flex flex-wrap gap-3 mt-6">
            <Link href="/shop" className="btn btn-primary">Voir le shop</Link>
            <Link href="/events" className="btn btn-ghost">Les événements</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
