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
      <div className="mt-3 text-center md:text-left">
        <h3 className="font-semibold leading-tight truncate">{product.title}</h3>
        <p className="text-xs text-white/55 mt-1 truncate">{product.subtitle}</p>
        <p className="mt-2 h-5 flex items-center justify-center md:justify-start gap-2 text-sm tabular-nums whitespace-nowrap">
          {(soon || product.preorder) && <span className={cn("t-label text-[10px]", soon ? "text-white/55" : "text-pink")}>{soon ? "Bientôt" : "Précommande"}</span>}
          {soon ? <span className="text-white/50 text-xs">Tarif à venir</span> : <span className="font-semibold">{product.category === "tee" ? "dès " : ""}{formatPrice(minPrice)}</span>}
        </p>
      </div>
    </Link>
  );
}
