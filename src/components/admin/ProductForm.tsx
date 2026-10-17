"use client";
import { useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { Product } from "@/lib/commerce/types";
import { useToast } from "@/components/ui/Toaster";
import { cn, formatPrice } from "@/lib/format";

const CATS: [Product["category"], string][] = [["tee", "T-shirt / débardeur"], ["hoodie", "Sweat / hoodie"], ["cap", "Casquette / bob"], ["tote", "Tote bag"], ["accessory", "Accessoire"]];
const STATUSES: [Product["status"], string, string][] = [
  ["active", "En vente", "Visible et achetable"],
  ["coming_soon", "Bientôt", "Visible, non achetable"],
  ["draft", "Brouillon", "Caché du site"],
  ["archived", "Archivé", "Caché, conservé"],
];
const PRESET_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "TU"];
const PRESET_COLORS = [
  { name: "Noir", hex: "#111114" },
  { name: "Blanc", hex: "#f4f3ef" },
  { name: "Gris", hex: "#b9bbc2" },
  { name: "Navy", hex: "#1f2a44" },
  { name: "Bleu", hex: "#37548f" },
  { name: "Framboise", hex: "#a9426b" },
  { name: "Rose", hex: "#d98aa8" },
];

/** Redimensionne une photo dans le navigateur (max 1600 px, WebP) avant l'envoi : rapide et léger. */
async function shrink(file: File): Promise<Blob> {
  if (!file.type.startsWith("image/") || file.type === "image/gif") return file;
  const bmp = await createImageBitmap(file).catch(() => null);
  if (!bmp) return file;
  const max = 1600;
  const k = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const c = document.createElement("canvas");
  c.width = Math.round(bmp.width * k);
  c.height = Math.round(bmp.height * k);
  c.getContext("2d")!.drawImage(bmp, 0, 0, c.width, c.height);
  const blob = await new Promise<Blob | null>((r) => c.toBlob(r, "image/webp", 0.86));
  return blob && blob.size < file.size ? blob : file;
}

export async function uploadFile(file: File, opts?: { private?: boolean; name?: string }) {
  const body = new FormData();
  const blob = await shrink(file);
  const name = opts?.name ?? (blob === file ? file.name : file.name.replace(/\.[a-z0-9]+$/i, "") + ".webp");
  body.append("file", new File([blob], name, { type: blob.type || file.type }));
  if (opts?.private) body.append("private", "1");
  const r = await fetch("/api/admin/upload", { method: "POST", body });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(d.error ?? "Envoi impossible");
  return d as { url: string; name: string; type: string; size: number };
}

type Collection = { handle: string; title: string };

