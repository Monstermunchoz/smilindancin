import Link from "next/link";
import type { OrderStatus } from "@/lib/commerce/types";
import { cn } from "@/lib/format";

export const STATUS: Record<OrderStatus, { label: string; cls: string }> = {
  pending_payment: { label: "Attente paiement", cls: "bg-yellow-400/15 text-yellow-300" },
  paid: { label: "Payée", cls: "bg-emerald-400/15 text-emerald-300" },
  preparing: { label: "En préparation", cls: "bg-blue-sky/15 text-blue-sky" },
  shipped: { label: "Expédiée", cls: "bg-periwinkle/20 text-periwinkle" },
  delivered: { label: "Livrée", cls: "bg-white/10 text-white/80" },
  cancelled: { label: "Annulée", cls: "bg-white/5 text-white/40" },
  refunded: { label: "Remboursée", cls: "bg-pink/15 text-pink" },
};

export function StatusBadge({ s }: { s: OrderStatus }) {
  const st = STATUS[s];
  return <span className={cn("inline-block rounded-full px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap", st.cls)}>{st.label}</span>;
}

export function PageTitle({ title, sub, action }: { title: string; sub?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
      <div><h1 className="t-display text-3xl md:text-4xl">{title}</h1>{sub && <p className="text-sm text-white/50 mt-1">{sub}</p>}</div>
      {action}
    </div>
  );
}

export function Stat({ label, value, hint, href }: { label: string; value: string; hint?: string; href?: string }) {
  const inner = (
    <div className="border border-white/10 rounded-[4px] p-5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors h-full">
      <p className="t-label text-white/45">{label}</p>
      <p className="t-dot text-3xl md:text-4xl mt-2 tabular-nums">{value}</p>
      {hint && <p className="text-xs text-white/45 mt-1">{hint}</p>}
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}

export function Card({ title, children, className, id }: { title?: string; children: React.ReactNode; className?: string; id?: string }) {
  return (
    <section id={id} className={cn("border border-white/10 rounded-[16px] bg-white/[0.02]", className)}>
      {title && <h2 className="t-label text-white/55 px-5 pt-4">{title}</h2>}
      <div className="p-5">{children}</div>
    </section>
  );
}

export function Empty({ text }: { text: string }) {
  return <p className="text-sm text-white/45 py-8 text-center">{text}</p>;
}
