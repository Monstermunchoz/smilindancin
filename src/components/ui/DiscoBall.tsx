"use client";
import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";

/**
 * Boule à facettes au trait fin, dans le style exact de l'ancien globe néon :
 * mêmes dégradés (#67a7dc → #37548f → #d04080), même double couche (halo flouté + trait net), sans anneau.
 * Vraie projection 3D : parallèles inclinés + méridiens qui tournent, quelques facettes qui s'allument,
 * étoiles fines qui scintillent autour. Immobile si le visiteur a demandé moins d'animations.
 */
const R = 100;
const TILT = (14 * Math.PI) / 180; // inclinaison vers le spectateur
const LATS = [-72, -54, -36, -18, 0, 18, 36, 54, 72];
const MERIDIANS = 16; // un méridien tous les 22,5°
const LIT: [number, number][] = [ // facettes allumées : [bande de latitude, colonne]
  [3, 1], [5, 4], [2, 7], [6, 10], [4, 13], [1, 3], [7, 6], [5, 12], [3, 9],
];
const deg = Math.PI / 180;

function project(lat: number, lon: number) {
  const cl = Math.cos(lat), sl = Math.sin(lat);
  const x = R * cl * Math.sin(lon);
  const zf = R * cl * Math.cos(lon); // profondeur avant inclinaison
  const y = -(R * sl * Math.cos(TILT) - zf * Math.sin(TILT));
  const z = zf * Math.cos(TILT) + R * sl * Math.sin(TILT);
  return { x, y, z };
}

function meridianPaths(lon: number) {
  let front = "", back = "";
  let prevFront: boolean | null = null;
  for (let i = 0; i <= 36; i++) {
    const lat = -90 * deg + (i * 180 * deg) / 36;
    const p = project(lat, lon);
    const isFront = p.z >= 0;
    const pt = `${p.x.toFixed(2)} ${p.y.toFixed(2)}`;
    if (isFront) front += (prevFront === true ? " L" : " M") + pt;
    else back += (prevFront === false ? " L" : " M") + pt;
    prevFront = isFront;
  }
  return { front, back };
}

