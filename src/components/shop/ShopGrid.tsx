"use client";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { Product } from "@/lib/commerce/types";
import { ProductCard } from "./ProductCard";
import { cn } from "@/lib/format";

const CATS = [
  { id: "all", label: "Tout" },
  { id: "tee", label: "T-shirts" },
  { id: "hoodie", label: "Sweats" },
  { id: "accessory", label: "Accessoires" },
  { id: "new", label: "Nouveautés 2026" },
];
const SORTS = [
  { id: "featured", label: "Sélection" },
  { id: "price-asc", label: "Prix croissant" },
  { id: "price-desc", label: "Prix décroissant" },
  { id: "new", label: "Nouveautés" },
];

export function ShopGrid({ products, title = "Shop", intro }: { products: Product[]; title?: string; intro?: string }) {
  const [cat, setCat] = useState("all");
  const [color, setColor] = useState<string | null>(null);
  const [sort, setSort] = useState("featured");

  const colors = useMemo(() => Array.from(new Set(products.flatMap((p) => p.colors.map((c) => c.name)))), [products]);

  const list = useMemo(() => {
    let l = products.filter((p) => (cat === "all" ? true : cat === "new" ? p.collection === "drops-2026" : p.category === cat));
    if (color) l = l.filter((p) => p.colors.some((c) => c.name === color));
    const min = (p: Product) => (p.variants.length ? Math.min(...p.variants.map((v) => v.price.amount)) : p.price.amount);
    if (sort === "price-asc") l = [...l].sort((a, b) => min(a) - min(b));
    if (sort === "price-desc") l = [...l].sort((a, b) => min(b) - min(a));
    if (sort === "new") l = [...l].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    if (sort === "featured") l = [...l].sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)));
    return l;
  }, [products, cat, color, sort]);

  return (
    <div className="container-x pt-28 md:pt-36">
      <div className="m-center flex flex-wrap items-end justify-between gap-6 mb-8">
        <div>
          <h1 className="t-display text-[clamp(34px,9vw,128px)] leading-[0.85]">{title}</h1>
          {intro && <p className="mt-4 max-w-xl text-white/65">{intro}</p>}
        </div>
        <p className="t-label text-white/50">{list.length} pièce{list.length > 1 ? "s" : ""}</p>
      </div>

      <div className="sticky top-16 md:top-[72px] z-30 -mx-[var(--gutter)] bg-black/85 backdrop-blur-xl border-y border-white/8">
        <div className="px-[var(--gutter)] py-3 flex flex-col md:flex-row md:items-center gap-3 md:gap-6">
          <div className="flex gap-1.5 overflow-x-auto hide-scroll -mx-[var(--gutter)] px-[var(--gutter)] md:mx-0 md:px-0">
            {CATS.map((c) => (
              <button key={c.id} onClick={() => setCat(c.id)} className={cn("shrink-0 px-4 h-9 rounded-full text-[13px] font-semibold whitespace-nowrap transition-colors border", cat === c.id ? "bg-white text-black border-white" : "text-white/75 border-white/12 hover:text-white")}>
                {c.label}
              </button>
            ))}
          </div>
          <div className="flex items-center justify-between gap-4 md:ml-auto">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="t-label text-white/40 hidden lg:inline mr-1">Couleur</span>
              {colors.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(color === c ? null : c)}
                  aria-pressed={color === c}
                  aria-label={c}
                  title={c}
                  className={cn("w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 transition-transform shrink-0", color === c ? "border-pink scale-110" : "border-white/20")}
                  style={{ background: products.flatMap((p) => p.colors).find((x) => x.name === c)?.hex }}
                />
              ))}
            </div>
            <label className="relative shrink-0">
              <span className="sr-only">Trier</span>
              <select id="sort" value={sort} onChange={(e) => setSort(e.target.value)} className="appearance-none bg-white/[.04] text-[14px] font-semibold text-white/85 border border-white/15 rounded-full h-9 pl-3.5 pr-8 outline-none focus:border-white/50">
                {SORTS.map((s) => (
                  <option key={s.id} value={s.id} className="bg-black">{s.label}</option>
                ))}
              </select>
              <svg viewBox="0 0 24 24" className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="m6 9 6 6 6-6" /></svg>
            </label>
          </div>
        </div>
      </div>

      <motion.div layout className="grid grid-cols-2 lg:grid-cols-4 gap-x-3 gap-y-9 md:gap-x-5 mt-6 md:mt-8 min-h-[50vh] items-start">
        <AnimatePresence mode="popLayout">
          {list.map((p, i) => (
            <motion.div key={p.id} layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.4, delay: Math.min(i, 8) * 0.03 }}>
              <ProductCard product={p} priority={i < 4} />
            </motion.div>
          ))}
        </AnimatePresence>
        {list.length === 0 && (
          <div className="col-span-full py-24 text-center">
            <p className="t-condensed text-3xl text-white/70">Aucune pièce avec ces filtres</p>
            <button onClick={() => { setCat("all"); setColor(null); }} className="btn btn-ghost mt-5">Réinitialiser</button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
