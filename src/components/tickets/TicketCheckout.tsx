"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { TierView } from "@/lib/tickets/types";
import { formatPrice } from "@/lib/format";
import { useToast } from "@/components/ui/Toaster";

export function TicketCheckout({ slug, eventTitle, lines, user }: { slug: string; eventTitle: string; lines: { tier: TierView; quantity: number }[]; user: { email: string; firstName: string; lastName: string } | null }) {
  const count = lines.reduce((n, l) => n + l.quantity, 0);
  const [f, setF] = useState({ email: user?.email ?? "", firstName: user?.firstName ?? "", lastName: user?.lastName ?? "" });
  const [holders, setHolders] = useState<string[]>(Array.from({ length: count }, () => ""));
  const [cgv, setCgv] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const push = useToast((s) => s.push);
  const total = lines.reduce((s, l) => s + l.tier.price * l.quantity, 0);
  const inp = "w-full bg-white/5 border border-white/15 rounded-[3px] px-4 py-3 outline-none focus:border-white";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!cgv) return push("Acceptez les conditions de vente.", "error");
    setLoading(true);
    const r = await fetch("/api/tickets/order", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ eventSlug: slug, ...f, items: lines.map((l) => ({ tierId: l.tier.id, quantity: l.quantity })), holders }) });
    const d = await r.json();
    setLoading(false);
    if (!r.ok) return push(d.error ?? "Erreur", "error");
    router.push(`/paiement/billets/${d.order.id}?k=${d.order.accessKey}`);
  }

  let k = 0;
  return (
    <form onSubmit={submit} className="grid lg:grid-cols-[1fr_400px] gap-8 lg:gap-14 items-start">
      <div className="space-y-8">
        <section>
          <h2 className="t-display text-2xl mb-4">Tes coordonnées</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2"><label htmlFor="t-email" className="t-label text-white/55 block mb-1.5">Email (billets envoyés ici)</label><input id="t-email" type="email" required autoComplete="email" className={inp} value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></div>
            <div><label htmlFor="t-fn" className="t-label text-white/55 block mb-1.5">Prénom</label><input id="t-fn" required autoComplete="given-name" className={inp} value={f.firstName} onChange={(e) => setF({ ...f, firstName: e.target.value })} /></div>
            <div><label htmlFor="t-ln" className="t-label text-white/55 block mb-1.5">Nom</label><input id="t-ln" required autoComplete="family-name" className={inp} value={f.lastName} onChange={(e) => setF({ ...f, lastName: e.target.value })} /></div>
          </div>
        </section>
        {count > 1 && (
          <section>
            <h2 className="t-display text-2xl mb-1">Noms sur les billets</h2>
            <p className="text-sm text-white/55 mb-4">Optionnel, sinon tous les billets sont à ton nom.</p>
            <div className="space-y-3">
              {lines.flatMap((l) => Array.from({ length: l.quantity }, () => { const i = k++; return (
                <div key={i} className="flex items-center gap-3">
                  <span className="t-label text-white/45 w-24 shrink-0">{l.tier.name} {i + 1}</span>
                  <input aria-label={`Nom du billet ${i + 1}`} className={inp} placeholder="Prénom Nom" value={holders[i]} onChange={(e) => setHolders((h) => h.map((x, j) => (j === i ? e.target.value : x)))} />
                </div>
              ); }))}
            </div>
          </section>
        )}
        <label className="flex gap-3 items-start text-sm text-white/70"><input type="checkbox" checked={cgv} onChange={(e) => setCgv(e.target.checked)} className="mt-1 accent-pink" /> <span>J'accepte les conditions de vente. Billets nominatifs, non remboursables sauf annulation de l'événement.</span></label>
      </div>
      <aside className="lg:sticky lg:top-24 border border-white/10 rounded-[3px] p-5 bg-ink space-y-4">
        <p className="t-label text-white/50">Récapitulatif</p>
        <p className="t-display text-2xl">{eventTitle}</p>
        <ul className="divide-y divide-white/10 text-sm">
          {lines.map((l) => <li key={l.tier.id} className="py-2.5 flex justify-between"><span>{l.tier.name} × {l.quantity}</span><span className="tabular-nums">{formatPrice(l.tier.price * l.quantity)}</span></li>)}
        </ul>
        <div className="flex justify-between font-semibold text-lg border-t border-white/10 pt-3"><span>Total</span><span className="tabular-nums">{formatPrice(total)}</span></div>
        <button disabled={loading} className="btn btn-brand w-full !py-4">{loading ? "Réservation…" : `Payer ${formatPrice(total)}`}</button>
        <p className="text-[11px] text-white/40">Tes places sont réservées pendant le paiement.</p>
      </aside>
    </form>
  );
}
