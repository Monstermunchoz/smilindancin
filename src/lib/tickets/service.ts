import "server-only";
import { randomBytes } from "node:crypto";
import { readTable, writeTable, withLock } from "@/lib/db";
import { EVENTS, getEvent, type SDEvent } from "@/lib/data/events";
import type { Ticket, TicketOrder, TierSales, TierStatus, TierView } from "./types";

const now = () => new Date().toISOString();
const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const makeCode = () => Array.from(randomBytes(8), (b) => CODE_ALPHABET[b % CODE_ALPHABET.length]).join("");

export function ticketedEvents(): SDEvent[] {
  return EVENTS.filter((e) => e.ticketing);
}

/** Calcule l'état de chaque tarif. Les tarifs s'ouvrent l'un après l'autre (comme Shotgun) : un tarif n'ouvre que si le précédent est épuisé. */
export function tierViews(event: SDEvent, sales: TierSales): TierView[] {
  const t = event.ticketing;
  if (!t) return [];
  const s = sales[event.slug] ?? {};
  const progressive = ["early-bird", "regular", "last-release"];
  const out: TierView[] = [];
  for (const tier of t.tiers) {
    const o = s[tier.id] ?? { sold: 0 };
    const quota = o.quota ?? tier.quota;
    const price = o.price ?? tier.price;
    const sold = o.sold ?? 0;
    let status: TierStatus = "on_sale";
    const nowMs = Date.now();
    if (o.closed) status = "closed";
    else if (sold >= quota) status = "sold_out";
    else if (tier.startsAt && Date.parse(tier.startsAt) > nowMs) status = "upcoming";
    else if (tier.endsAt && Date.parse(tier.endsAt) < nowMs) status = "ended";
    else {
      const idx = progressive.indexOf(tier.id);
      if (idx > 0) {
        const prev = out.find((x) => x.id === progressive[idx - 1]);
        if (prev && (prev.status === "on_sale" || prev.status === "upcoming")) status = "upcoming";
      }
    }
    out.push({ ...tier, price, quota, sold, remaining: Math.max(0, quota - sold), status, progress: Math.min(1, sold / Math.max(1, quota)) });
  }
  return out;
}

export async function getTierViews(slug: string) {
  const e = getEvent(slug);
  if (!e) return [];
  return tierViews(e, await readTable("tierSales"));
}

export class TicketError extends Error {}

export async function createTicketOrder(input: { eventSlug: string; email: string; firstName: string; lastName: string; items: { tierId: string; quantity: number }[]; holders?: string[] }): Promise<TicketOrder> {
  const event = getEvent(input.eventSlug);
  if (!event?.ticketing) throw new TicketError("Billetterie indisponible pour cet événement.");
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(input.email)) throw new TicketError("Email invalide.");
  if (!input.firstName.trim() || !input.lastName.trim()) throw new TicketError("Nom et prénom requis (billets nominatifs).");
  const items = input.items.filter((i) => i.quantity > 0);
  if (!items.length) throw new TicketError("Choisissez au moins un billet.");

  return withLock(async () => {
    const sales = await readTable("tierSales");
    const views = tierViews(event, sales);
    const lines: TicketOrder["items"] = [];
    for (const it of items) {
      const v = views.find((x) => x.id === it.tierId);
      if (!v) throw new TicketError("Tarif inconnu.");
      if (v.status !== "on_sale") throw new TicketError(`${v.name} n'est pas en vente.`);
      const q = Math.floor(it.quantity);
      if (q > (v.perOrderMax ?? 10)) throw new TicketError(`${v.name} : ${v.perOrderMax} billets maximum par commande.`);
      if (q > v.remaining) throw new TicketError(`${v.name} : plus que ${v.remaining} place(s).`);
      lines.push({ tierId: v.id, tierName: v.name, unitPrice: v.price, quantity: q });
    }
    // Réservation des places (libérées si la commande est annulée)
    sales[event.slug] = sales[event.slug] ?? {};
    for (const l of lines) {
      const cur = sales[event.slug][l.tierId] ?? { sold: 0 };
      sales[event.slug][l.tierId] = { ...cur, sold: (cur.sold ?? 0) + l.quantity };
    }
    const orders = await readTable("ticketOrders");
    const number = orders.reduce((m, o) => Math.max(m, o.number), 0) + 1;
    const subtotal = lines.reduce((s, l) => s + l.unitPrice * l.quantity, 0);
    const fees = Math.round((subtotal * (event.ticketing!.feePercent ?? 0)) / 100);
    const order: TicketOrder = {
      id: `TK-${new Date().getFullYear()}-${String(number).padStart(4, "0")}`,
      number,
      createdAt: now(),
      eventSlug: event.slug,
      eventTitle: event.title,
      email: input.email.trim().toLowerCase(),
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      items: lines,
      subtotal,
      fees,
      total: subtotal + fees,
      status: "pending_payment",
      paymentProvider: "demo",
      ticketIds: [],
      accessKey: randomBytes(12).toString("hex"),
      holders: input.holders?.map((h) => h.trim()).filter(Boolean),
      demo: Boolean(event.ticketing!.demo),
    };
    orders.unshift(order);
    await writeTable("ticketOrders", orders);
    await writeTable("tierSales", sales);
    return order;
  });
}

