"use client";
import { create } from "zustand";
import { AnimatePresence, motion } from "motion/react";

type Toast = { id: number; message: string; kind?: "ok" | "error" };
type ToastState = { toasts: Toast[]; push: (message: string, kind?: Toast["kind"]) => void; remove: (id: number) => void };
export const useToast = create<ToastState>((set, get) => ({
  toasts: [],
  push: (message, kind = "ok") => {
    const id = Date.now() + Math.random();
    set({ toasts: [...get().toasts, { id, message, kind }] });
    setTimeout(() => get().remove(id), 3200);
  },
  remove: (id) => set({ toasts: get().toasts.filter((t) => t.id !== id) }),
}));

export function Toaster() {
  const toasts = useToast((s) => s.toasts);
  return (
    <div className="fixed bottom-4 inset-x-0 z-[70] flex flex-col items-center gap-2 pointer-events-none px-4 safe-bottom" aria-live="polite">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ y: 20, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 10, opacity: 0, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 420, damping: 30 }}
            className={`pointer-events-auto rounded-full px-5 py-3 text-sm font-medium shadow-2xl backdrop-blur-xl ${t.kind === "error" ? "bg-pink text-white" : "bg-white text-black"}`}
          >
            {t.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
