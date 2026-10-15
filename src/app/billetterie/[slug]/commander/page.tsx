import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getEvent } from "@/lib/data/events";
import { getTierViews } from "@/lib/tickets/service";
import { TicketCheckout } from "@/components/tickets/TicketCheckout";
import { currentUser } from "@/lib/account/auth";
export const metadata: Metadata = { title: "Réserver", robots: { index: false } };
export const dynamic = "force-dynamic";
export default async function Commander({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ sel?: string }> }) {
  const { slug } = await params;
  const { sel = "" } = await searchParams;
  const e = getEvent(slug);
  if (!e?.ticketing) notFound();
  const tiers = await getTierViews(slug);
  const lines = sel.split(",").map((p) => p.split(":")).map(([id, n]) => ({ tier: tiers.find((t) => t.id === id)!, quantity: Math.max(0, Math.floor(Number(n))) })).filter((l) => l.tier && l.quantity > 0 && l.tier.status === "on_sale");
  const user = await currentUser();
  return (
    <div className="container-x pt-28 md:pt-36">
      <h1 className="m-center t-display text-[clamp(34px,7vw,96px)] leading-[0.85] mb-8">Réserver</h1>
      {lines.length === 0 ? (
        <div className="m-center py-16"><p className="text-white/70">Aucun billet sélectionné.</p><Link href={`/billetterie/${slug}`} className="btn btn-primary mt-6">Choisir des billets</Link></div>
      ) : (
        <TicketCheckout slug={slug} eventTitle={e.title} lines={lines} user={user ? { email: user.email, firstName: user.firstName, lastName: user.lastName } : null} />
      )}
    </div>
  );
}
