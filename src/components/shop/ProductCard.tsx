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
        <div className="absolute top-3 left-3 flex gap-2">
          {soon && <span className="t-label text-[10px] bg-white text-black px-2.5 py-1.5 rounded-full">Bientôt</span>}
          {product.collection === "drops-2026" && <span className="t-label text-[10px] bg-pink text-white px-2.5 py-1.5 rounded-full">2026</span>}
        </div>
        <div className="absolute inset-x-3 bottom-3 translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 ease-[cubic-bezier(.16,1,.3,1)] hidden md:block">
          <span className="btn btn-primary w-full !py-3 text-[11px]">{soon ? "Être prévenu·e" : "Choisir ma coupe"}</span>
        </div>
      </div>
      <div className="mt-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-semibold leading-tight truncate">{product.title}</h3>
          <p className="text-xs text-white/55 mt-0.5 truncate">{product.subtitle}</p>
        </div>
        <p className="text-sm font-semibold tabular-nums shrink-0">
          {soon ? <span className="text-white/50 font-normal text-xs">Tarif à venir</span> : <>{product.category === "tee" ? "dès " : ""}{formatPrice(minPrice)}</>}
        </p>
      </div>
    </Link>
  );
}
