export type TierConfig = {
  id: string;
  name: string;
  description: string;
  price: number; // centimes
  quota: number;
  perOrderMax?: number;
  startsAt?: string; // ISO
  endsAt?: string;
  badge?: string;
};

export type EventTicketing = {
  demo: boolean;
  currencyNote?: string;
  feePercent: number; // frais de service (0 = aucun)
  tiers: TierConfig[];
};

/** Ventes + surcharges admin par événement et par tarif. */
export type TierSales = Record<string, Record<string, { sold: number; quota?: number; price?: number; closed?: boolean }>>;

export type TierStatus = "on_sale" | "sold_out" | "upcoming" | "ended" | "closed";

export type TierView = TierConfig & { sold: number; remaining: number; status: TierStatus; progress: number };

export type Ticket = {
  id: string;
  code: string;
  eventSlug: string;
  eventTitle: string;
  eventDateLabel: string;
  tierId: string;
  tierName: string;
  price: number;
  holderName: string;
  email: string;
  orderId: string;
  issuedAt: string;
  status: "valid" | "used" | "cancelled";
  checkedInAt?: string;
  demo: boolean;
};

export type TicketOrder = {
  id: string;
  number: number;
  createdAt: string;
  eventSlug: string;
  eventTitle: string;
  email: string;
  firstName: string;
  lastName: string;
  items: { tierId: string; tierName: string; unitPrice: number; quantity: number }[];
  subtotal: number;
  fees: number;
  total: number;
  status: "pending_payment" | "paid" | "cancelled" | "refunded";
  paymentProvider: "demo" | "stripe";
  paidAt?: string;
  ticketIds: string[];
  accessKey: string;
  holders?: string[];
  demo: boolean;
};
