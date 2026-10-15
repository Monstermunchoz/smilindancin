import "server-only";
import Stripe from "stripe";

/** Stripe est activé dès que STRIPE_SECRET_KEY est défini (.env.local). */
export const stripeConfigured = Boolean(process.env.STRIPE_SECRET_KEY);

let client: Stripe | null = null;
export function getStripe(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) throw new Error("STRIPE_SECRET_KEY manquant");
  if (!client) client = new Stripe(process.env.STRIPE_SECRET_KEY);
  return client;
}
