"use client";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/format";

/**
 * Vue 3D devant / dos d'une pièce de la collection Smilers & Dancers.
 * Les visuels imprimés sont les fichiers officiels (extraits du post @smilin.dancin),
 * posés sur une silhouette de la coupe et du coloris choisis. Rendu indicatif, pas une photo.
 */

type Cut = "classic-h" | "oversize-h" | "debardeur-h" | "classic-f" | "croptop-f" | "debardeur-f";
type Shape = { body: string; neckFront: string; neckBack: string; chest: [number, number]; back: [number, number, number]; bottom: number };

const TEE: Shape = {
  body: "M132 40 C150 56 250 56 268 40 L345 70 L394 150 L342 180 L318 152 L320 452 C262 464 138 464 80 452 L82 152 L58 180 L6 150 L55 70 Z",
  neckFront: "M132 40 C152 84 248 84 268 40 C250 66 150 66 132 40 Z",
  neckBack: "M132 40 C152 58 248 58 268 40 C250 50 150 50 132 40 Z",
  chest: [218, 102],
  back: [118, 96, 164],
  bottom: 458,
};
const SHAPES: Record<"tee" | "oversize" | "crop" | "tank" | "hoodie", Shape> = {
  tee: TEE,
  oversize: {
    body: "M136 42 C154 58 246 58 264 42 L352 62 L398 170 L338 198 L322 174 L328 462 C262 476 138 476 72 462 L78 174 L62 198 L2 170 L48 62 Z",
    neckFront: "M136 42 C154 82 246 82 264 42 C248 64 152 64 136 42 Z",
    neckBack: "M136 42 C154 58 246 58 264 42 C248 52 152 52 136 42 Z",
    chest: [220, 104],
    back: [114, 100, 172],
    bottom: 468,
  },
  crop: {
    body: "M140 42 C156 58 244 58 260 42 L330 72 L372 142 L328 166 L310 142 L312 356 C262 366 138 366 88 356 L90 142 L72 166 L28 142 L70 72 Z",
    neckFront: "M140 42 C156 82 244 82 260 42 C246 64 154 64 140 42 Z",
    neckBack: "M140 42 C156 58 244 58 260 42 C246 52 154 52 140 42 Z",
    chest: [214, 104],
    back: [128, 92, 144],
    bottom: 362,
  },
  tank: {
    body: "M142 30 C160 74 240 74 258 30 L288 34 C292 108 312 138 324 160 L324 454 C262 466 138 466 76 454 L76 160 C88 138 108 108 112 34 Z",
    neckFront: "M142 30 C160 78 240 78 258 30 L250 30 C236 66 164 66 150 30 Z",
    neckBack: "M142 30 C160 54 240 54 258 30 L250 30 C236 46 164 46 150 30 Z",
    chest: [216, 104],
    back: [122, 100, 156],
    bottom: 460,
  },
  hoodie: {
    body: "M130 52 L64 78 C40 124 28 232 20 372 L62 382 L86 210 L86 432 C150 446 250 446 314 432 L314 210 L338 382 L380 372 C372 232 360 124 336 78 L270 52 Z",
    neckFront: "M122 62 C104 -6 296 -6 278 62 C264 104 136 104 122 62 Z",
    neckBack: "M128 56 C110 6 290 6 272 56 C270 120 130 120 128 56 Z",
    chest: [232, 120],
    back: [130, 120, 140],
    bottom: 440,
  },
};

function shapeFor(kind: "tee" | "hoodie", cut?: Cut): Shape {
  if (kind === "hoodie") return SHAPES.hoodie;
  if (cut === "oversize-h") return SHAPES.oversize;
  if (cut === "croptop-f") return SHAPES.crop;
  if (cut === "debardeur-h" || cut === "debardeur-f") return SHAPES.tank;
  return SHAPES.tee;
}