/** Paiement validé → émission des billets (un par place, nominatif). */
export async function markTicketOrderPaid(orderId: string, provider: "demo" | "stripe" = "demo"): Promise<TicketOrder> {
  return withLock(async () => {
    const orders = await readTable("ticketOrders");
    const o = orders.find((x) => x.id === orderId);
    if (!o) throw new TicketError("Commande introuvable.");
    if (o.status === "paid") return o;
    if (o.status !== "pending_payment") throw new TicketError("Commande non payable.");
    const event = getEvent(o.eventSlug)!;
    const tickets = await readTable("tickets");
    const holders = o.holders ?? [];
    let k = 0;
    for (const l of o.items) {
      for (let i = 0; i < l.quantity; i++) {
        const t: Ticket = {
          id: `${o.id}-${String(k + 1).padStart(2, "0")}`,
          code: makeCode(),
          eventSlug: o.eventSlug,
          eventTitle: o.eventTitle,
          eventDateLabel: event.dateLabel,
          tierId: l.tierId,
          tierName: l.tierName,
          price: l.unitPrice,
          holderName: holders[k] || `${o.firstName} ${o.lastName}`,
          email: o.email,
          orderId: o.id,
          issuedAt: now(),
          status: "valid",
          demo: o.demo,
        };
        tickets.unshift(t);
        o.ticketIds.push(t.id);
        k++;
      }
    }
    o.status = "paid";
    o.paidAt = now();
    o.paymentProvider = provider;
    await writeTable("tickets", tickets);
    await writeTable("ticketOrders", orders);
    return o;
  });
}

export async function getTicketOrder(id: string) {
  return (await readTable("ticketOrders")).find((o) => o.id === id) ?? null;
}
export async function ticketsForOrder(id: string) {
  return (await readTable("tickets")).filter((t) => t.orderId === id);
}
export async function ticketByCode(code: string) {
  return (await readTable("tickets")).find((t) => t.code === code.toUpperCase()) ?? null;
}

export async function checkIn(code: string): Promise<{ ok: boolean; message: string; ticket?: Ticket }> {
  return withLock(async () => {
    const tickets = await readTable("tickets");
    const t = tickets.find((x) => x.code === code.trim().toUpperCase());
    if (!t) return { ok: false, message: "Billet inconnu." };
    if (t.status === "cancelled") return { ok: false, message: "Billet annulé.", ticket: t };
    if (t.status === "used") return { ok: false, message: `Déjà scanné le ${new Date(t.checkedInAt!).toLocaleString("fr-FR")}.`, ticket: t };
    t.status = "used";
    t.checkedInAt = now();
    await writeTable("tickets", tickets);
    return { ok: true, message: "Entrée validée ✓", ticket: t };
  });
}

export async function updateTier(eventSlug: string, tierId: string, patch: { quota?: number; price?: number; closed?: boolean }) {
  return withLock(async () => {
    const sales = await readTable("tierSales");
    sales[eventSlug] = sales[eventSlug] ?? {};
    const cur = sales[eventSlug][tierId] ?? { sold: 0 };
    sales[eventSlug][tierId] = { ...cur, ...patch };
    await writeTable("tierSales", sales);
  });
}
