"use client";
import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";

/**
 * Boule à facettes au trait fin, dans l'esprit de l'ancien globe néon
 * (dégradé #67a7dc → #37548f → #d04080, halo flouté), sans anneau.
 * - vraies rangées de miroirs décalées en quinconce, comme une boule réelle (pas un quadrillage de planète)
 * - facettes teintées selon la lumière + facettes qui scintillent
 * - fil qui descend du haut de l'écran
 * - étoiles fines qui scintillent aux points de reflet
 */
const R = 100;
const TILT = (16 * Math.PI) / 180;
const deg = Math.PI / 180;
const BANDS = 13; // rangées de miroirs
const EDGES = Array.from({ length: BANDS + 1 }, (_, i) => -90 + (180 * i) / BANDS);
const LIGHT = (() => { const v = [-0.5, -0.62, 0.6]; const n = Math.hypot(...v); return v.map((x) => x / n); })();

function project(lat: number, lon: number) {
  const cl = Math.cos(lat), sl = Math.sin(lat);
  const x = R * cl * Math.sin(lon);
  const zf = R * cl * Math.cos(lon);
  const y = -(R * sl * Math.cos(TILT) - zf * Math.sin(TILT));
  const z = zf * Math.cos(TILT) + R * sl * Math.sin(TILT);
  return { x, y, z };
}
const f2 = (n: number) => n.toFixed(2);

/* Rangées : nombre de miroirs, décalage en quinconce, et un « tirage » fixe par miroir pour le scintillement */
const ROWS = Array.from({ length: BANDS }, (_, b) => {
  const mid = ((EDGES[b] + EDGES[b + 1]) / 2) * deg;
  const n = Math.max(6, Math.round(30 * Math.cos(mid)));
  const seeds = Array.from({ length: n }, (_, k) => {
    const h = Math.sin((b + 1) * 91.7 + k * 37.3) * 43758.5453;
    return h - Math.floor(h);
  });
  return { la0: EDGES[b] * deg, la1: EDGES[b + 1] * deg, n, off: (b % 2) * 0.5, seeds };
});

/* Parallèles : uniquement la moitié visible (statique) */
const PARALLELS = EDGES.slice(1, -1).map((la) => {
  let d = "";
  let on = false;
  for (let i = 0; i <= 72; i++) {
    const p = project(la * deg, (i / 72) * 2 * Math.PI);
    if (p.z >= -0.5) { d += (on ? " L" : " M") + f2(p.x) + " " + f2(p.y); on = true; } else on = false;
  }
  return d;
}).join(" ");

const LEVELS = [0.1, 0.22, 0.38, 0.6];