function isDark(hex: string) {
  const n = parseInt(hex.replace("#", ""), 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b < 140;
}

function printSrc(visual: number, dark: boolean) {
  if (visual === 9) return "/merch/prints/09.png";
  return `/merch/prints/${String(visual).padStart(2, "0")}-${dark ? "dark" : "light"}.png`;
}

/** Ratio largeur/hauteur des fichiers d'impression (pour ne jamais déformer un visuel). */
const RATIO: Record<number, number> = { 1: 316 / 298, 2: 385 / 392, 3: 325 / 84, 4: 311 / 360, 5: 377 / 373, 6: 348 / 255, 7: 1, 8: 316 / 392, 9: 568 / 580 };

function Face({ side, shape, kind, hex, visual, print }: { side: "front" | "back"; shape: Shape; kind: "tee" | "hoodie"; hex: string; visual: number; print: "front" | "back" }) {
  const dark = isDark(hex);
  const id = `g-${side}-${kind}`;
  const stroke = dark ? "rgba(255,255,255,.10)" : "rgba(0,0,0,.14)";
  const neckFill = dark ? "rgba(0,0,0,.55)" : "rgba(0,0,0,.16)";

  // Placement des impressions
  const prints: { src: string; x: number; y: number; w: number; r: number }[] = [];
  const wordmarkOnly = visual === 3;
  if (side === "front") {
    if (kind === "hoodie") {
      if (wordmarkOnly) prints.push({ src: printSrc(3, dark), x: 200 - 70, y: 150, w: 140, r: RATIO[3] });
      else prints.push({ src: printSrc(visual, dark), x: shape.chest[0], y: shape.chest[1] + 24, w: 62, r: RATIO[visual] });
    } else if (print === "front") {
      prints.push({ src: printSrc(visual, dark), x: shape.chest[0], y: shape.chest[1], w: visual === 3 ? 74 : 60, r: RATIO[visual] });
    } else {
      prints.push({ src: printSrc(3, dark), x: shape.chest[0], y: shape.chest[1] + 8, w: 62, r: RATIO[3] });
    }
  } else if (kind === "tee" && print === "back") {
    const [x, y, w] = shape.back;
    const r = RATIO[visual];
    const ww = r > 1.8 ? w + 24 : r < 0.9 ? w * 0.86 : w;
    prints.push({ src: printSrc(visual, dark), x: 200 - ww / 2, y: y + (r > 1.8 ? 50 : 0), w: ww, r });
    void x;
  }

  return (
    <svg viewBox="0 0 400 480" className="absolute inset-0 w-full h-full" aria-hidden>
      <defs>
        <clipPath id={`${id}-clip`}>
          <path d={shape.body} />
        </clipPath>
        <linearGradient id={`${id}-side`} x1="0" x2="1">
          <stop offset="0" stopColor="#000" stopOpacity={dark ? 0.5 : 0.22} />
          <stop offset="0.22" stopColor="#000" stopOpacity="0" />
          <stop offset="0.78" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity={dark ? 0.5 : 0.22} />
        </linearGradient>
        <radialGradient id={`${id}-light`} cx="0.42" cy="0.28" r="0.7">
          <stop offset="0" stopColor="#fff" stopOpacity={dark ? 0.12 : 0.35} />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${id}-fold`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#000" stopOpacity="0" />
          <stop offset="0.5" stopColor="#000" stopOpacity={dark ? 0.18 : 0.07} />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </linearGradient>
        <filter id={`${id}-fabric`} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="1.6" numOctaves="2" seed={side === "front" ? 3 : 7} />
          <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .09 0" />
          <feComposite in2="SourceGraphic" operator="in" />
        </filter>
      </defs>
      <g clipPath={`url(#${id}-clip)`}>
        <rect width="400" height="480" fill={hex} />
        {kind === "hoodie" && side === "front" && (
          <>
            <path d="M138 318 L262 318 L284 404 L116 404 Z" fill="none" stroke={stroke} strokeWidth="2" />
            <rect x="86" y="414" width="228" height="30" fill="#000" opacity={dark ? 0.25 : 0.06} />
            <rect x="20" y="360" width="44" height="24" fill="#000" opacity={dark ? 0.25 : 0.06} transform="rotate(4 42 372)" />
            <rect x="336" y="360" width="44" height="24" fill="#000" opacity={dark ? 0.25 : 0.06} transform="rotate(-4 358 372)" />
          </>
        )}
        {prints.map((p) => (
          <image key={p.src + p.x} href={p.src} x={p.x} y={p.y} width={p.w} height={p.w / p.r} preserveAspectRatio="xMidYMid meet" opacity={0.96} />
        ))}
        <rect width="400" height="480" fill={`url(#${id}-side)`} />
        <rect width="400" height="480" fill={`url(#${id}-light)`} />
        <path d="M120 200 C170 260 150 360 210 440 L240 440 C190 360 210 260 160 200 Z" fill={`url(#${id}-fold)`} />
        <rect width="400" height="480" fill={hex} filter={`url(#${id}-fabric)`} />
      </g>
      <path d={shape.body} fill="none" stroke={stroke} strokeWidth="1.5" />
      <path d={side === "front" ? shape.neckFront : shape.neckBack} fill={kind === "hoodie" ? hex : neckFill} stroke={stroke} strokeWidth="1.5" />
      {kind === "hoodie" && side === "front" && (
        <>
          <path d="M146 64 C146 18 254 18 254 64 C242 94 158 94 146 64 Z" fill="#000" opacity={dark ? 0.55 : 0.2} />
          <path d="M146 64 C158 94 242 94 254 64" fill="none" stroke={stroke} strokeWidth="2" />
          <path d="M186 92 L183 168" stroke={dark ? "#d9d9d9" : "#666"} strokeWidth="2.5" strokeLinecap="round" />
          <path d="M214 92 L217 168" stroke={dark ? "#d9d9d9" : "#666"} strokeWidth="2.5" strokeLinecap="round" />
          <rect x="180.5" y="166" width="5" height="9" rx="1.5" fill={dark ? "#bbb" : "#888"} />
          <rect x="214.5" y="166" width="5" height="9" rx="1.5" fill={dark ? "#bbb" : "#888"} />
        </>
      )}
      {kind === "hoodie" && side === "back" && <path d="M128 56 C130 120 270 120 272 56" fill="none" stroke={stroke} strokeWidth="2" />}
    </svg>
  );
}

export function GarmentViewer({ visual, hex, kind, cut, print = "back", className }: { visual: number; hex: string; kind: "tee" | "hoodie"; cut?: Cut; print?: "front" | "back"; className?: string }) {
  const shape = shapeFor(kind, cut);
  const [angle, setAngle] = useState(kind === "tee" && print === "back" ? 180 : 0);
  const [dragging, setDragging] = useState(false);
  const [spin, setSpin] = useState(false);
  const start = useRef<{ x: number; a: number } | null>(null);

  // Quand on change d'impression, on montre la face concernée
  useEffect(() => {
    setSpin(false);
    setAngle((a) => {
      const target = kind === "tee" && print === "back" ? 180 : 0;
      const base = Math.round(a / 360) * 360;
      return base + target;
    });
  }, [print, kind]);

  useEffect(() => {
    if (!spin) return;
    let raf = 0;
    let last = performance.now();
    const tick = (t: number) => {
      setAngle((a) => a + (t - last) * 0.06);
      last = t;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [spin]);

  const norm = ((angle % 360) + 360) % 360;
  const showingBack = norm > 90 && norm < 270;
  const goto = (side: "front" | "back") => {
    setSpin(false);
    setAngle((a) => {
      const base = Math.round(a / 360) * 360;
      return base + (side === "back" ? 180 : 0);
    });
  };

  return (
    <div className={cn("relative w-full h-full select-none overflow-hidden", className)}>
      <div className="absolute inset-0 bg-[radial-gradient(70%_55%_at_50%_42%,rgba(55,84,143,.45),transparent_70%),radial-gradient(60%_40%_at_50%_95%,rgba(169,66,107,.35),transparent_70%)]" />
      <div className="absolute inset-0 grain opacity-60" />
      {/* ombre au sol, qui s'affine quand la pièce est de profil */}
      <div
        className="absolute left-1/2 bottom-[7%] h-[5%] w-[58%] -translate-x-1/2 rounded-[50%] bg-black/60 blur-xl"
        style={{ transform: `translateX(-50%) scaleX(${0.35 + 0.65 * Math.abs(Math.cos((angle * Math.PI) / 180))})` }}
      />
      <div
        className="absolute inset-0 flex items-center justify-center cursor-grab active:cursor-grabbing"
        style={{ perspective: 1400, touchAction: "pan-y" }}
        onPointerDown={(e) => {
          setSpin(false);
          setDragging(true);
          start.current = { x: e.clientX, a: angle };
          e.currentTarget.setPointerCapture?.(e.pointerId);
        }}
        onPointerMove={(e) => {
          if (!start.current) return;
          setAngle(start.current.a + (e.clientX - start.current.x) * 0.7);
        }}
        onPointerUp={() => {
          start.current = null;
          setDragging(false);
          setAngle((a) => Math.round(a / 180) * 180);
        }}
        onPointerCancel={() => {
          start.current = null;
          setDragging(false);
          setAngle((a) => Math.round(a / 180) * 180);
        }}
      >
        <div
          className="relative w-[78%] aspect-[400/480]"
          style={{
            transformStyle: "preserve-3d",
            transform: `rotateY(${angle}deg)`,
            transition: dragging || spin ? "none" : "transform .9s cubic-bezier(.16,1,.3,1)",
          }}
        >
          <div className="absolute inset-0" style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}>
            <Face side="front" shape={shape} kind={kind} hex={hex} visual={visual} print={print} />
          </div>
          <div className="absolute inset-0" style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
            <Face side="back" shape={shape} kind={kind} hex={hex} visual={visual} print={print} />
          </div>
        </div>
      </div>

      <div className="absolute bottom-3 inset-x-0 flex justify-center">
        <div className="flex gap-1 p-1 rounded-full bg-black/60 backdrop-blur border border-white/10">
          <button type="button" onClick={() => goto("front")} aria-pressed={!showingBack && !spin} className={cn("px-3.5 py-1.5 rounded-full text-[11px] font-semibold transition-colors", !showingBack && !spin ? "bg-white text-black" : "text-white/75")}>Devant</button>
          <button type="button" onClick={() => goto("back")} aria-pressed={showingBack && !spin} className={cn("px-3.5 py-1.5 rounded-full text-[11px] font-semibold transition-colors", showingBack && !spin ? "bg-white text-black" : "text-white/75")}>Dos</button>
          <button type="button" onClick={() => setSpin((s) => !s)} aria-pressed={spin} className={cn("px-3.5 py-1.5 rounded-full text-[11px] font-semibold transition-colors", spin ? "g-brand text-white" : "text-white/75")}>360°</button>
        </div>
      </div>
    </div>
  );
}