export function ProductForm({ product, collections }: { product?: Product; collections: Collection[] }) {
  const isNew = !product;
  const editableShape = isNew || Boolean(product?.custom);
  const router = useRouter();
  const push = useToast((s) => s.push);
  const fileInput = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(0);
  const [drag, setDrag] = useState(false);
  const [f, setF] = useState({
    title: product?.title ?? "",
    subtitle: product?.subtitle ?? "",
    description: product?.description ?? "",
    category: product?.category ?? ("tee" as Product["category"]),
    collection: product?.collection ?? collections[0]?.handle ?? "smilers-dancers",
    status: product?.status ?? ("draft" as Product["status"]),
    featured: Boolean(product?.featured),
    preorder: Boolean(product?.preorder),
    price: product ? product.price.amount / 100 : 25,
    compareAt: product?.compareAtPrice ? product.compareAtPrice.amount / 100 : "",
    sizes: product?.sizes ?? ["S", "M", "L", "XL"],
    colors: product?.colors?.length ? product.colors : [PRESET_COLORS[0]],
    details: (product?.details ?? ["Made in France"]).join("\n"),
    tags: (product?.tags ?? []).join(", "),
    images: product?.images ?? ([] as Product["images"]),
    stock: "" as string,
  });
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((s) => ({ ...s, [k]: v }));
  const inp = "w-full bg-white/[.04] border border-white/15 rounded-[10px] px-3.5 py-3 text-[15px] outline-none focus:border-white/60 transition-colors";
  const lbl = "t-label text-white/55 block mb-2";

  async function addFiles(list: FileList | File[]) {
    const files = Array.from(list).filter((x) => x.type.startsWith("image/"));
    if (!files.length) return push("Choisis des images (JPG, PNG, WebP).", "error");
    setUploading((n) => n + files.length);
    for (const file of files) {
      try {
        const up = await uploadFile(file);
        setF((s) => ({ ...s, images: [...s.images, { src: up.url, alt: s.title || file.name.replace(/\.[a-z0-9]+$/i, ""), kind: "photo" }] }));
      } catch (e) {
        push((e as Error).message, "error");
      } finally {
        setUploading((n) => n - 1);
      }
    }
  }
  const moveImg = (i: number, d: -1 | 1) => setF((s) => {
    const a = [...s.images];
    const j = i + d;
    if (j < 0 || j >= a.length) return s;
    [a[i], a[j]] = [a[j], a[i]];
    return { ...s, images: a };
  });

  async function save() {
    if (!f.title.trim()) return push("Donne un nom au produit.", "error");
    setSaving(true);
    const payload = {
      ...f,
      price: Math.round(Number(f.price) * 100),
      compareAt: f.compareAt === "" ? null : Math.round(Number(f.compareAt) * 100),
      details: f.details.split("\n").map((x) => x.trim()).filter(Boolean),
      tags: f.tags.split(",").map((x) => x.trim()).filter(Boolean),
      stock: f.stock === "" ? null : Number(f.stock),
    };
    const r = await fetch(isNew ? "/api/admin/products" : `/api/admin/products/${product!.id}`, { method: isNew ? "POST" : "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const d = await r.json().catch(() => ({}));
    setSaving(false);
    if (!r.ok) return push(d.error ?? "Enregistrement impossible.", "error");
    push(isNew ? "Produit créé." : "Produit enregistré.");
    if (isNew) router.push(`/admin/products/${d.product.id}`);
    router.refresh();
  }

  async function remove() {
    if (!product) return;
    if (!window.confirm(`Supprimer « ${product.title} » du shop ? Cette action est définitive.`)) return;
    const r = await fetch(`/api/admin/products/${product.id}`, { method: "DELETE" });
    if (!r.ok) return push("Suppression impossible.", "error");
    push("Produit supprimé.");
    router.push("/admin/products");
    router.refresh();
  }

  const variantsCount = (f.sizes.length || 1) * (f.colors.length || 1);

  return (
    <div className="grid xl:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)] gap-5 items-start">
      <div className="space-y-5">
        {/* Photos */}
        <section className="border border-white/10 rounded-[16px] p-5 bg-white/[0.02]">
          <div className="flex items-center justify-between mb-3">
            <p className="t-label text-white/55">Photos</p>
            <p className="text-xs text-white/40">La 1re photo sert de couverture</p>
          </div>
          <div
            onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
            onDragLeave={() => setDrag(false)}
            onDrop={(e) => { e.preventDefault(); setDrag(false); addFiles(e.dataTransfer.files); }}
            className={cn("grid grid-cols-3 sm:grid-cols-4 gap-3 rounded-[12px] transition-colors", drag && "bg-pink/10 outline outline-2 outline-dashed outline-pink/60")}
          >
            {f.images.map((im, i) => (
              <div key={im.src + i} className="group relative aspect-[4/5] rounded-[10px] overflow-hidden bg-ink-2 border border-white/10">
                <Image src={im.src} alt={im.alt} fill sizes="200px" className="object-cover" />
                {i === 0 && <span className="absolute top-2 left-2 t-label text-[9px] bg-white text-black px-2 py-1 rounded-full">Couverture</span>}
                <div className="absolute inset-x-0 bottom-0 p-1.5 flex gap-1 justify-center bg-gradient-to-t from-black/80 to-transparent pt-6">
                  <button type="button" onClick={() => moveImg(i, -1)} disabled={i === 0} aria-label="Déplacer à gauche" className="w-8 h-8 rounded-full bg-black/70 border border-white/20 text-sm disabled:opacity-30">‹</button>
                  <button type="button" onClick={() => moveImg(i, 1)} disabled={i === f.images.length - 1} aria-label="Déplacer à droite" className="w-8 h-8 rounded-full bg-black/70 border border-white/20 text-sm disabled:opacity-30">›</button>
                  <button type="button" onClick={() => set("images", f.images.filter((_, j) => j !== i))} aria-label="Retirer la photo" className="w-8 h-8 rounded-full bg-pink/90 text-white text-sm">✕</button>
                </div>
              </div>
            ))}
            {Array.from({ length: uploading }).map((_, i) => (
              <div key={`u${i}`} className="aspect-[4/5] rounded-[10px] border border-white/10 bg-white/[.03] grid place-items-center">
                <span className="w-6 h-6 rounded-full border-2 border-white/25 border-t-white animate-spin" />
              </div>
            ))}
            <button type="button" onClick={() => fileInput.current?.click()} className="aspect-[4/5] rounded-[10px] border-2 border-dashed border-white/20 hover:border-white/50 grid place-items-center text-center p-3 transition-colors">
              <span>
                <span className="block text-3xl leading-none text-white/70">+</span>
                <span className="block text-xs text-white/55 mt-2">Ajouter des photos</span>
                <span className="block text-[10px] text-white/35 mt-1 hidden sm:block">ou glisser-déposer</span>
              </span>
            </button>
          </div>
          <input ref={fileInput} type="file" accept="image/*" multiple hidden onChange={(e) => { if (e.target.files) addFiles(e.target.files); e.target.value = ""; }} />
          {f.images.length > 0 && (
            <details className="mt-4">
              <summary className="text-xs text-white/55 cursor-pointer">Textes alternatifs (accessibilité, référencement)</summary>
              <div className="mt-3 space-y-2">
                {f.images.map((im, i) => (
                  <input key={i} className={cn(inp, "!py-2 text-sm")} value={im.alt} placeholder={`Photo ${i + 1}`} onChange={(e) => set("images", f.images.map((x, j) => (j === i ? { ...x, alt: e.target.value } : x)))} />
                ))}
              </div>
            </details>
          )}
        </section>

        {/* Infos */}
        <section className="border border-white/10 rounded-[16px] p-5 bg-white/[0.02] space-y-4">
          <div><label className={lbl}>Nom du produit *</label><input className={inp} value={f.title} onChange={(e) => set("title", e.target.value)} placeholder="Ex. Groovers" /></div>
          <div><label className={lbl}>Sous-titre</label><input className={inp} value={f.subtitle} onChange={(e) => set("subtitle", e.target.value)} placeholder="Ex. T-shirt · Never miss the drop" /></div>
          <div><label className={lbl}>Description</label><textarea rows={5} className={inp} value={f.description} onChange={(e) => set("description", e.target.value)} placeholder="Ce qui rend la pièce unique : visuel, matière, coupe…" /></div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={lbl}>Catégorie</label>
              <select disabled={!editableShape} className={cn(inp, "disabled:opacity-50")} value={f.category} onChange={(e) => set("category", e.target.value as Product["category"])}>
                {CATS.map(([v, l]) => <option key={v} value={v} className="bg-black">{l}</option>)}
              </select>
            </div>
            <div>
              <label className={lbl}>Collection</label>
              <select disabled={!editableShape} className={cn(inp, "disabled:opacity-50")} value={f.collection} onChange={(e) => set("collection", e.target.value)}>
                {collections.map((c) => <option key={c.handle} value={c.handle} className="bg-black">{c.title}</option>)}
              </select>
            </div>
          </div>
          <div><label className={lbl}>Détails (une ligne = un point)</label><textarea rows={4} className={inp} value={f.details} onChange={(e) => set("details", e.target.value)} placeholder={"100 % coton bio\nImpression DTF\nMade in France"} /></div>
          <div><label className={lbl}>Mots-clés (séparés par des virgules)</label><input className={inp} value={f.tags} onChange={(e) => set("tags", e.target.value)} placeholder="tee, 2026, disco" /></div>
        </section>

        {/* Variantes */}
        <section className={cn("border border-white/10 rounded-[16px] p-5 bg-white/[0.02] space-y-5", !editableShape && "opacity-60")}>
          <div className="flex items-center justify-between gap-3">
            <p className="t-label text-white/55">Tailles et couleurs</p>
            {editableShape ? <p className="text-xs text-white/45">{variantsCount} variante{variantsCount > 1 ? "s" : ""}</p> : <p className="text-xs text-white/45">Fixées par la collection d'origine</p>}
          </div>
          <div>
            <p className="text-xs text-white/50 mb-2">Tailles</p>
            <div className="flex flex-wrap gap-2">
              {PRESET_SIZES.map((s) => {
                const on = f.sizes.includes(s);
                return (
                  <button key={s} type="button" disabled={!editableShape} onClick={() => set("sizes", on ? f.sizes.filter((x) => x !== s) : [...f.sizes, s].sort((a, b) => PRESET_SIZES.indexOf(a) - PRESET_SIZES.indexOf(b)))} className={cn("min-w-12 h-11 px-3 rounded-full text-sm font-semibold border transition-colors", on ? "bg-white text-black border-white" : "border-white/20 text-white/75")}>
                    {s}
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <p className="text-xs text-white/50 mb-2">Couleurs</p>
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map((c) => {
                const on = f.colors.some((x) => x.name === c.name);
                return (
                  <button key={c.name} type="button" disabled={!editableShape} onClick={() => set("colors", on ? f.colors.filter((x) => x.name !== c.name) : [...f.colors, c])} className={cn("flex items-center gap-2 h-11 pl-2 pr-3.5 rounded-full text-sm border transition-colors", on ? "border-white bg-white/10" : "border-white/15 text-white/70")}>
                    <span className="w-7 h-7 rounded-full border border-white/25" style={{ background: c.hex }} />
                    {c.name}
                  </button>
                );
              })}
            </div>
          </div>
          {isNew && (
            <div className="max-w-xs">
              <label className={lbl}>Stock par variante</label>
              <input type="number" min={0} className={inp} value={f.stock} onChange={(e) => set("stock", e.target.value)} placeholder="Vide = à la demande" />
            </div>
          )}
        </section>
      </div>

      {/* Colonne de droite : prix, statut, actions */}
      <aside className="space-y-5 xl:sticky xl:top-6">
        <section className="border border-white/10 rounded-[16px] p-5 bg-white/[0.02] space-y-4">
          <p className="t-label text-white/55">Prix</p>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs text-white/50 block mb-2">Prix de vente (€)</label><input type="number" step="0.5" min={0} className={inp} value={f.price} onChange={(e) => set("price", Number(e.target.value))} /></div>
            <div><label className="text-xs text-white/50 block mb-2">Prix barré (€)</label><input type="number" step="0.5" min={0} className={inp} value={f.compareAt} onChange={(e) => set("compareAt", e.target.value as never)} placeholder="facultatif" /></div>
          </div>
          {!editableShape && product?.category === "tee" && <p className="text-xs text-white/45">Les t-shirts de la collection gardent la grille officielle par coupe ({formatPrice(2500)} à {formatPrice(3500)}). Ce prix sert d'affichage « dès ».</p>}
        </section>

        <section className="border border-white/10 rounded-[16px] p-5 bg-white/[0.02] space-y-3">
          <p className="t-label text-white/55">Visibilité</p>
          <div className="grid grid-cols-2 gap-2">
            {STATUSES.map(([v, l, h]) => (
              <button key={v} type="button" onClick={() => set("status", v)} className={cn("text-left rounded-[12px] border p-3 transition-colors", f.status === v ? "border-white bg-white/10" : "border-white/12 text-white/70")}>
                <span className="block text-sm font-semibold">{l}</span>
                <span className="block text-[11px] text-white/50 mt-0.5 leading-snug">{h}</span>
              </button>
            ))}
          </div>
          <label className="flex items-start gap-3 text-sm pt-1"><input type="checkbox" checked={f.preorder} onChange={(e) => set("preorder", e.target.checked)} /> <span>Précommande<span className="block text-xs text-white/45">Payée aujourd'hui, expédiée après production</span></span></label>
          <label className="flex items-start gap-3 text-sm"><input type="checkbox" checked={f.featured} onChange={(e) => set("featured", e.target.checked)} /> <span>Mis en avant sur l'accueil</span></label>
        </section>

        <div className="flex flex-col gap-2">
          <button onClick={save} disabled={saving || uploading > 0} className="btn btn-brand w-full !py-4">{saving ? "Enregistrement…" : uploading ? "Envoi des photos…" : isNew ? "Créer le produit" : "Enregistrer"}</button>
          {!isNew && <button onClick={remove} className="btn btn-ghost w-full !py-3.5 !text-pink !border-pink/40">Supprimer le produit</button>}
        </div>
        {product && <p className="text-[11px] text-white/40 leading-relaxed">Provenance : {product.provenance}</p>}
      </aside>
    </div>
  );
}