const BAND = [-90, ...LATS, 90];
function facet(band: number, col: number, rot: number) {
  const la0 = BAND[band] * deg, la1 = BAND[band + 1] * deg;
  const step = (360 / MERIDIANS) * deg;
  const lo0 = col * step + rot, lo1 = lo0 + step;
  const pts = [project(la0, lo0), project(la0, lo1), project(la1, lo1), project(la1, lo0)];
  const z = (pts[0].z + pts[1].z + pts[2].z + pts[3].z) / 4;
  const d = "M" + pts.map((p) => `${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(" L") + " Z";
  return { d, z };
}

const STARS: [number, number, number, number][] = [ // x, y, taille, délai
  [-118, -70, 1, 0], [112, -96, 0.75, 1.2], [124, 48, 0.9, 2.1], [-112, 86, 0.7, 0.7], [-28, -122, 0.6, 2.8], [62, 116, 0.65, 1.6],
];

export function DiscoBall({ size = 420, className = "", fluid = false, id = "db", speed = 26 }: { size?: number; className?: string; fluid?: boolean; id?: string; speed?: number }) {
  const reduce = useReducedMotion();
  const mFront = useRef<(SVGPathElement | null)[]>([]);
  const mBack = useRef<(SVGPathElement | null)[]>([]);
  const mGlow = useRef<(SVGPathElement | null)[]>([]);
  const lit = useRef<(SVGPathElement | null)[]>([]);

  useEffect(() => {
    let raf = 0;
    const t0 = performance.now();
    const draw = (t: number) => {
      const rot = reduce ? 0.35 : (((t - t0) / 1000) * (2 * Math.PI)) / speed;
      for (let k = 0; k < MERIDIANS; k++) {
        const { front, back } = meridianPaths(rot + (k * 2 * Math.PI) / MERIDIANS);
        mFront.current[k]?.setAttribute("d", front || "M0 0");
        mGlow.current[k]?.setAttribute("d", front || "M0 0");
        mBack.current[k]?.setAttribute("d", back || "M0 0");
      }
      LIT.forEach(([b, c], i) => {
        const el = lit.current[i];
        if (!el) return;
        const f = facet(b, c, rot);
        el.setAttribute("d", f.d);
        const pulse = reduce ? 0.6 : 0.45 + 0.55 * Math.abs(Math.sin(t / 900 + i * 1.7));
        el.setAttribute("opacity", f.z > 0 ? String(Math.min(1, (f.z / R) * 1.4) * pulse) : "0");
      });
      if (!reduce) raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [reduce, speed]);

  const dim = fluid ? "100%" : size;
  const grad = `url(#${id}-grad)`;
  const lat = LATS.map((la) => {
    const a = la * deg;
    return { cy: -R * Math.sin(a) * Math.cos(TILT), rx: R * Math.cos(a), ry: R * Math.cos(a) * Math.sin(TILT) };
  });

  return (
    <div className={`relative ${className}`} style={{ width: dim, height: dim }} aria-hidden>
      <div className="absolute inset-[-20%] neon-halo" />
      <svg viewBox="-130 -130 260 260" width={dim} height={dim} className="relative overflow-visible">
        <defs>
          <linearGradient id={`${id}-grad`} gradientUnits="userSpaceOnUse" x1="-100" y1="-100" x2="100" y2="100">
            <stop offset="0%" stopColor="#67a7dc" />
            <stop offset="45%" stopColor="#37548f" />
            <stop offset="100%" stopColor="#d04080" />
          </linearGradient>
          <linearGradient id={`${id}-fill`} gradientUnits="userSpaceOnUse" x1="-100" y1="-100" x2="100" y2="100">
            <stop offset="0%" stopColor="#67a7dc" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#d04080" stopOpacity="0.55" />
          </linearGradient>
          <linearGradient id={`${id}-star`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#67a7dc" />
            <stop offset="55%" stopColor="#8a6fc0" />
            <stop offset="100%" stopColor="#d04080" />
          </linearGradient>
          <filter id={`${id}-blur`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.2" />
          </filter>
        </defs>

        {/* fil de suspension */}
        <line x1="0" y1="-130" x2="0" y2={-R} stroke={grad} strokeWidth="1" opacity="0.8" />
        <rect x="-4.5" y={-R - 5} width="9" height="5" rx="1.2" fill="none" stroke={grad} strokeWidth="1" />

        {/* facettes allumées */}
        {LIT.map((_, i) => (
          <path key={i} ref={(el) => { lit.current[i] = el; }} fill={`url(#${id}-fill)`} stroke="none" />
        ))}

        {/* face arrière, très discrète */}
        <g stroke={grad} fill="none" strokeWidth="0.7" opacity="0.18">
          {Array.from({ length: MERIDIANS }, (_, k) => (
            <path key={k} ref={(el) => { mBack.current[k] = el; }} />
          ))}
        </g>

        {/* halo néon flouté (comme le globe) */}
        <g stroke={grad} fill="none" strokeWidth="1.4" opacity="0.5" filter={`url(#${id}-blur)`}>
          <circle r={R} />
          {lat.map((l, i) => <ellipse key={i} cx="0" cy={l.cy} rx={l.rx} ry={l.ry} />)}
          {Array.from({ length: MERIDIANS }, (_, k) => (
            <path key={k} ref={(el) => { mGlow.current[k] = el; }} />
          ))}
        </g>

        {/* trait net */}
        <g stroke={grad} fill="none" strokeWidth="1.1" strokeLinecap="round">
          <circle r={R} />
          {lat.map((l, i) => <ellipse key={i} cx="0" cy={l.cy} rx={l.rx} ry={l.ry} />)}
          {Array.from({ length: MERIDIANS }, (_, k) => (
            <path key={k} ref={(el) => { mFront.current[k] = el; }} />
          ))}
        </g>

        {/* étoiles au trait fin */}
        {STARS.map(([x, y, s, d], i) => (
          <g key={i} transform={`translate(${x} ${y}) scale(${s})`}>
            <g className="ds-star" style={{ animationDelay: `${d}s` }}>
              <path d="M0 -11 C0.8 -3 3 -0.8 11 0 C3 0.8 0.8 3 0 11 C-0.8 3 -3 0.8 -11 0 C-3 -0.8 -0.8 -3 0 -11 Z" fill="none" stroke={`url(#${id}-star)`} strokeWidth="0.9" strokeLinejoin="round" />
            </g>
          </g>
        ))}
      </svg>
    </div>
  );
}