export function DiscoBall({ size = 420, className = "", fluid = false, id = "db", speed = 30 }: { size?: number; className?: string; fluid?: boolean; id?: string; speed?: number }) {
  const reduce = useReducedMotion();
  const edges = useRef<SVGPathElement | null>(null);
  const fills = useRef<(SVGPathElement | null)[]>([]);
  const shine = useRef<SVGPathElement | null>(null);

  useEffect(() => {
    let raf = 0;
    const t0 = performance.now();
    const draw = (now: number) => {
      const t = (now - t0) / 1000;
      const rot = reduce ? 0.4 : (t * 2 * Math.PI) / speed;
      let e = "";
      const buckets = ["", "", "", ""];
      let white = "";
      for (const row of ROWS) {
        const step = (2 * Math.PI) / row.n;
        for (let k = 0; k < row.n; k++) {
          const lo0 = (k + row.off) * step + rot, lo1 = lo0 + step;
          const a = project(row.la0, lo0), b = project(row.la0, lo1), c = project(row.la1, lo1), d = project(row.la1, lo0);
          const cz = (a.z + b.z + c.z + d.z) / 4;
          if (cz <= 0) continue;
          // arête verticale du miroir (gauche) : décalée d'une rangée à l'autre = quinconce
          e += ` M${f2(a.x)} ${f2(a.y)} L${f2(d.x)} ${f2(d.y)}`;
          // teinte : lumière (haut-gauche) + scintillement propre à chaque miroir
          const cx = (a.x + b.x + c.x + d.x) / 4 / R, cy = (a.y + b.y + c.y + d.y) / 4 / R;
          const lum = Math.max(0, cx * LIGHT[0] + cy * LIGHT[1] + (cz / R) * LIGHT[2]);
          const s = row.seeds[k];
          const tw = s > 0.55 ? Math.pow(0.5 + 0.5 * Math.sin(t * (1.2 + s * 2.4) + s * 40), 3) : 0;
          const v = lum * 0.55 + tw * 0.75 + (s < 0.18 ? 0.25 : 0);
          const poly = ` M${f2(a.x)} ${f2(a.y)} L${f2(b.x)} ${f2(b.y)} L${f2(c.x)} ${f2(c.y)} L${f2(d.x)} ${f2(d.y)} Z`;
          if (v > 0.95 && tw > 0.6) white += poly;
          else if (v > 0.68) buckets[3] += poly;
          else if (v > 0.45) buckets[2] += poly;
          else if (v > 0.25) buckets[1] += poly;
          else if (v > 0.1) buckets[0] += poly;
        }
      }
      edges.current?.setAttribute("d", e || "M0 0");
      buckets.forEach((d, i) => fills.current[i]?.setAttribute("d", d || "M0 0"));
      shine.current?.setAttribute("d", white || "M0 0");
      if (!reduce) raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [reduce, speed]);

  const dim = fluid ? "100%" : size;
  const grad = `url(#${id}-grad)`;

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
          <linearGradient id={`${id}-tile`} gradientUnits="userSpaceOnUse" x1="-100" y1="-100" x2="100" y2="100">
            <stop offset="0%" stopColor="#7fb6e6" />
            <stop offset="50%" stopColor="#5d6fc0" />
            <stop offset="100%" stopColor="#e05592" />
          </linearGradient>
          <linearGradient id={`${id}-wire`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#67a7dc" stopOpacity="0" />
            <stop offset="70%" stopColor="#67a7dc" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#8a7fd0" stopOpacity="0.9" />
          </linearGradient>
          <radialGradient id={`${id}-depth`} cx="0.38" cy="0.32" r="0.75">
            <stop offset="0%" stopColor="#0b0d18" stopOpacity="0" />
            <stop offset="100%" stopColor="#0b0d18" stopOpacity="0.55" />
          </radialGradient>
          <linearGradient id={`${id}-star`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#bfe0ff" />
            <stop offset="50%" stopColor="#9b8be0" />
            <stop offset="100%" stopColor="#ff7fb6" />
          </linearGradient>
          <filter id={`${id}-blur`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.2" />
          </filter>
          <filter id={`${id}-glow`} x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="2.4" />
          </filter>
        </defs>

        {/* fil : descend du haut de l'écran jusqu'à l'attache */}
        <line x1="0" y1="-2400" x2="0" y2={-R - 7} stroke="#67a7dc" strokeOpacity="0.55" strokeWidth="0.9" />
        {/* attache */}
        <path d={`M-5 ${-R - 1} L-5 ${-R - 7} Q0 ${-R - 10} 5 ${-R - 7} L5 ${-R - 1}`} fill="none" stroke={grad} strokeWidth="1" strokeLinejoin="round" />
        <circle cx="0" cy={-R - 9.5} r="2" fill="none" stroke={grad} strokeWidth="0.9" />

        {/* profondeur légère */}
        <circle r={R} fill={`url(#${id}-depth)`} />

        {/* miroirs teintés */}
        {LEVELS.map((o, i) => (
          <path key={i} ref={(el) => { fills.current[i] = el; }} fill={`url(#${id}-tile)`} fillOpacity={o} />
        ))}
        <path ref={shine} fill="#eef3ff" fillOpacity="0.62" />

        {/* halo néon (statique, comme le globe) */}
        <g stroke={grad} fill="none" strokeWidth="1.4" opacity="0.45" filter={`url(#${id}-blur)`}>
          <circle r={R} />
          <path d={PARALLELS} />
        </g>

        {/* trait net */}
        <g stroke={grad} fill="none" strokeLinecap="round">
          <path d={PARALLELS} strokeWidth="0.75" opacity="0.9" />
          <path ref={edges} strokeWidth="0.7" opacity="0.85" />
          <circle r={R} strokeWidth="1.2" />
          <circle r={R + 3.5} strokeWidth="0.5" opacity="0.35" />
        </g>

        {/* reflet principal sur la boule */}
        <Star x={-44} y={-52} s={0.85} d={0.4} id={id} />
        {/* étoiles aux points stratégiques */}
        <Star x={-128} y={-38} s={1.15} d={1.3} id={id} />
        <Star x={122} y={-88} s={0.9} d={2.2} id={id} />
        <Star x={118} y={70} s={1.05} d={0.9} id={id} />
        <Star x={-92} y={112} s={0.7} d={2.8} id={id} />
        <Star x={52} y={34} s={0.55} d={1.9} id={id} />
      </svg>
    </div>
  );
}

function Star({ x, y, s, d, id }: { x: number; y: number; s: number; d: number; id: string }) {
  const big = "M0 -18 C0.9 -4 4 -0.9 18 0 C4 0.9 0.9 4 0 18 C-0.9 4 -4 0.9 -18 0 C-4 -0.9 -0.9 -4 0 -18 Z";
  const small = "M0 -7 C0.5 -1.6 1.6 -0.5 7 0 C1.6 0.5 0.5 1.6 0 7 C-0.5 1.6 -1.6 0.5 -7 0 C-1.6 -0.5 -0.5 -1.6 0 -7 Z";
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <g className="ds-star" style={{ animationDelay: `${d}s`, animationDuration: `${2.6 + (d % 1.3)}s` }}>
        <path d={big} fill={`url(#${id}-star)`} filter={`url(#${id}-glow)`} opacity="0.9" />
        <path d={big} fill={`url(#${id}-star)`} />
        <path d={small} fill="#fff" transform="rotate(45)" opacity="0.85" />
        <circle r="1.6" fill="#fff" />
      </g>
    </g>
  );
}
