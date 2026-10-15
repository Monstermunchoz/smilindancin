import type { Money } from "@/lib/commerce/types";
export const formatPrice = (m: Money | number) => {
  const amount = typeof m === "number" ? m : m.amount;
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", minimumFractionDigits: amount % 100 === 0 ? 0 : 2 }).format(amount / 100);
};
export const formatDate = (iso: string, opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "long", year: "numeric" }) =>
  new Intl.DateTimeFormat("fr-FR", opts).format(new Date(iso));
export const cn = (...c: Array<string | false | null | undefined>) => c.filter(Boolean).join(" ");
