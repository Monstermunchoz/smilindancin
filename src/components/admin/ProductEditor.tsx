"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Product } from "@/lib/commerce/types";
import { useToast } from "@/components/ui/Toaster";
import { formatPrice } from "@/lib/format";

export function ProductEditor({ product }: { product: Product }) {
  const [f, setF] = useState({ title: product.title, subtitle: product.subtitle ?? "", description: product.description, status: product.status, featured: Boolean(product.featured), price: product.price.amount / 100 });
  const [saving, setSaving] = useState(false);
  const [stocks, setStocks] = useState<Record<string, string>>({});
  const router = useRouter();
  const push = useToast((s) => s.push);
  const inp = "w-full bg-white/5 border border-white/15 rounded-[3px] px-3 py-2.5 text-sm outline-none focus:border-white";

  async function save() {
    setSaving(true);
    const r = await fetch(`/api/admin/products/${product.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...f, price: { amount: Math.round(f.price * 100), currency: "EUR" } }) });
    setSaving(false);
    if (r.ok) { push("Produit enregistré."); router.refresh(); } else push("Erreur.", "error");
  }
  async function saveStock(variantId: string) {
    const v = stocks[variantId];
    if (v === undefined) return;
    const r = await fetch(`/api/admin/products/${product.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ variantId, stock: v === "" ? 0 : Number(v) }) });
    if (r.ok) { push("Stock mis à jour."); router.refresh(); } else push("Erreur.", "error");
  }

  return (
    <div className="grid lg:grid-cols-[1fr_1.2fr] gap-6">
      <div className="space-y-4 border border-white/10 rounded-[4px] p-5">
        <div><label className="t-label text-white/55 block mb-1.5">Titre</label><input className={inp} value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} /></div>
        <div><label className="t-label text-white/55 block mb-1.5">Sous-titre</label><input className={inp} value={f.subtitle} onChange={(e) => setF({ ...f, subtitle: e.target.value })} /></div>
        <div><label className="t-label text-white/55 block mb-1.5">Description</label><textarea rows={5} className={inp} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="t-label text-white/55 block mb-1.5">Statut</label>
            <select className={inp} value={f.status} onChange={(e) => setF({ ...f, status: e.target.value as Product["status"] })}>{[["active", "Actif"], ["coming_soon", "À venir"], ["draft", "Brouillon"], ["archived", "Archivé"]].map(([v, l]) => <option key={v} value={v} className="bg-black">{l}</option>)}</select></div>
          <div><label className="t-label text-white/55 block mb-1.5">Prix de départ (€)</label><input type="number" step="0.5" className={inp} value={f.price} onChange={(e) => setF({ ...f, price: Number(e.target.value) })} /></div>
        </div>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={f.featured} onChange={(e) => setF({ ...f, featured: e.target.checked })} className="accent-pink" /> Mis en avant sur l'accueil</label>
        <button onClick={save} disabled={saving} className="btn btn-primary w-full">{saving ? "…" : "Enregistrer"}</button>
        <p className="text-[11px] text-white/40">Provenance : {product.provenance}</p>
      </div>
      <div className="border border-white/10 rounded-[4px] p-5">
        <p className="t-label text-white/55 mb-3">Stock par variante ({product.variants.length})</p>
        <p className="text-xs text-white/45 mb-4">Vide = à la demande (pas de limite). Saisissez un nombre pour activer la gestion de stock.</p>
        <div className="max-h-[60vh] overflow-y-auto divide-y divide-white/10">
          {product.variants.map((v) => (
            <div key={v.id} className="py-2 flex items-center gap-3 text-sm">
              <span className="flex-1 min-w-0 truncate">{v.title}</span>
              <span className="tabular-nums text-white/50 w-16 text-right">{formatPrice(v.price)}</span>
              <input type="number" min={0} placeholder="∞" defaultValue={v.stock ?? ""} onChange={(e) => setStocks({ ...stocks, [v.id]: e.target.value })} onBlur={() => saveStock(v.id)} className="w-20 bg-white/5 border border-white/15 rounded-[3px] px-2 py-1.5 text-sm outline-none focus:border-white text-right" />
            </div>
          ))}
          {product.variants.length === 0 && <p className="text-sm text-white/45 py-6">Aucune variante : produit « à venir » (prix et tailles à confirmer par la marque).</p>}
        </div>
      </div>
    </div>
  );
}
