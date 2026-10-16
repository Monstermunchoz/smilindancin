"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { ShippingMethod } from "@/lib/commerce/types";
import { useCart, cartSubtotal } from "@/lib/store/cart";
import { formatPrice, cn } from "@/lib/format";
import { useToast } from "@/components/ui/Toaster";

export function CheckoutForm({ methods, stripeEnabled = false }: { methods: ShippingMethod[]; stripeEnabled?: boolean }) {
  const { lines, clear, remove } = useCart();
  const [mounted, setMounted] = useState(false);
  const [method, setMethod] = useState(methods[0]?.id ?? "");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const push = useToast((s) => s.push);
  const router = useRouter();
  useEffect(() => setMounted(true), []);
  const [f, setF] = useState({ email: "", firstName: "", lastName: "", phone: "", line1: "", line2: "", postalCode: "", city: "", country: "France", note: "" });
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });

  if (!mounted) return null;
  const subtotal = cartSubtotal(lines);
  const ship = methods.find((m) => m.id === method);
  const total = subtotal + (ship?.price.amount ?? 0);

  if (lines.length === 0)
    return (
      <div className="py-20 text-center">
        <p className="t-condensed text-4xl text-white/80">Votre panier est vide</p>
        <Link href="/shop" className="btn btn-primary mt-6">Voir le shop</Link>
      </div>
    );

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const err: Record<string, string> = {};
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.email)) err.email = "Email invalide";
    if (!f.firstName.trim()) err.firstName = "Prénom requis";
    if (!f.lastName.trim()) err.lastName = "Nom requis";
    if (method !== "event") {
      if (!f.line1.trim()) err.line1 = "Adresse requise";
      if (!/^\d{5}$/.test(f.postalCode)) err.postalCode = "Code postal (5 chiffres)";
      if (!f.city.trim()) err.city = "Ville requise";
    }
    setErrors(err);
    if (Object.keys(err).length) return push("Vérifiez les champs en rouge.", "error");
    setLoading(true);
    const r = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customer: { email: f.email, firstName: f.firstName, lastName: f.lastName, phone: f.phone },
        shippingAddress: { line1: f.line1 || "Retrait à l'événement", line2: f.line2, postalCode: f.postalCode || "00000", city: f.city || "", country: f.country },
        shippingMethodId: method,
        lines: lines.map((l) => ({ variantId: l.variantId, quantity: l.quantity })),
        note: f.note,
      }),
    });
    const data = await r.json();
    setLoading(false);
    if (!r.ok) {
      if (data.code === "OUT_OF_STOCK" && data.details?.variantId) {
        push(`${data.error}, retirée du panier.`, "error");
        remove(data.details.variantId);
      } else push(data.error ?? "Erreur lors de la commande.", "error");
      return;
    }
    if (stripeEnabled) {
      const s = await fetch("/api/checkout/stripe", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ orderId: data.order.id }) });
      const sd = await s.json();
      if (s.ok && sd.url) {
        clear();
        window.location.href = sd.url;
        return;
      }
      push("Paiement indisponible, commande enregistrée, nous vous contactons.", "error");
    }
    clear();
    router.push(`/paiement/commande/${data.order.id}`);
  }

  const field = (k: keyof typeof f, label: string, opts: { type?: string; span?: boolean; autoComplete?: string } = {}) => (
    <div key={k} className={cn(opts.span && "sm:col-span-2")}>
      <label htmlFor={k} className="t-label text-white/55 block mb-1.5">{label}</label>
      <input id={k} type={opts.type ?? "text"} value={f[k]} onChange={set(k)} autoComplete={opts.autoComplete} className={cn("w-full bg-white/5 border rounded-[3px] px-4 py-3 text-sm outline-none focus:border-white", errors[k] ? "border-pink" : "border-white/15")} />
      {errors[k] && <p className="text-xs text-pink mt-1">{errors[k]}</p>}
    </div>
  );

  return (
    <form onSubmit={submit} className="grid lg:grid-cols-[1fr_420px] gap-10 lg:gap-16 items-start">
      <div className="space-y-10">
        <section>
          <h2 className="t-display text-2xl mb-5">Contact</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {field("email", "Email", { type: "email", span: true, autoComplete: "email" })}
            {field("firstName", "Prénom", { autoComplete: "given-name" })}
            {field("lastName", "Nom", { autoComplete: "family-name" })}
            {field("phone", "Téléphone (optionnel)", { type: "tel", span: true, autoComplete: "tel" })}
          </div>
        </section>
        <section>
          <h2 className="t-display text-2xl mb-5">Livraison</h2>
          <div className="space-y-2 mb-6">
            {methods.map((m) => (
              <label key={m.id} className={cn("flex items-center justify-between gap-4 border rounded-[3px] p-4 cursor-pointer transition-colors", method === m.id ? "border-white bg-white/5" : "border-white/15 hover:border-white/40")}>
                <span className="flex items-center gap-3">
                  <input type="radio" name="ship" value={m.id} checked={method === m.id} onChange={() => setMethod(m.id)} className="accent-pink" />
                  <span>
                    <span className="block text-sm font-semibold">{m.label}</span>
                    <span className="block text-xs text-white/55">{m.description} · {m.eta}</span>
                  </span>
                </span>
                <span className="text-sm tabular-nums">{m.price.amount === 0 ? "Offert" : formatPrice(m.price)}</span>
              </label>
            ))}
          </div>
          {method !== "event" && (
            <div className="grid sm:grid-cols-2 gap-4">
              {field("line1", "Adresse", { span: true, autoComplete: "address-line1" })}
              {field("line2", "Complément (optionnel)", { span: true, autoComplete: "address-line2" })}
              {field("postalCode", "Code postal", { autoComplete: "postal-code" })}
              {field("city", "Ville", { autoComplete: "address-level2" })}
              {field("country", "Pays", { span: true, autoComplete: "country-name" })}
            </div>
          )}
          <div className="mt-4">
            <label htmlFor="note" className="t-label text-white/55 block mb-1.5">Note (optionnel)</label>
            <textarea id="note" value={f.note} onChange={set("note")} rows={3} className="w-full bg-white/5 border border-white/15 rounded-[3px] px-4 py-3 text-sm outline-none focus:border-white" />
          </div>
        </section>
        {stripeEnabled ? (
          <section className="border border-white/15 rounded-[3px] p-5">
            <p className="font-semibold">Paiement sécurisé par Stripe</p>
            <p className="text-sm text-white/65 mt-1">Après validation, vous serez redirigé·e vers la page de paiement Stripe (carte bancaire, Apple Pay, Google Pay).</p>
          </section>
        ) : (
          <section className="border border-pink/40 bg-pink/5 rounded-[3px] p-5">
            <p className="font-semibold">Paiement en ligne, mode démonstration</p>
            <p className="text-sm text-white/65 mt-1">Étape suivante : page de paiement simulée (aucun débit, aucune donnée bancaire). Le paiement réel s'active avec Stripe.</p>
          </section>
        )}
      </div>

      <aside className="lg:sticky lg:top-24 border border-white/10 rounded-[3px] p-5 space-y-4 bg-ink">
        <h2 className="t-display text-2xl">Récapitulatif</h2>
        <ul className="divide-y divide-white/10">
          {lines.map((l) => (
            <li key={l.variantId} className="py-3 flex gap-3">
              <div className="relative w-14 aspect-[4/5] shrink-0 overflow-hidden rounded-[2px]"><Image src={l.image} alt="" fill sizes="56px" className="object-cover" /></div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold leading-tight">{l.productTitle}</p>
                <p className="text-xs text-white/50">{l.variantTitle} × {l.quantity}</p>
              </div>
              <p className="text-sm tabular-nums">{formatPrice(l.unitPrice.amount * l.quantity)}</p>
            </li>
          ))}
        </ul>
        <div className="space-y-1.5 text-sm">
          <div className="flex justify-between text-white/70"><span>Sous-total</span><span className="tabular-nums">{formatPrice(subtotal)}</span></div>
          <div className="flex justify-between text-white/70"><span>Livraison</span><span className="tabular-nums">{ship ? (ship.price.amount === 0 ? "Offert" : formatPrice(ship.price)) : "À choisir"}</span></div>
          <div className="flex justify-between font-semibold text-base pt-2 border-t border-white/10"><span>Total</span><span className="tabular-nums">{formatPrice(total)}</span></div>
        </div>
        <button disabled={loading} className="btn btn-brand w-full !py-4">{loading ? "Un instant…" : stripeEnabled ? "Payer avec Stripe" : "Continuer vers le paiement"}</button>
        <p className="text-[11px] text-white/40">En validant, vous acceptez les <Link href="/legal/cgv" className="underline">CGV</Link>.</p>
      </aside>
    </form>
  );
}
