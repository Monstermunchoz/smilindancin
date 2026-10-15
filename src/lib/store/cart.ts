"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartLine } from "@/lib/commerce/types";

type CartState = {
  lines: CartLine[];
  open: boolean;
  lastAdded: string | null;
  add: (line: Omit<CartLine, "quantity"> & { quantity?: number }) => { ok: boolean; reason?: string };
  remove: (variantId: string) => void;
  setQty: (variantId: string, qty: number) => void;
  clear: () => void;
  setOpen: (open: boolean) => void;
};

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      open: false,
      lastAdded: null,
      add: (line) => {
        const qty = line.quantity ?? 1;
        const lines = [...get().lines];
        const i = lines.findIndex((l) => l.variantId === line.variantId);
        if (i >= 0) {
          const next = lines[i].quantity + qty;
          if (lines[i].maxQuantity !== null && next > lines[i].maxQuantity) {
            return { ok: false, reason: `Stock limité à ${lines[i].maxQuantity} pour cette taille.` };
          }
          lines[i] = { ...lines[i], quantity: Math.min(10, next) };
        } else {
          if (line.maxQuantity !== null && line.maxQuantity < qty) return { ok: false, reason: "Cette variante n'est plus disponible." };
          lines.unshift({ ...line, quantity: qty });
        }
        set({ lines, open: true, lastAdded: line.variantId });
        return { ok: true };
      },
      remove: (variantId) => set({ lines: get().lines.filter((l) => l.variantId !== variantId) }),
      setQty: (variantId, qty) =>
        set({
          lines: get()
            .lines.map((l) => (l.variantId === variantId ? { ...l, quantity: Math.max(0, Math.min(10, l.maxQuantity !== null ? Math.min(l.maxQuantity, qty) : qty)) } : l))
            .filter((l) => l.quantity > 0),
        }),
      clear: () => set({ lines: [] }),
      setOpen: (open) => set({ open }),
    }),
    { name: "sd-cart-v1", partialize: (s) => ({ lines: s.lines }) },
  ),
);

export const cartCount = (lines: CartLine[]) => lines.reduce((n, l) => n + l.quantity, 0);
export const cartSubtotal = (lines: CartLine[]) => lines.reduce((n, l) => n + l.unitPrice.amount * l.quantity, 0);
