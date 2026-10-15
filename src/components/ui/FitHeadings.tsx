"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Règle typographique du site : un mot n'est jamais coupé et un titre ne déborde jamais de sa colonne.
 * Pour chaque grand titre, si la ligne la plus longue dépasse la largeur disponible,
 * la taille est réduite juste ce qu'il faut. Recalculé au redimensionnement et après chargement des polices.
 */
const SELECTOR = "h1, h2, h3, .t-display";

function widest(el: HTMLElement) {
  // largeur réelle du contenu (y compris les lignes en nowrap qui débordent)
  return Math.max(el.scrollWidth, ...Array.from(el.querySelectorAll<HTMLElement>("span")).map((s) => s.scrollWidth));
}

function fit(el: HTMLElement) {
  el.style.fontSize = "";
  const avail = el.clientWidth;
  if (!avail) return;
  let size = parseFloat(getComputedStyle(el).fontSize);
  let guard = 0;
  while (widest(el) > avail + 1 && guard < 40 && size > 14) {
    size *= 0.96;
    el.style.fontSize = `${size}px`;
    guard++;
  }
}

function fitAll() {
  document.querySelectorAll<HTMLElement>(SELECTOR).forEach(fit);
}

export function FitHeadings() {
  const pathname = usePathname();
  useEffect(() => {
    let raf = 0;
    const run = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(fitAll);
    };
    run();
    document.fonts?.ready.then(run);
    const t = setTimeout(run, 400);
    const ro = new ResizeObserver(run);
    ro.observe(document.documentElement);
    const mo = new MutationObserver(run);
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t);
      ro.disconnect();
      mo.disconnect();
    };
  }, [pathname]);
  return null;
}
