"use client";
import { useMemo } from "react";

/**
 * Boule à facettes épurée, aux couleurs de la marque (bleu → framboise, éclats argent).
 * Facettes en SVG, rotation continue par rangée (CSS), ombrage sphérique, éclats qui scintillent.
 * Désactivée en reduced-motion (reste affichée, immobile).
 */
/* Miroirs : gris-bleu argentés en majorité, reflets bleu et framboise de la marque */
const SILVER = ["#1c2033", "#262c45", "#343b5a", "#454d70", "#5a6388", "#7b85a8", "#9ea7c4", "#c9cfe0", "#eceef5"];
const BLUE = ["#37548f", "#4a6bb0", "#5d7fc4", "#67a7dc"];
const PINK = ["#a9426b", "#c45a84", "#d04080", "#8a4a7a"];
function rnd(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

export function DiscoBall({ size = 420, className = "", fluid = false, id = "db", speed = 28 }: { size?: number; className?: string; fluid?: boolean; id?: string; speed?: number }) {
  const R = 100;
  const rows = useMemo(() => {
    const r = rnd(7);
    const N = 18; // rangées
    const out: { y: number; h: number; tiles: { w: number; c: string }[]; period: number }[] = [];
    for (let i = 0; i < N; i++) {
      const a0 = -Math.PI / 2 + (Math.PI * i) / N;
      const a1 = -Math.PI / 2 + (Math.PI * (i + 1)) / N;
      const y = R * Math.sin(a0);
      const h = R * (Math.sin(a1) - Math.sin(a0));
      const mid = Math.cos((a0 + a1) / 2);
      const count = Math.max(10, Math.round(30 * mid));
      const w = (2 * R * 1.6) / count; // une période = 1,6 × le diamètre
      const tiles = Array.from({ length: count }, () => {
        const p = r();
        const c = p < 0.6 ? SILVER[Math.floor(r() * SILVER.length)] : p < 0.82 ? BLUE[Math.floor(r() * 4)] : PINK[Math.floor(r() * 4)];
        return { w, c };
      });
      out.push({ y, h, tiles, period: w * count });
    }
    return out;
  }, []);

  const dim = fluid ? "100%" : size;
  return (
    <div className={`relative disco ${className}`} style={{ width: dim, height: dim }} aria-hidden>
      <div className="absolute inset-[-18%] neon-halo opacity-70" />
      <svg viewBox="-130 -130 260 260" width={dim} height={dim} className="relative">
        <defs>
          <clipPath id={`${id}-c`}>
            <circle r={R} />
          </clipPath>
          <radialGradient id={`${id}-shade`} cx="0.36" cy="0.3" r="0.8">
            <stop offset="0" stopColor="#fff" stopOpacity="0.3" />
            <stop offset="0.45" stopColor="#fff" stopOpacity="0" />
            <stop offset="0.72" stopColor="#000" stopOpacity="0.45" />
            <stop offset="1" stopColor="#000" stopOpacity="0.9" />
          </radialGradient>
          <radialGradient id={`${id}-spec`} cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#fff" stopOpacity="0.9" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </radialGradient>
        </defs>
        {/* attache */}
        <line x1="0" y1="-128" x2="0" y2={-R - 4} stroke="#bfc3d6" strokeWidth="1.4" opacity="0.8" />
        <rect x="-6" y={-R - 9} width="12" height="7" rx="1.5" fill="#bfc3d6" opacity="0.9" />
        <g clipPath={`url(#${id}-c)`}>
          <circle r={R} fill="#1a1d2e" />
          {rows.map((row, i) => {
            let x = -row.period;
            const rects: React.ReactNode[] = [];
            for (let k = 0; k < 2; k++) {
              for (let t = 0; t < row.tiles.length; t++) {
                const tile = row.tiles[t];
                rects.push(<rect key={`${k}-${t}`} x={x + 0.35} y={row.y + 0.35} width={tile.w - 0.7} height={row.h - 0.7} fill={tile.c} rx="0.6" />);
                x += tile.w;
              }
            }
            return (
              <g key={i} className="disco-row" style={{ ["--d" as string]: `${row.period}px`, animationDuration: `${speed}s`, animationDelay: `${-(i * 1.7) % speed}s` }}>
                {rects}
              </g>
            );
          })}
          <circle r={R} fill={`url(#${id}-shade)`} />
          <ellipse cx="-34" cy="-46" rx="26" ry="16" fill={`url(#${id}-spec)`} transform="rotate(-28 -34 -46)" opacity="0.55" />
        </g>
        <circle r={R} fill="none" stroke="#fff" strokeOpacity="0.14" strokeWidth="0.8" />
        {/* éclats */}
        {[
          [62, -58, 1.9, 0],
          [-78, 24, 1.4, 1.1],
          [30, 82, 1.6, 2.3],
          [-40, -84, 1.2, 0.6],
          [90, 30, 1.3, 1.8],
          [-6, -4, 2.2, 2.9],
        ].map(([x, y, s, d], i) => (
          <g key={i} className="disco-spark" style={{ animationDelay: `${d}s` }} transform={`translate(${x} ${y}) scale(${s})`}>
            <path d="M0 -6 L1.2 -1.2 L6 0 L1.2 1.2 L0 6 L-1.2 1.2 L-6 0 L-1.2 -1.2 Z" fill="#fff" />
          </g>
        ))}
      </svg>
    </div>
  );
}
