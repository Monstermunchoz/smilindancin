"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/lib/commerce/types";
import { cn, formatPrice } from "@/lib/format";

const ST: Record<Product["status"], { l: string; c: string }> = {
  active: { l: "En vente", c: "bg-emerald-400/15 text-emerald-300" },
  coming_soon: { l: "Bientôt", c: "bg-blue-sky/15 text-blue-sky" },
  draft: { l: "Brouillon", c: "bg-white/10 text-white/60" },
  archived: { l: "Archivé", c: "bg-white/5 text-white/40" },
};
const CAT: Record<string, string> = { tee: "T-shirts", hoodie: "Sweats", cap: "Casquettes", tote: "Totes", accessory: "Accessoires" };

export function ProductList({ products, sold }: { products: Product[]; sold: Record<string, number> }) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [st, setSt] = useState("all");
  const list = useMemo(() => products.filter((p) => (cat === "all" || p.category === cat) && (st === "all" || p.status === st) && [p.title, p.subtitle, ...p.tags].join(" ").toLowerCase().includes(q.toLowerCase())), [products, q, cat, st]);
  const min = (p: Product) => (p.variants.length ? Math.min(...p.variants.map((v) => v.price.amount)) : p.price.amount);
  const chip = (on: boolean) => cn("shrink-0 h-9 px-3.5 rounded-full text-[13px] font-semibold border transition-colors", on ? "bg-white text-black border-white" : "border-white/15 text-white/70");
  return (
    <div>
      <div className="flex flex-col gap-3 mb-5">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher un produit…" className="w-full bg-white/[.04] border border-white/15 rounded-full px-5 h-12 text-[15px] outline-none focus:border-white/60" />
        <div className="flex gap-2 overflow-x-auto hide-scroll">
          <button onClick={() => setCat("all")} className={chip(cat === "all")}>Tout ({products.length})</button>
          {Object.entries(CAT).filter(([k]) => products.some((p) => p.category === k)).map(([k, l]) => <button key={k} onClick={() => setCat(k)} className={chip(cat === k)}>{l}</button>)}
          <span className="w-px bg-white/10 mx-1 shrink-0" />
          {(["active", "coming_soon", "draft", "archived"] as const).filter((s) => products.some((p) => p.status === s)).map((s) => <button key={s} onClick={() => setSt(st === s ? "all" : s)} className={chip(st === s)}>{ST[s].l}</button>)}
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
        <Link href="/admin/products/new" className="rounded-[16px] border-2 border-dashed border-white/20 hover:border-white/50 grid place-items-center text-center p-6 min-h-[220px] transition-colors">
          <span>
            <span className="mx-auto w-12 h-12 rounded-full g-brand grid place-items-center text-2xl">+</span>
            <span className="block font-semibold mt-3">Ajouter un produit</span>
            <span className="block text-xs text-white/50 mt-1">Photos, fiche, prix</span>
          </span>
        </Link>
        {list.map((p) => (
          <Link key={p.id} href={`/admin/products/${p.id}`} className="group rounded-[16px] border border-white/10 bg-white/[0.02] hover:border-white/30 overflow-hidden transition-colors">
            <div className="relative aspect-[4/5] bg-ink-2">
              {p.images[0] ? <Image src={p.images[0].src} alt="" fill sizes="(max-width:768px) 50vw, 25vw" className="object-cover" /> : <span className="absolute inset-0 grid place-items-center text-xs text-white/40">Pas de photo</span>}
              <span className={cn("absolute top-2.5 left-2.5 rounded-full px-2.5 py-1 text-[11px] font-semibold backdrop-blur", ST[p.status].c)}>{ST[p.status].l}</span>
              {p.preorder && <span className="absolute top-2.5 right-2.5 rounded-full px-2.5 py-1 text-[11px] font-semibold bg-pink text-white">Précommande</span>}
            </div>
            <div className="p-3.5">
              <p className="font-semibold truncate">{p.title}</p>
              <p className="text-xs text-white/50 truncate mt-0.5">{CAT[p.category] ?? p.category} · {p.variants.length} variante{p.variants.length > 1 ? "s" : ""}</p>
              <div className="flex items-center justify-between mt-2 text-sm">
                <span className="tabular-nums font-semibold">{p.variants.length || p.status === "active" ? `${p.category === "tee" && !p.custom ? "dès " : ""}${formatPrice(min(p))}` : <span className="text-white/45 font-normal text-xs">Tarif à venir</span>}</span>
                <span className="text-xs text-white/50 tabular-nums">{sold[p.handle] ?? 0} vendu{(sold[p.handle] ?? 0) > 1 ? "s" : ""}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
      {list.length === 0 && <p className="text-sm text-white/45 text-center py-10">Aucun produit ne correspond.</p>}
    </div>
  );
}
