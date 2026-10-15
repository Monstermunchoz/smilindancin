import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { commerce } from "@/lib/commerce";
import { getStripe, stripeConfigured } from "@/lib/stripe";

/**
 * Webhook Stripe : checkout.session.completed → commande payée.
 * Config : Stripe Dashboard → Developers → Webhooks → endpoint https://<site>/api/webhooks/stripe
 * Événements : checkout.session.completed, checkout.session.async_payment_succeeded, charge.refunded
 * Local : `stripe listen --forward-to localhost:3000/api/webhooks/stripe` puis STRIPE_WEBHOOK_SECRET=whsec_…
 */
export async function POST(req: Request) {
  if (!stripeConfigured || !process.env.STRIPE_WEBHOOK_SECRET) return NextResponse.json({ error: "Webhook non configuré" }, { status: 503 });
  const sig = req.headers.get("stripe-signature");
  const body = await req.text();
  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, sig ?? "", process.env.STRIPE_WEBHOOK_SECRET);
  } catch (e) {
    return NextResponse.json({ error: `Signature invalide: ${(e as Error).message}` }, { status: 400 });
  }

  if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.orderId;
    if (orderId && session.payment_status === "paid") {
      await commerce.updateOrder(orderId, { status: "paid", paymentStatus: "paid" }, "system");
    }
  }
  if (event.type === "charge.refunded") {
    const charge = event.data.object as Stripe.Charge;
    const orderId = charge.metadata?.orderId;
    if (orderId) await commerce.updateOrder(orderId, { status: "refunded", paymentStatus: "refunded" }, "system");
  }
  return NextResponse.json({ received: true });
}
