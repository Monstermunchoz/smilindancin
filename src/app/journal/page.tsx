import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ARTICLES } from "@/lib/data/journal";
import { Reveal } from "@/components/ui/Reveal";
import { formatDate } from "@/lib/format";
export const metadata: Metadata = { title: "Journal", description: "Culture électronique, coulisses des festivals, collections : le journal Smilin' Dancin'." };
export default function JournalPage() {
  const [first, ...rest] = ARTICLES;
  return (
    <div className="container-x pt-28 md:pt-36">
      <h1 className="t-display text-[clamp(48px,9vw,128px)] leading-[0.85] mb-10">Journal</h1>
      <Reveal>
        <Link href={`/journal/${first.slug}`} className="group grid lg:grid-cols-2 gap-6 lg:gap-12 items-center">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[3px] bg-ink-2"><Image src={first.cover} alt={first.coverAlt} fill priority sizes="(max-width:1024px) 100vw, 50vw" className="object-cover transition-transform duration-[1.4s] group-hover:scale-[1.04]" /></div>
          <div>
            <p className="t-label text-pink">{first.category} · {formatDate(first.date)} · {first.readingTime}</p>
            <h2 className="t-display text-[clamp(32px,4.5vw,64px)] leading-[0.9] mt-3 group-hover:text-blue-sky transition-colors">{first.title}</h2>
            <p className="text-white/65 mt-4 max-w-xl">{first.excerpt}</p>
          </div>
        </Link>
      </Reveal>
      <div className="grid md:grid-cols-3 gap-6 mt-16">
        {rest.map((a, i) => (
          <Reveal key={a.slug} delay={i * 0.06}>
            <Link href={`/journal/${a.slug}`} className="group block">
              <div className="relative aspect-[4/3] overflow-hidden rounded-[3px] bg-ink-2"><Image src={a.cover} alt={a.coverAlt} fill sizes="(max-width:768px) 100vw, 33vw" className="object-cover transition-transform duration-[1.2s] group-hover:scale-[1.04]" /></div>
              <p className="t-label text-pink mt-4">{a.category} · {formatDate(a.date, { day: "numeric", month: "short", year: "numeric" })}</p>
              <h3 className="font-semibold text-lg leading-snug mt-1.5 group-hover:text-blue-sky transition-colors">{a.title}</h3>
              <p className="text-sm text-white/55 mt-1.5 line-clamp-2">{a.excerpt}</p>
            </Link>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
