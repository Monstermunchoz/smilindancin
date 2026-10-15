"use client";
import { motion, useReducedMotion } from "motion/react";

/**
 * Le globe grillagé — transposition vectorielle de l'emblème Smilin' Dancin' (« The World Is Groove »).
 * Lignes bleu→rose, anneau orbital, halo néon. Rotation lente (désactivée en reduced-motion).
 */
export function Globe({ size = 520, className = "", speed = 60, glow = true, id = "g" }: { size?: number; className?: string; speed?: number; glow?: boolean; id?: string }) {
  const reduce = useReducedMotion();
  const r = 100;
  const lats = [-60, -30, 0, 30, 60];
  const longs = [0, 30, 60, 90, 120, 150];
  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }} aria-hidden>
      {glow && <div className="absolute inset-[-20%] neon-halo" />}
      <motion.svg
        viewBox="-130 -130 260 260"
        width={size}
        height={size}
        className="relative"
        animate={reduce ? undefined : { rotate: 360 }}
        transition={{ duration: speed, repeat: Infinity, ease: "linear" }}
        style={{ willChange: "transform" }}
      >
        <defs>
          <linearGradient id={`${id}-grad`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#67a7dc" />
            <stop offset="45%" stopColor="#37548f" />
            <stop offset="100%" stopColor="#d04080" />
          </linearGradient>
          <filter id={`${id}-blur`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.2" />
          </filter>
        </defs>
        <g stroke={`url(#${id}-grad)`} fill="none" strokeWidth="1.4" opacity="0.5" filter={`url(#${id}-blur)`}>
          <circle r={r} />
          {lats.map((la) => {
            const y = r * Math.sin((la * Math.PI) / 180);
            const rx = r * Math.cos((la * Math.PI) / 180);
            return <ellipse key={la} cx="0" cy={y} rx={rx} ry={rx * 0.22} />;
          })}
          {longs.map((lo) => (
            <ellipse key={lo} rx={r * Math.abs(Math.cos((lo * Math.PI) / 180)) || 0.5} ry={r} transform={`rotate(${lo})`} />
          ))}
        </g>
        <g stroke={`url(#${id}-grad)`} fill="none" strokeWidth="1.1">
          <circle r={r} />
          {lats.map((la) => {
            const y = r * Math.sin((la * Math.PI) / 180);
            const rx = r * Math.cos((la * Math.PI) / 180);
            return <ellipse key={la} cx="0" cy={y} rx={rx} ry={rx * 0.22} />;
          })}
          {longs.map((lo) => (
            <ellipse key={lo} rx={r * Math.abs(Math.cos((lo * Math.PI) / 180)) || 0.5} ry={r} transform={`rotate(${lo})`} />
          ))}
        </g>
      </motion.svg>
      {/* anneau orbital fixe, comme sur l'emblème */}
      <svg viewBox="-130 -130 260 260" width={size} height={size} className="absolute inset-0" aria-hidden>
        <ellipse rx="124" ry="22" fill="none" stroke="#67a7dc" strokeWidth="1.2" opacity="0.9" transform="rotate(-8)" />
        <ellipse rx="124" ry="22" fill="none" stroke="#67a7dc" strokeWidth="4" opacity="0.25" transform="rotate(-8)" style={{ filter: "blur(3px)" }} />
      </svg>
    </div>
  );
}
