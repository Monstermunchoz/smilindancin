"use client";
import { useState } from "react";
export function RetryPayment({ orderId }: { orderId: string }) {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  async function retry() {
    setLoading(true); setErr("");
    const r = await fetch("/api/checkout/stripe", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ orderId }) });
    const d = await r.json();
    if (r.ok && d.url) window.location.href = d.url; else { setLoading(false); setErr(d.error ?? "Paiement indisponible"); }
  }
  return (
    <div className="mt-4">
      <button onClick={retry} disabled={loading} className="btn btn-brand">{loading ? "…" : "Réessayer le paiement"}</button>
      {err && <p className="text-xs text-pink mt-2">{err}</p>}
    </div>
  );
}
