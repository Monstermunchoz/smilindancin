import type { Metadata } from "next";
import { commerce } from "@/lib/commerce";
import { CheckoutForm } from "@/components/shop/CheckoutForm";
import { stripeConfigured } from "@/lib/stripe";
export const metadata: Metadata = { title: "Commander", robots: { index: false } };
export const dynamic = "force-dynamic";
export default async function CheckoutPage() {
  const methods = await commerce.shippingMethods();
  return (
    <div className="container-x pt-28 md:pt-36">
      <h1 className="m-center t-display text-[clamp(34px,7vw,96px)] leading-[0.85] mb-10">Commander</h1>
      <CheckoutForm methods={methods} stripeEnabled={stripeConfigured} />
    </div>
  );
}
