"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import type { TierView } from "@/lib/tickets/types";
import { formatPrice, cn } from "@/lib/format";

const STATUS: Record<TierView["status"], { label: string; cls: string }> = {
  on_sale: { label: "En vente", cls: "bg-white text-black" },
  sold_out: { label: "Sold out", cls: "bg-pink text-white" },
  upcoming: { label: "Bientôt", cls: "bg-white/10 text-white/70" },
  ended: { label: "Terminé", cls: "bg-white/10 text-white/50" },
  closed: { label: "Fermé", cls: "bg-white/10 text-white/50" },
};

export function TicketPicker({ slug, tiers, demo }: { slug: string; tiers: TierView[]; demo?: boolean }) {
  const [qty, setQty] = useState<Record<string, number>>({});
  const router = useRouter();
  const total = useMemo(() => tiers.reduce((s, t) => s + (qty[t.id] ?? 0) * t.price, 0), [qty, tiers]);
  const count = Object.values(qty).reduce((a, b) => a + b, 0);
  const set = (t: TierView, d: number) => setQty((q) => ({ ...q, [t.id]: Math.max(0, Math.min(t.perOrderMax ?? 10, t.remaining, (q[t.id] ?? 0) + d)) }));

  function go() {
    const sel = Object.entries(qty).filter(([, n]) => n > 0).map(([id, n]) => `${id}:${n}`).join(",");
    router.push(`/billetterie/${slug}/commander?sel=${encodeURIComponent(sel)}`);
  }

  return (
    <div>
      {demo && <p className="m-center text-[12px] text-pink/90 mb-5 leading-snug">Billetterie de démonstration : tarifs et quotas modifiables dans l'admin.</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {tiers.map((t) => {
          const n = qty[t.id] ?? 0;
          const active = t.status === "on_sale";
          const st = STATUS[t.status];
          const few = active && t.remaining <= Math.max(20, t.quota * 0.2);
          return (
            <div key={t.id} className={cn("relative flex flex-col gap-4 p-5 border rounded-[4px] text-left lg:aspect-square lg:justify-between transition-colors", active ? (n > 0 ? "border-pink bg-pink/10" : "border-white/20 bg-white/[0.03]") : "border-white/10 bg-white/[0.015]")}>
              <div className="flex items-center justify-between gap-3">
                <span className={cn("t-label text-[10px] px-2.5 py-1 rounded-full whitespace-nowrap tracking-[0.08em]", st.cls)}>{st.label}</span>
                {t.badge && active ? <span className="t-label text-[10px] text-blue-sky text-right">{t.badge}</span> : few ? <span className="text-[11px] text-pink">Plus que {t.remaining}</span> : null}
              </div>
              <div className={cn(!active && "opacity-60")}>
                <p className="t-display text-[28px] leading-[0.92]">{t.name}</p>
                <p className="text-[13px] text-white/60 mt-2 leading-snug">{t.description}</p>
              </div>
              <div className={cn("space-y-3", !active && "opacity-60")}>
                <div className="h-[3px] bg-white/10 overflow-hidden rounded-full"><div className="h-full g-brand" style={{ width: `${Math.round(t.progress * 100)}%` }} /></div>
                <div className="flex items-center justify-between gap-3">
                  <p className="t-dot text-2xl tabular-nums whitespace-nowrap">{formatPrice(t.price)}</p>
                  {active ? (
                    <div className="flex items-center gap-3">
                      <button onClick={() => set(t, -1)} disabled={n === 0} aria-label={`Retirer un billet ${t.name}`} className="w-10 h-10 rounded-full border border-white/25 grid place-items-center text-lg disabled:opacity-30 active:scale-95">−</button>
                      <motion.span key={n} initial={{ scale: 0.7, opacity: 0.4 }} animate={{ scale: 1, opacity: 1 }} className="t-dot text-xl tabular-nums w-6 text-center">{n}</motion.span>
                      <button onClick={() => set(t, 1)} disabled={n >= Math.min(t.perOrderMax ?? 10, t.remaining)} aria-label={`Ajouter un billet ${t.name}`} className="w-10 h-10 rounded-full bg-white text-black grid place-items-center text-lg disabled:opacity-30 active:scale-95">+</button>
                    </div>
                  ) : (
                    <p className="text-[12px] text-white/55 text-right leading-snug max-w-[48%]">{t.status === "upcoming" ? "Ouvre après le tarif précédent" : t.status === "sold_out" ? "Complet" : "Indisponible"}</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <AnimatePresence>
        {count > 0 && (
          <motion.div initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }} transition={{ type: "spring", stiffness: 380, damping: 32 }} className="fixed bottom-0 inset-x-0 z-40 bg-black/90 backdrop-blur-xl border-t border-white/10 safe-bottom">
            <div className="container-x py-3 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs text-white/55">{count} billet{count > 1 ? "s" : ""}</p>
                <p className="t-dot text-xl tabular-nums">{formatPrice(total)}</p>
              </div>
              <button onClick={go} className="btn btn-brand !px-8">Réserver</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
