import { NextResponse } from "next/server";
import { commerce } from "@/lib/commerce";
import { getStripe, stripeConfigured } from "@/lib/stripe";
import { SITE } from "@/lib/site";

/**
 * Crée une session Stripe Checkout pour une commande déjà enregistrée (status pending_payment).
 * Le client est redirigé vers Stripe ; le webhook /api/webhooks/stripe marque la commande payée.
 */
export async function POST(req: Request) {
  if (!stripeConfigured) return NextResponse.json({ error: "Stripe non configuré" }, { status: 503 });
  const { orderId } = await req.json();
  const order = await commerce.getOrder(String(orderId));
  if (!order) return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });
  if (order.paymentStatus === "paid") return NextResponse.json({ error: "Commande déjà payée" }, { status: 400 });

  const base = process.env.NEXT_PUBLIC_SITE_URL ?? SITE.url;
  const stripe = getStripe();
  try {
    const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: order.customer.email,
    locale: "fr",
    line_items: [
      ...order.lines.map((l) => ({
        quantity: l.quantity,
        price_data: {
          currency: "eur",
          unit_amount: l.unitPrice.amount,
          product_data: { name: l.productTitle, description: l.variantTitle, images: l.image.startsWith("http") ? [l.image] : [`${base}${l.image}`] },
        },
      })),
      ...(order.shipping.amount > 0
        ? [{ quantity: 1, price_data: { currency: "eur", unit_amount: order.shipping.amount, product_data: { name: `Livraison — ${order.shippingMethod.label}` } } }]
        : []),
    ],
    metadata: { orderId: order.id },
    payment_intent_data: { metadata: { orderId: order.id } },
    success_url: `${base}/checkout/confirmation/${order.id}?paid=1`,
    cancel_url: `${base}/checkout/confirmation/${order.id}?cancelled=1`,
  });

    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error("[stripe] checkout session error", e);
    return NextResponse.json({ error: "Paiement temporairement indisponible. Votre commande est enregistrée, nous vous contactons." }, { status: 502 });
  }
}
