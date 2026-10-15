import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { commerce } from "@/lib/commerce";
import { Reveal } from "@/components/ui/Reveal";
export const metadata: Metadata = { title: "Collections" };
export const dynamic = "force-dynamic";
export default async function CollectionsPage() {
  const collections = await commerce.listCollections();
  return (
    <div className="container-x pt-28 md:pt-36">
      <h1 className="m-center t-display text-[clamp(34px,9vw,128px)] leading-[0.85] mb-10">Collections</h1>
      <div className="grid md:grid-cols-3 gap-4">
        {collections.map((c, i) => (
          <Reveal key={c.handle} delay={i * 0.08}>
            <Link href={`/collections/${c.handle}`} className="group relative block aspect-[4/5] overflow-hidden rounded-[3px] bg-ink-2">
              <Image src={c.image} alt={c.title} fill sizes="(max-width:768px) 100vw, 33vw" className="object-cover transition-transform duration-[1.4s] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.04]" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
              <div className="m-center absolute inset-x-6 bottom-6">
                <p className="t-condensed text-blue-sky text-lg">{c.tagline}</p>
                <p className="t-display text-3xl md:text-4xl">{c.title}</p>
                <p className="text-xs text-white/60 mt-2">{c.productHandles.length} pièce{c.productHandles.length > 1 ? "s" : ""}</p>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
