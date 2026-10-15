import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getEvent } from "@/lib/data/events";
import { getTierViews } from "@/lib/tickets/service";
import { TicketPicker } from "@/components/tickets/TicketPicker";
export const dynamic = "force-dynamic";
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params; const e = getEvent(slug);
  return e ? { title: `Billets · ${e.title}`, description: e.concept } : {};
}
export default async function EventTickets({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const e = getEvent(slug);
  if (!e?.ticketing) notFound();
  const tiers = await getTierViews(slug);
  return (
    <div className="pb-32">
      <header className="container-x pt-24 md:pt-32">
        <div className="relative aspect-[4/3] sm:aspect-[21/9] overflow-hidden rounded-[3px]">
          <Image src={e.cover} alt={e.title} fill priority sizes="100vw" className="object-cover" />
        </div>
        <div className="m-center pt-8 w-full">
          <p className="t-condensed text-xl text-blue-sky">{e.dateLabel} · {e.venue.name}</p>
          <h1 className="t-display text-[clamp(40px,11vw,160px)] leading-[0.84] mt-2">{e.title}</h1>
          <p className="text-white/75 mt-4 max-w-2xl">{e.concept}</p>
        </div>
      </header>
      <section className="container-x mt-10">
        <h2 className="m-center t-display text-[clamp(28px,5vw,56px)] mb-6">Choisis tes billets</h2>
        <TicketPicker slug={slug} tiers={tiers} demo={e.ticketing.demo} />
        <ul className="m-center mt-10 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-white/70">
          {e.practical.map((p) => <li key={p} className="border border-white/10 rounded-[2px] p-4">{p}</li>)}
        </ul>
      </section>
    </div>
  );
}
