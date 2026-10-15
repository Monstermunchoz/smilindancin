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
      {demo && <p className="m-center t-label text-pink mb-4">Billetterie de démonstration — tarifs et quotas modifiables dans l'admin</p>}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
        {tiers.map((t) => {
          const n = qty[t.id] ?? 0;
          const active = t.status === "on_sale";
          const st = STATUS[t.status];
          return (
            <div key={t.id} className={cn("relative aspect-square flex flex-col justify-between p-3 sm:p-5 border transition-colors rounded-[2px]", active ? (n > 0 ? "border-pink bg-pink/10" : "border-white/20 bg-white/[0.03]") : "border-white/8 bg-white/[0.015] opacity-60")}>
              <div className="flex items-start justify-between gap-2">
                <span className={cn("t-label text-[9px] sm:text-[10px] px-2 py-1 rounded-full whitespace-nowrap tracking-[0.06em]", st.cls)}>{st.label}</span>
                {t.badge && active && <span className="hidden sm:inline t-label text-[10px] text-blue-sky text-right">{t.badge}</span>}
              </div>
              <div>
                <p className="t-display text-[22px] sm:text-3xl leading-[0.9]">{t.name}</p>
                <p className="text-[11px] sm:text-xs text-white/55 mt-1.5 line-clamp-2 hidden sm:block">{t.description}</p>
              </div>
              <div>
                <div className="flex items-end justify-between gap-2">
                  <p className="t-dot text-xl sm:text-2xl tabular-nums">{formatPrice(t.price)}</p>
                  {active && t.remaining <= Math.max(20, t.quota * 0.2) && <p className="text-[10px] sm:text-[11px] text-pink">Plus que {t.remaining}</p>}
                </div>
                <div className="h-[3px] bg-white/10 mt-2 overflow-hidden rounded-full"><div className="h-full g-brand" style={{ width: `${Math.round(t.progress * 100)}%` }} /></div>
                {active ? (
                  <div className="mt-3 flex items-center justify-between">
                    <button onClick={() => set(t, -1)} disabled={n === 0} aria-label={`Retirer un billet ${t.name}`} className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-white/20 grid place-items-center text-lg disabled:opacity-30 active:scale-95">−</button>
                    <motion.span key={n} initial={{ scale: 0.7, opacity: 0.4 }} animate={{ scale: 1, opacity: 1 }} className="t-dot text-xl tabular-nums">{n}</motion.span>
                    <button onClick={() => set(t, 1)} disabled={n >= Math.min(t.perOrderMax ?? 10, t.remaining)} aria-label={`Ajouter un billet ${t.name}`} className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white text-black grid place-items-center text-lg disabled:opacity-30 active:scale-95">+</button>
                  </div>
                ) : (
                  <p className="mt-3 text-[11px] text-white/45 h-9 sm:h-10 flex items-center">{t.status === "upcoming" ? "Ouvre après le tarif précédent" : t.status === "sold_out" ? "Toutes les places sont parties" : "Indisponible"}</p>
                )}
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
