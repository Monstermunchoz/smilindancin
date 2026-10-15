import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ARTICLES, getArticle } from "@/lib/data/journal";
import { formatDate } from "@/lib/format";
export function generateStaticParams() { return ARTICLES.map((a) => ({ slug: a.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params; const a = getArticle(slug);
  return a ? { title: a.title, description: a.excerpt, openGraph: { type: "article", images: [a.cover], publishedTime: a.date } } : {};
}
export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const a = getArticle(slug);
  if (!a) notFound();
  const related = a.related.map(getArticle).filter(Boolean);
  const jsonLd = { "@context": "https://schema.org", "@type": "Article", headline: a.title, datePublished: a.date, image: a.cover, author: { "@type": "Organization", name: "Smilin' Dancin'" }, description: a.excerpt };
  return (
    <article className="pt-28 md:pt-36">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="m-center container-x max-w-4xl">
        <p className="t-label text-pink">{a.category} · {formatDate(a.date)} · {a.readingTime}</p>
        <h1 className="m-center t-display text-[clamp(34px,6vw,88px)] leading-[0.88] mt-3">{a.title}</h1>
        <p className="text-lg text-white/70 mt-5 max-w-2xl">{a.excerpt}</p>
      </div>
      <div className="container-x mt-10">
        <div className="relative aspect-[16/9] md:aspect-[21/9] overflow-hidden rounded-[3px]"><Image src={a.cover} alt={a.coverAlt} fill priority sizes="100vw" className="object-cover" />{a.credit && <span className="absolute bottom-3 right-3 t-label text-[10px] bg-black/60 px-2 py-1 rounded text-white/80">Photo {a.credit}</span>}</div>
      </div>
      <div className="container-x max-w-3xl mt-12 space-y-6 text-base md:text-lg leading-relaxed text-white/85">
        {a.body.map((b, i) => {
          if (b.type === "h2") return <h2 key={i} className="t-display text-3xl md:text-4xl pt-6 text-white">{b.text}</h2>;
          if (b.type === "quote") return <blockquote key={i} className="t-condensed text-3xl md:text-4xl g-neon-text border-l-2 border-pink pl-6 py-2">{b.text}</blockquote>;
          if (b.type === "list") return <ul key={i} className="space-y-2">{b.items?.map((it) => <li key={it} className="flex gap-3"><span className="text-pink mt-1.5">✦</span><span>{it}</span></li>)}</ul>;
          return <p key={i}>{b.text}</p>;
        })}
        <div className="pt-8 border-t border-white/10">
          <p className="t-label text-white/50 mb-2">Sources</p>
          <ul className="text-sm space-y-1">{a.sources.map((s) => <li key={s.url}><a href={s.url} target="_blank" rel="noreferrer" className="text-blue-sky hover:underline">{s.label}</a></li>)}</ul>
        </div>
      </div>
      {related.length > 0 && (
        <div className="container-x mt-20">
          <h2 className="t-label text-white/50 mb-4">À lire aussi</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {related.map((r) => r && (
              <Link key={r.slug} href={`/journal/${r.slug}`} className="group flex flex-col sm:flex-row gap-4 sm:gap-5 sm:items-center text-center sm:text-left border border-white/10 rounded-[3px] p-4 hover:border-white/30 transition-colors">
                <div className="relative w-full sm:w-28 aspect-[4/3] overflow-hidden rounded-[2px] shrink-0"><Image src={r.cover} alt="" fill sizes="112px" className="object-cover" /></div>
                <div><p className="t-label text-pink">{r.category}</p><p className="font-semibold mt-1 leading-snug">{r.title}</p></div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
