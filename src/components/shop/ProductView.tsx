"use client";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { Product } from "@/lib/commerce/types";
import { CUTS, PRINTS, SIZES, slug, type CutId, type PrintId } from "@/lib/data/products";
import { useCart } from "@/lib/store/cart";
import { useToast } from "@/components/ui/Toaster";
import { formatPrice, cn } from "@/lib/format";
import { ProductCard } from "./ProductCard";
import { NewsletterForm } from "@/components/ui/NewsletterForm";
import { GarmentViewer } from "./GarmentViewer";

const ease = [0.16, 1, 0.3, 1] as const;

export function ProductView({ product, related, sibling }: { product: Product; related: Product[]; sibling: Product | null }) {
  const isTee = product.category === "tee" && product.variants.length > 0;
  const isHoodie = product.category === "hoodie";
  const soon = product.status === "coming_soon";
  const reduce = useReducedMotion();

  const visualTag = product.tags.find((t) => /^visuel-\d$/.test(t));
  const visual = visualTag ? Number(visualTag.split("-")[1]) : null;
  const has3d = visual !== null && (isTee || isHoodie);
  const [img, setImg] = useState(has3d ? -1 : 0);
  const [cut, setCut] = useState<CutId>("classic-h");
  const [print, setPrint] = useState<PrintId>("back");
  const [color, setColor] = useState(product.colors[0]?.name ?? "Noir");
  const [size, setSize] = useState<string | null>(null);
  const [showGuide, setShowGuide] = useState(false);
  const add = useCart((s) => s.add);
  const push = useToast((s) => s.push);

  const variant = useMemo(() => {
    if (soon) return null;
    const id = isTee ? `${product.id}--${cut}--${print}--${slug(color)}--${slug(size ?? "")}` : `${product.id}--hoodie--${slug(color)}--${slug(size ?? "")}`;
    return product.variants.find((v) => v.id === id) ?? null;
  }, [product, cut, print, color, size, isTee, soon]);

  const priceShown = useMemo(() => {
    if (soon) return null;
    if (isTee) {
      const c = CUTS.find((x) => x.id === cut)!;
      return print === "back" ? c.back : c.front;
    }
    return product.price.amount;
  }, [soon, isTee, cut, print, product.price.amount]);

  function addToCart() {
    if (!size) {
      push("Choisissez une taille.", "error");
      return;
    }
    if (!variant) {
      push("Cette combinaison n'est pas disponible.", "error");
      return;
    }
    if (!variant.available) {
      push("Cette taille est épuisée.", "error");
      return;
    }
    const res = add({
      id: variant.id,
      productHandle: product.handle,
      productTitle: `${product.title}${isTee ? " — T-shirt" : " — Sweat"}${product.preorder ? " (précommande)" : ""}`,
      variantId: variant.id,
      variantTitle: variant.title,
      options: variant.options,
      image: product.images[0].src,
      unitPrice: variant.price,
      maxQuantity: variant.stock,
    });
    if (!res.ok) push(res.reason ?? "Impossible d'ajouter.", "error");
  }

  const genders = ["Homme", "Femme"] as const;
  const cutObj = CUTS.find((c) => c.id === cut)!;

  return (
    <div className="container-x pt-24 md:pt-32">
      <nav className="t-label text-white/45 mb-6 flex gap-2 flex-wrap justify-center md:justify-start" aria-label="Fil d'Ariane">
        <Link href="/shop" className="hover:text-white">Shop</Link><span>/</span>
        <Link href={`/collections/${product.collection}`} className="hover:text-white">{product.collection === "drops-2026" ? "Nouvelle co' 2026" : product.collection === "accessoires" ? "Accessoires" : "Smilers & Dancers"}</Link><span>/</span>
        <span className="text-white/80">{product.title}</span>
      </nav>

      <div className="grid lg:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)] gap-8 lg:gap-16 items-start">
        {/* Galerie */}
        <div className="lg:sticky lg:top-24">
          <div className="grid grid-cols-[64px_1fr] md:grid-cols-[80px_1fr] gap-3">
            <div className="flex flex-col gap-2">
              {has3d && (
                <button onClick={() => setImg(-1)} aria-label="Vue 3D devant / dos" className={cn("relative aspect-[4/5] overflow-hidden rounded-[2px] border transition-colors g-brand flex flex-col items-center justify-center gap-0.5", img === -1 ? "border-white" : "border-transparent opacity-70 hover:opacity-100")}>
                  <span className="t-display text-lg leading-none">3D</span>
                  <span className="t-label text-[8px] text-white/85">360°</span>
                </button>
              )}
              {product.images.map((im, i) => (
                <button key={im.src + i} onClick={() => setImg(i)} aria-label={`Image ${i + 1}`} className={cn("relative aspect-[4/5] overflow-hidden rounded-[2px] border transition-colors", img === i ? "border-white" : "border-transparent opacity-60 hover:opacity-100")}>
                  <Image src={im.src} alt="" fill sizes="80px" className="object-cover" />
                </button>
              ))}
            </div>
            <div className="relative aspect-[4/5] overflow-hidden rounded-[3px] bg-ink-2">
              {img === -1 && has3d ? (
                <GarmentViewer visual={visual!} hex={product.colors.find((c) => c.name === color)?.hex ?? "#111114"} kind={isHoodie ? "hoodie" : "tee"} cut={cut} print={print} />
              ) : (
              <>
              <AnimatePresence mode="wait" initial={false}>
                <motion.div key={img} className="absolute inset-0" initial={reduce ? false : { opacity: 0, scale: 1.03 }} animate={{ opacity: 1, scale: 1 }} exit={reduce ? undefined : { opacity: 0 }} transition={{ duration: 0.5, ease }}>
                  <Image src={product.images[img].src} alt={product.images[img].alt} fill priority sizes="(max-width:1024px) 100vw, 55vw" className="object-cover" />
                </motion.div>
              </AnimatePresence>
              <span className="absolute bottom-3 left-3 t-label text-[10px] bg-black/60 text-white/80 px-2 py-1 rounded">
                {product.images[img].kind === "worn" ? "Porté · photo @smilin.dancin" : product.images[img].kind === "mockup" ? "Mockup" : "Visuel"}
              </span>
              </>
              )}
            </div>
            {img === -1 && has3d && <p className="col-start-2 text-[11px] text-white/45 text-center md:text-left">Rendu 3D indicatif : visuel officiel sur la coupe et le coloris choisis. Photos portées dans la galerie.</p>}
          </div>
        </div>

        {/* Configurateur */}
        <div className="pb-24 lg:pb-0">
          <div className="m-center">
          <p className="t-condensed text-blue-sky text-lg">{product.subtitle}</p>
          <h1 className="t-display text-[clamp(32px,3.6vw,60px)] leading-[0.9] mt-1">{product.title}</h1>
          <div className="mt-4 flex items-baseline gap-3 justify-center md:justify-start">
            {soon ? (
              <p className="t-condensed text-2xl text-white/70">Tarif à venir</p>
            ) : (
              <motion.p key={priceShown} initial={{ opacity: 0.5, y: 4 }} animate={{ opacity: 1, y: 0 }} className="text-2xl font-semibold tabular-nums">
                {formatPrice(priceShown!)}
              </motion.p>
            )}
            {product.preorder ? <p className="t-label text-[10px] bg-pink text-white px-2.5 py-1 rounded-full">Précommande</p> : <p className="t-label text-white/40">Made in France</p>}
          </div>
          <p className="mt-5 text-white/75 leading-relaxed">{product.description}</p>
          </div>

          {soon ? (
            <div className="mt-8 border border-white/15 rounded-[3px] p-5">
              <p className="font-semibold">Bientôt disponible</p>
              <p className="text-sm text-white/60 mt-1 mb-4">Stock limité, tarif communiqué par la marque. Laisse ton email pour être prévenu·e dès l'ouverture.</p>
              <NewsletterForm source={`notify:${product.handle}`} />
            </div>
          ) : (
            <div className="mt-8 space-y-7">
              {isTee && (
                <>
                  <fieldset>
                    <legend className="t-label text-white/60 mb-3">Coupe · {cutObj.label} {cutObj.gender}</legend>
                    <div className="space-y-2">
                      {genders.map((g) => (
                        <div key={g} className="flex flex-wrap gap-2 items-center">
                          <span className="w-14 text-xs text-white/50">{g}</span>
                          {CUTS.filter((c) => c.gender === g).map((c) => (
                            <button key={c.id} onClick={() => setCut(c.id)} aria-pressed={cut === c.id} className={cn("px-4 py-2 rounded-full text-xs font-semibold border transition-colors", cut === c.id ? "bg-white text-black border-white" : "border-white/20 text-white/80 hover:border-white")}>
                              {c.label}
                            </button>
                          ))}
                        </div>
                      ))}
                    </div>
                  </fieldset>
                  <fieldset>
                    <legend className="t-label text-white/60 mb-3">Impression</legend>
                    <div className="grid grid-cols-2 gap-2">
                      {PRINTS.map((p) => {
                        const price = p.id === "back" ? cutObj.back : cutObj.front;
                        return (
                          <button key={p.id} onClick={() => setPrint(p.id)} aria-pressed={print === p.id} className={cn("text-left rounded-[3px] border p-3.5 transition-colors", print === p.id ? "border-white bg-white/5" : "border-white/15 hover:border-white/50")}>
                            <span className="block text-sm font-semibold">{p.label}</span>
                            <span className="block text-xs text-white/55 mt-0.5">{p.description}</span>
                            <span className="block text-xs mt-2 tabular-nums">{formatPrice(price)}</span>
                          </button>
                        );
                      })}
                    </div>
                  </fieldset>
                </>
              )}
              {isHoodie && (
                <div className="rounded-[3px] border border-white/15 p-4 text-sm text-white/70">
                  {product.details[0]} · {product.details[1]}
                </div>
              )}

              <fieldset>
                <legend className="t-label text-white/60 mb-3">Couleur · {color}</legend>
                <div className="flex gap-3">
                  {product.colors.map((c) => (
                    <button key={c.name} onClick={() => setColor(c.name)} aria-pressed={color === c.name} aria-label={c.name} title={c.name} className={cn("w-10 h-10 rounded-full border-2 transition-transform", color === c.name ? "border-pink scale-110" : "border-white/25 hover:scale-105")} style={{ background: c.hex }} />
                  ))}
                </div>
              </fieldset>

              <fieldset>
                <div className="flex items-center justify-between mb-3">
                  <legend className="t-label text-white/60">Taille {size ? `· ${size}` : ""}</legend>
                  <button onClick={() => setShowGuide((s) => !s)} className="text-xs text-white/60 hover:text-white u-line">Guide des tailles</button>
                </div>
                <div className="grid grid-cols-6 gap-2">
                  {SIZES.map((s) => {
                    const vid = isTee ? `${product.id}--${cut}--${print}--${slug(color)}--${slug(s)}` : `${product.id}--hoodie--${slug(color)}--${slug(s)}`;
                    const v = product.variants.find((x) => x.id === vid);
                    const off = !v || !v.available;
                    return (
                      <button key={s} onClick={() => !off && setSize(s)} disabled={off} aria-pressed={size === s} className={cn("h-11 rounded-[3px] text-sm font-semibold border transition-colors relative", size === s ? "bg-white text-black border-white" : off ? "border-white/10 text-white/25 line-through" : "border-white/20 hover:border-white")}>
                        {s}
                      </button>
                    );
                  })}
                </div>
                <AnimatePresence>
                  {showGuide && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="mt-4 text-xs text-white/70 border border-white/15 rounded-[3px] p-4">
                        <p className="font-semibold text-white mb-2">Tailles XS à XXL — coupe {isTee ? (cut.includes("oversize") ? "oversize : prenez votre taille habituelle, le tombé est ample" : cut.includes("croptop") ? "crop top : coupe courte, prenez votre taille habituelle" : "classique : taille normalement") : "ample : prenez votre taille habituelle"}.</p>
                        <p>Guide détaillé (mensurations par taille) à compléter par la marque — voir <Link href="/guide-des-tailles" className="underline">le guide des tailles</Link>.</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </fieldset>

              <div className="hidden lg:block">
                <AddButton onClick={addToCart} label={`${product.preorder ? "Précommander" : "Ajouter au panier"} · ${formatPrice(priceShown!)}`} />
                <p className="text-xs text-white/45 mt-3">{product.preorder ? "Précommande : paiement aujourd'hui, expédition (ou retrait au stand Merch) dès la fin de production." : "Pièce réalisée à la demande (impression DTF / broderie). Livraison France, ou retrait au stand Merch du prochain événement."}</p>
              </div>
            </div>
          )}

          <div className="mt-10 border-t border-white/10 pt-6">
            <p className="t-label text-white/60 mb-3">Détails</p>
            <ul className="space-y-1.5 text-sm text-white/75">
              {product.details.map((d) => (
                <li key={d} className="flex gap-2"><span className="text-pink">✦</span>{d}</li>
              ))}
            </ul>
            {sibling && (
              <Link href={`/shop/${sibling.handle}`} className="mt-6 flex items-center justify-between border border-white/15 rounded-full px-5 py-3 hover:border-white transition-colors">
                <span className="text-sm">Ce visuel existe aussi en <b>{sibling.category === "hoodie" ? "sweat à capuche" : "t-shirt"}</b></span>
                <span className="text-sm tabular-nums text-white/70">{sibling.category === "hoodie" ? formatPrice(sibling.price) : `dès ${formatPrice(2500)}`}</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* CTA mobile sticky */}
      {!soon && (
        <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-black/85 backdrop-blur-xl border-t border-white/10 px-4 py-3 safe-bottom">
          <AddButton onClick={addToCart} label={`${product.preorder ? "Précommander" : "Ajouter"} · ${formatPrice(priceShown!)}`} />
        </div>
      )}

      {related.length > 0 && (
        <section className="mt-24 md:mt-32">
          <h2 className="t-display text-[clamp(32px,5vw,64px)] mb-8">Vous aimerez aussi</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-3 gap-y-8 md:gap-x-5">
            {related.slice(0, 4).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function AddButton({ onClick, label }: { onClick: () => void; label: string }) {
  const [pulse, setPulse] = useState(0);
  return (
    <motion.button
      onClick={() => {
        onClick();
        setPulse((p) => p + 1);
      }}
      key={pulse}
      initial={pulse ? { scale: 0.97 } : false}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 500, damping: 20 }}
      className="btn btn-brand w-full !py-4 text-[13px]"
    >
      {label}
    </motion.button>
  );
}
