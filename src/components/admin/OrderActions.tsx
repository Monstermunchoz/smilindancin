"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Order, OrderStatus } from "@/lib/commerce/types";
import { STATUS } from "./ui";
import { useToast } from "@/components/ui/Toaster";

export function OrderActions({ order }: { order: Order }) {
  const [status, setStatus] = useState<OrderStatus>(order.status);
  const [payment, setPayment] = useState(order.paymentStatus);
  const [note, setNote] = useState(order.note ?? "");
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const push = useToast((s) => s.push);
  async function save() {
    setSaving(true);
    const r = await fetch(`/api/admin/orders/${order.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status, paymentStatus: payment, note }) });
    setSaving(false);
    if (r.ok) { push("Commande mise à jour."); router.refresh(); } else push("Erreur.", "error");
  }
  const sel = "w-full bg-white/5 border border-white/15 rounded-[3px] px-3 py-2.5 text-sm outline-none focus:border-white";
  return (
    <div className="space-y-4">
      <div><label className="t-label text-white/55 block mb-1.5">Statut</label>
        <select value={status} onChange={(e) => setStatus(e.target.value as OrderStatus)} className={sel}>{(Object.keys(STATUS) as OrderStatus[]).map((s) => <option key={s} value={s} className="bg-black">{STATUS[s].label}</option>)}</select></div>
      <div><label className="t-label text-white/55 block mb-1.5">Paiement</label>
        <select value={payment} onChange={(e) => setPayment(e.target.value as Order["paymentStatus"])} className={sel}>{[["unpaid", "Non payé"], ["paid", "Payé"], ["refunded", "Remboursé"]].map(([v, l]) => <option key={v} value={v} className="bg-black">{l}</option>)}</select></div>
      <div><label className="t-label text-white/55 block mb-1.5">Note interne</label><textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} className={sel} /></div>
      <button onClick={save} disabled={saving} className="btn btn-primary w-full">{saving ? "…" : "Enregistrer"}</button>
      <div className="flex gap-2">
        <a href={`mailto:${order.customer.email}?subject=Votre commande ${order.id}, Smilin' Dancin'`} className="btn btn-ghost flex-1 !py-3">Écrire au client</a>
        <button onClick={() => window.print()} className="btn btn-ghost flex-1 !py-3">Imprimer</button>
      </div>
    </div>
  );
}
