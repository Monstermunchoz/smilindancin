"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useCart, cartSubtotal } from "@/lib/store/cart";
import { formatPrice } from "@/lib/format";

export function CartDrawer() {
  const { lines, open, setOpen, setQty, remove } = useCart();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setOpen]);
  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [open]);
  const subtotal = cartSubtotal(lines);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            aria-label="Fermer le panier"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.aside
            role="dialog"
            aria-label="Panier"
            className="fixed top-0 right-0 z-[61] h-dvh w-full max-w-[460px] bg-ink border-l border-white/10 flex flex-col"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
          >
            <div className="flex items-center justify-between px-6 h-16 border-b border-white/10">
              <h2 className="t-display text-2xl">Panier <span className="text-white/40 not-italic font-normal text-base">({lines.reduce((n, l) => n + l.quantity, 0)})</span></h2>
              <button onClick={() => setOpen(false)} className="p-2 text-white/70 hover:text-white" aria-label="Fermer">
                <svg width="22" height="22" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="1.8" strokeLinecap="round"><path d="M6 6l12 12M18 6 6 18" /></svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              {lines.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center gap-5">
                  <p className="t-condensed text-4xl text-white/80">Votre panier est vide</p>
                  <p className="text-sm text-white/50 max-w-xs">9 visuels, 6 coupes, Made in France. Il y a forcément une pièce pour vous.</p>
                  <Link href="/shop" onClick={() => setOpen(false)} className="btn btn-primary">Voir le shop</Link>
                </div>
              ) : (
                <ul className="divide-y divide-white/10">
                  <AnimatePresence initial={false}>
                    {lines.map((l) => (
                      <motion.li key={l.variantId} layout initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: 30 }} className="py-4 flex gap-4">
                        <Link href={`/shop/${l.productHandle}`} onClick={() => setOpen(false)} className="relative w-20 aspect-[4/5] shrink-0 overflow-hidden rounded-[2px] bg-ink-2">
                          <Image src={l.image} alt="" fill sizes="80px" className="object-cover" />
                        </Link>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between gap-3">
                            <p className="font-semibold leading-tight">{l.productTitle}</p>
                            <p className="font-semibold tabular-nums">{formatPrice(l.unitPrice.amount * l.quantity)}</p>
                          </div>
                          <p className="text-xs text-white/50 mt-1">{l.variantTitle}</p>
                          <div className="mt-3 flex items-center justify-between">
                            <div className="inline-flex items-center border border-white/15 rounded-full">
                              <button aria-label="Diminuer" onClick={() => setQty(l.variantId, l.quantity - 1)} className="w-8 h-8 grid place-items-center hover:text-pink">−</button>
                              <span className="w-6 text-center text-sm tabular-nums">{l.quantity}</span>
                              <button aria-label="Augmenter" onClick={() => setQty(l.variantId, l.quantity + 1)} className="w-8 h-8 grid place-items-center hover:text-pink" disabled={l.maxQuantity !== null && l.quantity >= l.maxQuantity}>+</button>
                            </div>
                            <button onClick={() => remove(l.variantId)} className="text-xs text-white/50 hover:text-pink u-line">Retirer</button>
                          </div>
                        </div>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              )}
            </div>

            {lines.length > 0 && (
              <div className="border-t border-white/10 px-6 py-5 space-y-4 safe-bottom">
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Sous-total</span>
                  <span className="font-semibold tabular-nums">{formatPrice(subtotal)}</span>
                </div>
                <p className="text-xs text-white/40">Livraison calculée à l'étape suivante. Retrait gratuit au stand Merch du prochain événement.</p>
                <Link href="/checkout" onClick={() => setOpen(false)} className="btn btn-brand w-full">Commander</Link>
                <button onClick={() => setOpen(false)} className="w-full text-center text-xs text-white/60 hover:text-white u-line">Continuer mes achats</button>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
