"use client";
import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/lib/commerce/types";
import { formatPrice, cn } from "@/lib/format";

export function ProductCard({ product, priority = false, className }: { product: Product; priority?: boolean; className?: string }) {
  const [a, b] = product.images;
  const soon = product.status === "coming_soon";
  const minPrice = product.variants.length ? Math.min(...product.variants.map((v) => v.price.amount)) : product.price.amount;
  return (
    <Link href={`/shop/${product.handle}`} className={cn("group block", className)}>
      <div className="relative aspect-[4/5] overflow-hidden bg-ink-2 rounded-[3px]">
        <Image src={a.src} alt={a.alt} fill sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw" priority={priority} className="card-img card-img-front object-cover group-hover:scale-[1.04]" />
        {b && <Image src={b.src} alt="" fill sizes="(max-width: 768px) 50vw, 25vw" className="card-img card-img-back object-cover opacity-0 group-hover:scale-[1.04]" aria-hidden />}
      </div>
      <div className="mt-3 flex flex-col items-center text-center gap-1 md:flex-row md:items-start md:justify-between md:text-left md:gap-3">
        <div className="min-w-0 max-w-full">
          <h3 className="font-semibold leading-tight truncate">{product.title}</h3>
          <p className="text-xs text-white/55 mt-0.5 truncate">{product.subtitle}</p>
          {(soon || product.preorder) && <p className={cn("t-label text-[10px] mt-1.5", soon ? "text-white/60" : "text-pink")}>{soon ? "Bientôt" : "Précommande"}</p>}
        </div>
        <p className="text-sm font-semibold tabular-nums shrink-0">
          {soon ? <span className="text-white/50 font-normal text-xs">Tarif à venir</span> : <>{product.category === "tee" ? "dès " : ""}{formatPrice(minPrice)}</>}
        </p>
      </div>
    </Link>
  );
}
