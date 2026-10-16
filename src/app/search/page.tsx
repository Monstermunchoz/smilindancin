import type { Metadata } from "next";
import { commerce } from "@/lib/commerce";
import { ProductCard } from "@/components/shop/ProductCard";
import { SearchForm } from "@/components/shop/SearchForm";
export const metadata: Metadata = { title: "Recherche" };
export const dynamic = "force-dynamic";
export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const results = q ? await commerce.searchProducts(q) : [];
  return (
    <div className="container-x pt-28 md:pt-36">
      <h1 className="m-center t-display text-[clamp(34px,7vw,96px)] leading-[0.85] mb-8">Recherche</h1>
      <SearchForm initial={q} />
      {q && (
        <p className="t-label text-white/50 mt-8">{results.length} résultat{results.length > 1 ? "s" : ""} pour « {q} »</p>
      )}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-3 gap-y-8 md:gap-x-5 mt-6">
        {results.map((p) => <ProductCard key={p.id} product={p} />)}
      </div>
      {q && results.length === 0 && <p className="text-white/60 mt-4">Rien trouvé. Essayez « sweat », « together », « blanc »…</p>}
    </div>
  );
}
