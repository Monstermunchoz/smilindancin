"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Product } from "@/lib/commerce/types";
import { useToast } from "@/components/ui/Toaster";
import { formatPrice } from "@/lib/format";

export function StockEditor({ product }: { product: Product }) {
  const [q, setQ] = useState("");
  const router = useRouter();
  const push = useToast((s) => s.push);
  async function save(variantId: string, value: string) {
    const r = await fetch(`/api/admin/products/${product.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ variantId, stock: value === "" ? 0 : Number(value) }) });
    if (r.ok) { push("Stock mis à jour."); router.refresh(); } else push("Erreur.", "error");
  }
  const list = product.variants.filter((v) => v.title.toLowerCase().includes(q.toLowerCase()));
  return (
    <section className="border border-white/10 rounded-[16px] p-5 bg-white/[0.02] mt-5">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <p className="t-label text-white/55">Stock par variante ({product.variants.length})</p>
        {product.variants.length > 12 && <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filtrer (ex. Noir / M)" className="bg-white/[.04] border border-white/15 rounded-full px-4 h-10 text-sm outline-none focus:border-white/60 w-full sm:w-64" />}
      </div>
      <p className="text-xs text-white/45 mb-4">Vide = à la demande (pas de limite). Un nombre active la gestion de stock ; 0 = épuisé.</p>
      <div className="max-h-[60vh] overflow-y-auto divide-y divide-white/10">
        {list.map((v) => (
          <div key={v.id} className="py-2.5 flex items-center gap-3 text-sm">
            <span className="flex-1 min-w-0 truncate">{v.title}</span>
            <span className="tabular-nums text-white/50 w-16 text-right shrink-0">{formatPrice(v.price)}</span>
            <input type="number" min={0} placeholder="∞" defaultValue={v.stock ?? ""} onBlur={(e) => { if (e.target.value !== String(v.stock ?? "")) save(v.id, e.target.value); }} className="w-20 shrink-0 bg-white/[.04] border border-white/15 rounded-[8px] px-2 py-2 text-sm outline-none focus:border-white text-right" />
          </div>
        ))}
        {product.variants.length === 0 && <p className="text-sm text-white/45 py-6">Aucune variante : produit « bientôt » (non achetable).</p>}
      </div>
    </section>
  );
}
