import { commerce } from "@/lib/commerce";
import { pastEvents } from "@/lib/data/events";
import { ARTICLES } from "@/lib/data/journal";
import { Hero } from "@/components/home/Hero";
import { BrandMarquee, Drops, VisualPicker, Featured, Campaign, EventsSection, JournalSection, BrandStatement, NewsletterBlock } from "@/components/home/Sections";

export const dynamic = "force-dynamic";

export default async function Home() {
  const products = await commerce.listProducts();
  const drops = products.filter((p) => p.collection === "drops-2026");
  const featured = products.filter((p) => p.featured && p.status === "active");
  return (
    <>
      <Hero />
      <BrandMarquee />
      <Drops products={drops} />
      <VisualPicker products={products} />
      <Featured products={featured} />
      <Campaign />
      <EventsSection events={pastEvents()} />
      <JournalSection articles={ARTICLES} />
      <BrandStatement />
      <NewsletterBlock />
    </>
  );
}
