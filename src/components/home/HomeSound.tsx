"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/format";

/**
 * Ambiance sonore de l'accueil.
 * Règles respectées :
 * - les navigateurs interdisent le son automatique sans geste : on tente, sinon on démarre au premier tap/clic/touche ;
 * - volume bas (25 %) avec fondu d'entrée, fondu de sortie à la pause ;
 * - bouton toujours visible pour couper ; le choix « coupé » est mémorisé, on ne relance jamais contre l'avis du visiteur ;
 * - pause quand l'onglet passe en arrière-plan, arrêt en quittant l'accueil ;
 * - aucun son si le visiteur a demandé moins d'animations (prefers-reduced-motion).
 */
const KEY = "sd_sound";
const VOLUME = 0.25;
const SRC = "/audio/marea.mp3";
const TITLE = "Marea (We've Lost Dancing)";
const ARTIST = "Fred again.. feat. The Blessed Madonna";

export function HomeSound() {
  const audio = useRef<HTMLAudioElement | null>(null);
  const fade = useRef<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const [ready, setReady] = useState(false);

  const stopFade = () => {
    if (fade.current) cancelAnimationFrame(fade.current);
    fade.current = null;
  };
  const rampTo = useCallback((target: number, ms: number, then?: () => void) => {
    const a = audio.current;
    if (!a) return;
    stopFade();
    const from = a.volume;
    const t0 = performance.now();
    const step = (t: number) => {
      const k = Math.min(1, (t - t0) / ms);
      a.volume = from + (target - from) * k;
      if (k < 1) fade.current = requestAnimationFrame(step);
      else {
        fade.current = null;
        then?.();
      }
    };
    fade.current = requestAnimationFrame(step);
  }, []);

  const play = useCallback(async () => {
    const a = audio.current;
    if (!a) return false;
    try {
      a.volume = 0;
      await a.play();
      rampTo(VOLUME, 2200);
      setPlaying(true);
      return true;
    } catch {
      return false;
    }
  }, [rampTo]);

  const pause = useCallback(() => {
    const a = audio.current;
    if (!a) return;
    rampTo(0, 450, () => a.pause());
    setPlaying(false);
  }, [rampTo]);

  useEffect(() => {
    const a = new Audio(SRC);
    a.preload = "auto";
    a.loop = true;
    audio.current = a;
    setReady(true);

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let pref: string | null = null;
    try {
      pref = localStorage.getItem(KEY);
    } catch {}
    const wanted = pref !== "off" && !reduce;

    let armed = false;
    const onGesture = () => {
      if (!armed) return;
      armed = false;
      window.removeEventListener("pointerdown", onGesture);
      window.removeEventListener("keydown", onGesture);
      play();
    };
    if (wanted) {
      play().then((ok) => {
        if (!ok) {
          armed = true;
          window.addEventListener("pointerdown", onGesture, { passive: true });
          window.addEventListener("keydown", onGesture);
        }
      });
    }

    let hiddenWhilePlaying = false;
    const onVis = () => {
      if (document.hidden) {
        hiddenWhilePlaying = !a.paused;
        if (!a.paused) a.pause();
      } else if (hiddenWhilePlaying) {
        a.play().catch(() => {});
      }
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      armed = false;
      window.removeEventListener("pointerdown", onGesture);
      window.removeEventListener("keydown", onGesture);
      document.removeEventListener("visibilitychange", onVis);
      stopFade();
      a.pause();
      a.src = "";
      audio.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggle = () => {
    if (playing) {
      pause();
      try {
        localStorage.setItem(KEY, "off");
      } catch {}
    } else {
      play();
      try {
        localStorage.setItem(KEY, "on");
      } catch {}
    }
  };

  if (!ready) return null;
  return (
    <div className="fixed z-40 right-4 top-[80px] md:right-auto md:top-auto md:left-6 md:bottom-[calc(24px+env(safe-area-inset-bottom))] flex items-center gap-2">
      <button
        type="button"
        onClick={toggle}
        aria-pressed={playing}
        aria-label={playing ? "Couper la musique" : "Lancer la musique"}
        title={playing ? "Couper la musique" : "Lancer la musique"}
        className={cn("w-11 h-11 rounded-full border backdrop-blur-xl grid place-items-center transition-colors", playing ? "bg-white text-black border-white" : "bg-black/60 text-white border-white/20")}
      >
        <span className="flex items-end gap-[2px] h-4" aria-hidden>
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className={cn("w-[3px] rounded-sm bg-current eq-bar", !playing && "!h-[3px] !animate-none")} style={{ animationDelay: `${i * 0.18}s`, animationDuration: `${0.9 + i * 0.17}s` }} />
          ))}
        </span>
      </button>
      <AnimatePresence>
        {playing && (
          <motion.div initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -6 }} className="hidden sm:block rounded-full bg-black/60 backdrop-blur-xl border border-white/15 px-3.5 py-2 text-[11px] leading-tight text-white/85">
            <span className="font-semibold">{TITLE}</span>
            <span className="text-white/55"> · {ARTIST}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
