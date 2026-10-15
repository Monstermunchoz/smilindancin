"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { TierView } from "@/lib/tickets/types";
import { useToast } from "@/components/ui/Toaster";
import { formatPrice } from "@/lib/format";

export function TierEditor({ eventSlug, tier }: { eventSlug: string; tier: TierView }) {
  const [price, setPrice] = useState(String(tier.price / 100));
  const [quota, setQuota] = useState(String(tier.quota));
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const push = useToast((s) => s.push);
  async function save(extra: Record<string, unknown> = {}) {
    setSaving(true);
    const r = await fetch("/api/admin/tiers", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ eventSlug, tierId: tier.id, price: Math.round(Number(price) * 100), quota: Number(quota), ...extra }) });
    setSaving(false);
    if (r.ok) { push("Tarif mis à jour."); router.refresh(); } else push("Erreur.", "error");
  }
  const inp = "w-24 bg-white/5 border border-white/15 rounded-[3px] px-2 py-1.5 text-sm outline-none focus:border-white text-right";
  return (
    <tr className="align-middle">
      <td className="px-4 py-3"><p className="font-semibold">{tier.name}</p><p className="text-xs text-white/45">{tier.status === "on_sale" ? "En vente" : tier.status === "sold_out" ? "Sold out" : tier.status === "upcoming" ? "En attente" : "Fermé"}</p></td>
      <td className="px-4 py-3"><input aria-label="Prix (€)" type="number" step="0.5" className={inp} value={price} onChange={(e) => setPrice(e.target.value)} /> €</td>
      <td className="px-4 py-3"><input aria-label="Quota" type="number" className={inp} value={quota} onChange={(e) => setQuota(e.target.value)} /></td>
      <td className="px-4 py-3 w-48">
        <div className="flex justify-between text-xs mb-1"><span className="tabular-nums">{tier.sold} / {tier.quota}</span><span className="text-white/50">{Math.round(tier.progress * 100)}%</span></div>
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden"><div className="h-full g-brand" style={{ width: `${tier.progress * 100}%` }} /></div>
      </td>
      <td className="px-4 py-3 tabular-nums">{formatPrice(tier.sold * tier.price)}</td>
      <td className="px-4 py-3 whitespace-nowrap">
        <button disabled={saving} onClick={() => save()} className="text-xs u-line mr-3">Enregistrer</button>
        <button disabled={saving} onClick={() => save({ closed: tier.status !== "closed" })} className="text-xs u-line text-white/60">{tier.status === "closed" ? "Rouvrir" : "Fermer"}</button>
      </td>
    </tr>
  );
}
