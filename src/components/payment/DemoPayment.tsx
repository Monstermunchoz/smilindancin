"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { formatPrice } from "@/lib/format";
import { useToast } from "@/components/ui/Toaster";

/**
 * Paiement SIMULÉ. Aucune saisie bancaire : la carte affichée est la carte de test publique Stripe,
 * en lecture seule. Rien n'est transmis à un prestataire de paiement.
 */
export function DemoPayment({ kind, id, accessKey, amount, label }: { kind: "billets" | "commande"; id: string; accessKey?: string; amount: number; label: string }) {
  const [state, setState] = useState<"idle" | "processing" | "done">("idle");
  const router = useRouter();
  const push = useToast((s) => s.push);
  async function pay() {
    setState("processing");
    await new Promise((r) => setTimeout(r, 1400));
    const r = await fetch("/api/pay/demo", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kind, id, key: accessKey }) });
    const d = await r.json();
    if (!r.ok) {
      setState("idle");
      push(d.error ?? "Paiement impossible", "error");
      return;
    }
    setState("done");
    setTimeout(() => router.push(d.redirect), 900);
  }
  return (
    <div className="max-w-md mx-auto">
      <div className="border border-pink/40 bg-pink/10 rounded-[3px] px-4 py-3 text-xs text-white/80 mb-6 text-center">Mode démonstration, aucun paiement réel, aucune donnée bancaire demandée.</div>
      <div className="relative aspect-[1.586] rounded-[14px] p-6 overflow-hidden g-brand grain shadow-[0_30px_80px_-30px_rgba(169,66,107,.8)]">
        <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full border border-white/20" />
        <div className="absolute -right-4 -top-4 w-56 h-56 rounded-full border border-white/10" />
        <div className="relative h-full flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="t-label text-white/80">Carte de test</span>
            <span className="w-10 h-7 rounded-md bg-white/30" />
          </div>
          <p className="t-dot text-xl sm:text-2xl tracking-[0.12em]">4242 4242 4242 4242</p>
          <div className="flex justify-between text-xs text-white/80">
            <span>SMILER DANCER</span>
            <span className="t-dot">12/34 · 123</span>
          </div>
        </div>
      </div>
      <div className="mt-6 flex justify-between items-baseline">
        <span className="text-white/60 text-sm">{label}</span>
        <span className="t-dot text-2xl tabular-nums">{formatPrice(amount)}</span>
      </div>
      <button onClick={pay} disabled={state !== "idle"} className="btn btn-brand w-full !py-4 mt-5 text-[13px] relative overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          {state === "idle" && (
            <motion.span key="i" initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -10, opacity: 0 }}>
              Payer {formatPrice(amount)}
            </motion.span>
          )}
          {state === "processing" && (
            <motion.span key="p" className="flex items-center gap-2" initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -10, opacity: 0 }}>
              <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
              Paiement en cours…
            </motion.span>
          )}
          {state === "done" && (
            <motion.span key="d" initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
              Paiement accepté ✓
            </motion.span>
          )}
        </AnimatePresence>
      </button>
      <p className="text-[11px] text-white/40 text-center mt-4">Le paiement réel (Stripe : CB, Apple Pay, Google Pay) s'active en ajoutant les clés dans Vercel.</p>
    </div>
  );
}
