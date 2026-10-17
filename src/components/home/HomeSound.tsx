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
const KEY = "sd_sound_v2";
const GESTURES = ["pointerdown", "pointerup", "mousedown", "touchend", "click", "keydown"] as const;
const VOLUME = 0.25;
const SRC = "/audio/marea.mp3";
const TITLE = "Marea (We've Lost Dancing)";
const ARTIST = "Fred again.. feat. The Blessed Madonna";

export function HomeSound() {
  const audio = useRef<HTMLAudioElement | null>(null);
  const fade = useRef<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const [ready, setReady] = useState(false);
  const [waiting, setWaiting] = useState(false);

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
    const unbind = () => GESTURES.forEach((g) => window.removeEventListener(g, onGesture, true));
    const onGesture = () => {
      if (!armed) return;
      play().then((ok) => {
        if (ok) {
          armed = false;
          setWaiting(false);
          unbind();
        }
      });
    };
    if (wanted) {
      // Le navigateur bloque le son tant que le visiteur n'a pas interagi : on tente tout de suite,
      // et sinon la musique part au tout premier toucher / clic / touche, n'importe où sur la page.
      play().then((ok) => {
        if (!ok) {
          armed = true;
          setWaiting(true);
          GESTURES.forEach((g) => window.addEventListener(g, onGesture, { capture: true, passive: true }));
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
      unbind();
      document.removeEventListener("visibilitychange", onVis);
      stopFade();
      a.pause();
      a.src = "";
      audio.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggle = () => {
    setWaiting(false);
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
        className={cn("relative w-12 h-12 rounded-full border backdrop-blur-xl grid place-items-center transition-colors shadow-[0_10px_30px_-10px_rgba(169,66,107,.8)]", playing ? "g-brand text-white border-white/30" : "bg-black/70 text-white border-white/30")}
      >
        {waiting && <span className="absolute inset-0 rounded-full border-2 border-pink animate-ping" aria-hidden />}
        <span className="flex items-end gap-[2px] h-4" aria-hidden>
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className={cn("w-[3px] rounded-sm bg-current eq-bar", !playing && "!h-[3px] !animate-none")} style={{ animationDelay: `${i * 0.18}s`, animationDuration: `${0.9 + i * 0.17}s` }} />
          ))}
        </span>
      </button>
      <AnimatePresence>
        {(playing || waiting) && (
          <motion.div key={playing ? "p" : "w"} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -6 }} className={cn("rounded-full bg-black/70 backdrop-blur-xl border border-white/15 px-3.5 py-2 text-[11px] leading-tight text-white/85", playing ? "hidden sm:block" : "block md:order-none order-first")}>
            {playing ? (
              <>
                <span className="font-semibold">{TITLE}</span>
                <span className="text-white/55"> · {ARTIST}</span>
              </>
            ) : (
              <span className="font-semibold">Touchez l'écran pour le son</span>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
