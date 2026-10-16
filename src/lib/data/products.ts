import type { Collection, Product, Variant, Money } from "@/lib/commerce/types";

/**
 * CATALOGUE SMILIN' DANCIN' — « SMILERS & DANCERS COLLECTION » (2024-2025)
 * ---------------------------------------------------------------------------
 * Source unique : post Instagram officiel du 1er octobre 2025
 *   https://www.instagram.com/p/DPQrKZSiOKL/  (« On vous dévoile enfin la collection 2024-2025 de
 *   notre merch ✨ Tout est là : modèles, articles, coloris, tarifs… Pour commander ➡️ glissez en DM ! »)
 * + highlight Instagram « Merch' » (photos portées, casquettes / bandanas / bobs, drops 2026).
 *
 * Données RÉELLES reprises telles quelles (slide « TARIFS ») :
 *   - Tailles : XS · S · M · L · XL · XXL — Made in France
 *   - Visuel devant en petit / DTF : T-shirt classic Homme 25 € · T-shirt oversize Homme 30 € ·
 *     Débardeur Homme 30 € · T-shirt classic Femme 25 € · Crop top Femme 25 € · Débardeur Femme 30 €
 *   - Visuel derrière en grand / DTF : classic H 30 € · oversize H 35 € · débardeur H 35 € ·
 *     classic F 30 € · crop top F 30 € · débardeur F 30 €
 *   - Sweat à capuche (visuel cœur + manche / broderie) : 1 Disco Ball 80 € · 2 Feet on the ground 80 € ·
 *     3 Smilin' Dancin' (centré devant uniquement) 60 € · 4 We push the sky 90 € · 5 Together 80 € ·
 *     6 Smil' Lov' Danc' Mov' Dream' Jump' IN 70 € · 7 Electronic Music Events & Clothing 80 € ·
 *     8 Music is my power 80 € · 9 Más música por favor 80 €
 *   - Coloris : tees/débardeurs/crop → Noir, Blanc · Sweats → Noir, Blanc, Gris
 *
 * Ce qui n'est PAS public (donc non inventé) : stocks (commande en DM = à la demande → stock null),
 * prix des drops 2026 « Groovers » / « The Real VIP » (précommande au festival) et des
 * casquettes / bandanas / bobs (« stock limité ») → status "coming_soon", prix 0 = « tarif à confirmer ».
 * ---------------------------------------------------------------------------
 */

const eur = (amount: number): Money => ({ amount, currency: "EUR" });
export const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

/** Coupes officielles et tarifs (centimes) — slide TARIFS. */
export const CUTS = [
  { id: "classic-h", label: "T-shirt classic", gender: "Homme", front: 2500, back: 3000 },
  { id: "oversize-h", label: "T-shirt oversize", gender: "Homme", front: 3000, back: 3500 },
  { id: "debardeur-h", label: "Débardeur", gender: "Homme", front: 3000, back: 3500 },
  { id: "classic-f", label: "T-shirt classic", gender: "Femme", front: 2500, back: 3000 },
  { id: "croptop-f", label: "Crop top", gender: "Femme", front: 2500, back: 3000 },
  { id: "debardeur-f", label: "Débardeur", gender: "Femme", front: 3000, back: 3000 },
] as const;
export type CutId = (typeof CUTS)[number]["id"];

export const PRINTS = [
  { id: "front", label: "Visuel devant en petit", description: "Impression DTF, petit visuel cœur" },
  { id: "back", label: "Visuel derrière en grand", description: "Impression DTF, grand visuel dos + petit logo devant" },
] as const;
export type PrintId = (typeof PRINTS)[number]["id"];

export const TEE_COLORS = [
  { name: "Noir", hex: "#111114" },
  { name: "Blanc", hex: "#f4f3ef" },
];
export const HOODIE_COLORS = [
  { name: "Noir", hex: "#111114" },
  { name: "Blanc", hex: "#f4f3ef" },
  { name: "Gris", hex: "#b9b9bd" },
];

export function slug(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

/** Prix réel d'une ligne tee selon coupe + impression. */
export function teePrice(cutId: CutId, print: PrintId): number {
  const cut = CUTS.find((c) => c.id === cutId)!;
  return print === "back" ? cut.back : cut.front;
}

/** Variantes tee : coupe × impression × couleur × taille — chaque combinaison a son prix réel. */
function teeVariants(pid: string): Variant[] {
  const out: Variant[] = [];
  for (const cut of CUTS) {
    for (const print of PRINTS) {
      for (const c of TEE_COLORS) {
        for (const s of SIZES) {
          out.push({
            id: `${pid}--${cut.id}--${print.id}--${slug(c.name)}--${slug(s)}`,
            sku: `SD-${pid.toUpperCase()}-${cut.id.toUpperCase()}-${print.id.toUpperCase()}-${slug(c.name).toUpperCase()}-${s}`,
            title: `${cut.label} ${cut.gender} · ${print.id === "back" ? "Dos grand" : "Devant petit"} · ${c.name} · ${s}`,
            options: [
              { name: "Couleur", value: c.name },
              { name: "Taille", value: s },
            ],
            price: eur(teePrice(cut.id, print.id)),
            compareAtPrice: null,
            available: true,
            stock: null, // à la demande (commande en DM), la marque peut saisir un stock dans l'admin
          });
        }
      }
    }
  }
  return out;
}

function hoodieVariants(pid: string, price: number): Variant[] {
  const out: Variant[] = [];
  for (const c of HOODIE_COLORS) {
    for (const s of SIZES) {
      out.push({
        id: `${pid}--hoodie--${slug(c.name)}--${slug(s)}`,
        sku: `SD-${pid.toUpperCase()}-HOODIE-${slug(c.name).toUpperCase()}-${s}`,
        title: `Sweat à capuche · ${c.name} · ${s}`,
        options: [
          { name: "Couleur", value: c.name },
          { name: "Taille", value: s },
        ],
        price: eur(price),
        compareAtPrice: null,
        available: true,
        stock: null,
      });
    }
  }
  return out;
}

type Visual = {
  n: number;
  id: string;
  handle: string;
  title: string;
  subtitle: string;
  description: string;
  hoodiePrice: number;
  hoodieNote?: string;
  tile: string;
  photos: Product["images"];
  featured?: boolean;
  tags: string[];
};

export const VISUALS: Visual[] = [
  {
    n: 1,
    id: "disco-ball",
    handle: "disco-ball",
    title: "Disco Ball",
    subtitle: "Le globe grillagé · Feel Better With Music",
    description:
      "L'emblème Smilin' Dancin' : le globe grillagé, l'anneau « Feel Better With Music », le wordmark en haut et en bas. Bleu et framboise, brodé sur le cœur et la manche du sweat, imprimé DTF sur les tees.",
    hoodiePrice: 8000,
    tile: "/merch/visuels/01-disco-ball.jpg",
    photos: [
      { src: "/merch/photos/disco-ball-hoodie-black.jpg", alt: "Sweat Disco Ball noir brodé, porté au sommet", kind: "worn", view: "worn" },
      { src: "/merch/photos/disco-ball-hoodie-black-detail.jpg", alt: "Détail broderie Disco Ball", kind: "worn", view: "detail" },
      { src: "/merch/visuels/01-disco-ball.jpg", alt: "Visuel n°1 Disco Ball", kind: "photo", view: "front" },
    ],
    featured: true,
    tags: ["globe", "emblème", "broderie"],
  },
  {
    n: 2,
    id: "feet-on-the-ground",
    handle: "feet-on-the-ground",
    title: "Feet On The Ground",
    subtitle: "To dance · Spirit in the clouds to dream",
    description:
      "« Feet on the ground to dance, spirit in the clouds to dream. » La fille au bob qui souffle des boules à facettes. Rose, bleu, noir : le visuel le plus porté de la collection.",
    hoodiePrice: 8000,
    tile: "/merch/visuels/02-feet-on-the-ground.jpg",
    photos: [
      { src: "/merch/photos/feet-on-the-ground-croptop-white.jpg", alt: "Crop top blanc Feet On The Ground, grand visuel dos, lac d'Annecy", kind: "worn", view: "worn" },
      { src: "/merch/photos/hoodies-duo-feet-music.jpg", alt: "Sweats blanc et gris portés au bord du lac", kind: "worn", view: "worn" },
      { src: "/merch/visuels/02-feet-on-the-ground.jpg", alt: "Visuel n°2 Feet On The Ground", kind: "photo", view: "front" },
    ],
    featured: true,
    tags: ["bob", "disco", "rêve"],
  },
  {
    n: 3,
    id: "wordmark",
    handle: "smilin-dancin-wordmark",
    title: "Smilin' Dancin'",
    subtitle: "Le wordmark · centré devant",
    description: "Le logo, rien que le logo. Italique, bleu et framboise, centré devant. Sur le sweat : centré devant uniquement, 60 €.",
    hoodiePrice: 6000,
    hoodieNote: "Centré devant uniquement",
    tile: "/merch/visuels/03-wordmark.jpg",
    photos: [
      { src: "/merch/photos/hoodie-black-sleeve-wordmark.jpg", alt: "Wordmark brodé sur la manche du sweat noir", kind: "worn", view: "detail" },
      { src: "/merch/photos/music-is-my-power-tee-front.jpg", alt: "Petit wordmark cœur sur tee noir", kind: "worn", view: "front" },
      { src: "/merch/visuels/03-wordmark.jpg", alt: "Visuel n°3 Wordmark", kind: "photo", view: "front" },
    ],
    tags: ["logo", "wordmark"],
  },
  {
    n: 4,
    id: "we-push-the-sky",
    handle: "we-push-the-sky",
    title: "We Push The Sky",
    subtitle: "La boule à facettes au bout des bras",
    description:
      "Une silhouette qui pousse une boule à facettes vers un ciel rayé rose et bleu. Le visuel signature des sweats, brodé cœur + manche, 90 €.",
    hoodiePrice: 9000,
    tile: "/merch/visuels/04-we-push-the-sky.jpg",
    photos: [
      { src: "/merch/photos/we-push-the-sky-hoodie-black.jpg", alt: "Sweat noir We Push The Sky brodé", kind: "worn", view: "worn" },
      { src: "/merch/photos/we-push-the-sky-hoodie-dog.jpg", alt: "Sweat We Push The Sky, assise dans l'herbe avec un golden", kind: "worn", view: "worn" },
      { src: "/merch/visuels/04-we-push-the-sky.jpg", alt: "Visuel n°4 We Push The Sky", kind: "photo", view: "front" },
    ],
    featured: true,
    tags: ["ciel", "disco", "broderie"],
  },
  {
    n: 5,
    id: "together",
    handle: "together",
    title: "Together",
    subtitle: "Dance · Danser · Bailar · Tanzen · Ballare · 跳舞",
    description: "Deux silhouettes devant une enceinte, et le mot « danser » dans toutes les langues en fanions roses et bleus. Together.",
    hoodiePrice: 8000,
    tile: "/merch/visuels/05-together.jpg",
    photos: [
      { src: "/merch/photos/together-tee-white-cap-pink.jpg", alt: "T-shirt oversize blanc Together, grand visuel dos, casquette rose", kind: "worn", view: "worn" },
      { src: "/merch/visuels/05-together.jpg", alt: "Visuel n°5 Together", kind: "photo", view: "front" },
    ],
    featured: true,
    tags: ["enceinte", "danse", "together"],
  },
  {
    n: 6,
    id: "in",
    handle: "in",
    title: "IN",
    subtitle: "Smil · Lov · Danc · Mov · Dream · Jump",
    description: "SMILIN, LOVIN, DANCIN, MOVIN, DREAMIN, JUMPIN. Le manifeste typographique, bleu et framboise. Sur le sweat : 70 €.",
    hoodiePrice: 7000,
    tile: "/merch/visuels/06-in.jpg",
    photos: [
      { src: "/merch/photos/in-tee-white-palm-beach.jpg", alt: "T-shirt blanc IN, grand visuel dos, Palm Beach", kind: "worn", view: "worn" },
      { src: "/merch/visuels/06-in.jpg", alt: "Visuel n°6 IN", kind: "photo", view: "front" },
    ],
    tags: ["typo", "manifeste"],
  },
  {
    n: 7,
    id: "events-clothing",
    handle: "electronic-music-events-clothing",
    title: "Electronic Music Events & Clothing",
    subtitle: "Le badge circulaire autour du globe",
    description: "Ce que fait Smilin' Dancin', en un badge : Electronic Music Events & Clothing autour du globe et du wordmark. Pervenche et prune.",
    hoodiePrice: 8000,
    tile: "/merch/visuels/07-electronic-music-events-clothing.jpg",
    photos: [
      { src: "/merch/photos/events-clothing-tee-back.jpg", alt: "T-shirt noir Events & Clothing, grand visuel dos", kind: "worn", view: "worn" },
      { src: "/merch/photos/hoodies-trio-lake.jpg", alt: "Sweats gris, blanc et noir au bord du lac", kind: "worn", view: "worn" },
      { src: "/merch/visuels/07-electronic-music-events-clothing.jpg", alt: "Visuel n°7 Electronic Music Events & Clothing", kind: "photo", view: "front" },
    ],
    featured: true,
    tags: ["badge", "globe"],
  },
  {
    n: 8,
    id: "music-is-my-power",
    handle: "music-is-my-power",
    title: "Music Is My Power",
    subtitle: "L'haltère-vinyle",
    description: "Un poing qui soulève un haltère fait de vinyles, les notes qui s'envolent. Music is my power : le visuel le plus vu sur les plages.",
    hoodiePrice: 8000,
    tile: "/merch/visuels/08-music-is-my-power.jpg",
    photos: [
      { src: "/merch/photos/music-is-my-power-tee-back.jpg", alt: "T-shirt noir Music Is My Power, grand visuel dos, plage", kind: "worn", view: "back" },
      { src: "/merch/photos/music-is-my-power-tee-front.jpg", alt: "T-shirt noir, petit wordmark cœur", kind: "worn", view: "front" },
      { src: "/merch/photos/music-is-my-power-tee-front-2.jpg", alt: "T-shirt noir porté, plage", kind: "worn", view: "worn" },
      { src: "/merch/photos/music-is-my-power-tee-back-walk.jpg", alt: "T-shirt noir, visuel dos, marche sur la plage", kind: "worn", view: "worn" },
      { src: "/merch/visuels/08-music-is-my-power.jpg", alt: "Visuel n°8 Music Is My Power", kind: "photo", view: "front" },
    ],
    featured: true,
    tags: ["vinyle", "power"],
  },
  {
    n: 9,
    id: "mas-musica",
    handle: "mas-musica-por-favor",
    title: "Más Música Por Favor",
    subtitle: "Le patch bleu",
    description: "Más música por favor. Un patch bleu, lettres blanches et framboise, posé sur la manche du sweat ou le cœur du tee.",
    hoodiePrice: 8000,
    tile: "/merch/visuels/09-mas-musica-por-favor.jpg",
    photos: [
      { src: "/merch/photos/mas-musica-hoodie-white-sleeve.jpg", alt: "Sweat blanc, patch Más Música sur la manche", kind: "worn", view: "detail" },
      { src: "/merch/visuels/09-mas-musica-por-favor.jpg", alt: "Visuel n°9 Más Música Por Favor", kind: "photo", view: "front" },
    ],
    tags: ["patch", "español"],
  },
];

/** Met en premier les photos qui montrent le bon type de pièce (tee vs sweat). */
function orderPhotos(photos: Product["images"], kind: "tee" | "hoodie"): Product["images"] {
  const isHoodie = (im: Product["images"][number]) => /sweat|hoodie|manche/i.test(im.alt);
  const isTee = (im: Product["images"][number]) => /t-shirt|crop top|tee|débardeur/i.test(im.alt);
  const score = (im: Product["images"][number]) => (kind === "hoodie" ? (isHoodie(im) ? 0 : isTee(im) ? 2 : 1) : isTee(im) ? 0 : isHoodie(im) ? 2 : 1);
  return [...photos].sort((a, b) => score(a) - score(b));
}

const PROVENANCE = "Instagram @smilin.dancin, post DPQrKZSiOKL (collection 2024-2025, tarifs) + highlight « Merch' »";

const collectionProducts: Product[] = [];

for (const v of VISUALS) {
  collectionProducts.push({
    id: `tee-${v.id}`,
    handle: `tee-${v.handle}`,
    title: v.title,
    subtitle: `T-shirt · ${v.subtitle}`,
    description: v.description,
    details: [
      "Impression DTF, visuel devant en petit, ou derrière en grand (+ petit logo devant)",
      "Coupes : T-shirt classic, oversize, débardeur (Homme) · T-shirt classic, crop top, débardeur (Femme)",
      "Coloris : Noir · Blanc",
      "Tailles : XS à XXL",
      "Made in France",
    ],
    category: "tee",
    collection: "smilers-dancers",
    tags: ["tee", `visuel-${v.n}`, ...v.tags],
    images: orderPhotos(v.photos, "tee"),
    colors: TEE_COLORS,
    sizes: SIZES,
    variants: teeVariants(`tee-${v.id}`),
    price: eur(2500),
    status: "active",
    featured: ["feet-on-the-ground", "together", "events-clothing", "music-is-my-power", "in"].includes(v.id),
    demo: false,
    provenance: PROVENANCE,
    createdAt: "2025-10-01",
  });
  collectionProducts.push({
    id: `hoodie-${v.id}`,
    handle: `sweat-${v.handle}`,
    title: v.title,
    subtitle: `Sweat à capuche · ${v.subtitle}`,
    description: v.description,
    details: [
      v.hoodieNote ? `Broderie, ${v.hoodieNote.toLowerCase()}` : "Broderie, visuel cœur + manche",
      "Coloris : Noir · Blanc · Gris",
      "Tailles : XS à XXL",
      "Made in France",
    ],
    category: "hoodie",
    collection: "smilers-dancers",
    tags: ["hoodie", "sweat", `visuel-${v.n}`, ...v.tags],
    images: orderPhotos(v.photos, "hoodie"),
    colors: HOODIE_COLORS,
    sizes: SIZES,
    variants: hoodieVariants(`hoodie-${v.id}`, v.hoodiePrice),
    price: eur(v.hoodiePrice),
    status: "active",
    featured: ["disco-ball", "we-push-the-sky", "mas-musica"].includes(v.id),
    demo: false,
    provenance: PROVENANCE,
    createdAt: "2025-10-01",
  });
}

/** DROPS 2026 — annoncés dans le highlight Merch' (« Infos merch : deux nouveaux visuels ») */
const DROPS_2026: Product[] = [
  {
    id: "tee-groovers",
    handle: "tee-groovers-never-miss-the-drop",
    title: "Groovers",
    subtitle: "Never miss the drop · nouveau visuel 2026",
    description:
      "Le ghetto-blaster Groovers. Nouveau visuel de la collection, vu au Mexico Show en crop top noir et en débardeur blanc. T-shirts sur précommande sur le festival.",
    details: ["Nouveau visuel 2026", "Vu en crop top noir et débardeur blanc", "T-shirts sur précommande sur le festival", "Précommande, tarif aligné sur la grille officielle de la collection, à confirmer par la marque", "Expédition ou retrait au stand dès production"],
    category: "tee",
    collection: "drops-2026",
    tags: ["tee", "2026", "groovers", "nouveau"],
    images: [
      { src: "/merch/photos/groovers-campaign-tee-black.jpg", alt: "T-shirt crop noir Groovers, campagne 2026", kind: "worn", view: "front" },
      { src: "/merch/photos/campagne-2026.jpg", alt: "Campagne 2026, Groovers & The Real VIP", kind: "worn", view: "worn" },
    ],
    colors: TEE_COLORS,
    sizes: SIZES,
    variants: teeVariants("tee-groovers"),
    price: eur(2500),
    status: "active",
    preorder: true,
    featured: true,
    demo: false,
    provenance: "Instagram @smilin.dancin, highlight « Merch' », story « Infos merch »",
    createdAt: "2026-09-01",
  },
  {
    id: "tee-real-vip",
    handle: "tee-the-real-vip-is-on-the-dancefloor",
    title: "The Real VIP",
    subtitle: "Is on the dancefloor · nouveau visuel 2026",
    description:
      "Le badge VIP au bout de son ruban bleu et rose : « The real VIP is on the dancefloor ». Grand visuel dos sur tee blanc. Nouvelle co', précommande sur le festival.",
    details: ["Nouveau visuel 2026", "Vu en t-shirt blanc, grand visuel dos", "T-shirts sur précommande sur le festival", "Précommande, tarif aligné sur la grille officielle de la collection, à confirmer par la marque", "Expédition ou retrait au stand dès production"],
    category: "tee",
    collection: "drops-2026",
    tags: ["tee", "2026", "vip", "nouveau"],
    images: [
      { src: "/merch/photos/real-vip-campaign-back.jpg", alt: "T-shirt blanc The Real VIP, grand visuel dos", kind: "worn", view: "back" },
      { src: "/merch/photos/campagne-2026.jpg", alt: "Campagne 2026, Groovers & The Real VIP", kind: "worn", view: "worn" },
    ],
    colors: TEE_COLORS,
    sizes: SIZES,
    variants: teeVariants("tee-real-vip"),
    price: eur(2500),
    status: "active",
    preorder: true,
    featured: true,
    demo: false,
    provenance: "Instagram @smilin.dancin, highlight « Merch' », story « Infos merch »",
    createdAt: "2026-09-01",
  },
];

/** ACCESSOIRES — casquettes, bandanas, bobs (stock limité, tarifs non publiés) */
const ACCESSORIES: Product[] = [
  {
    id: "bob-wordmark",
    handle: "bob-smilin-dancin",
    title: "Bob Smilin' Dancin'",
    subtitle: "Noir · wordmark brodé bleu & rose",
    description: "Le bob noir, wordmark brodé bleu et framboise. Stock limité, tarif à confirmer.",
    details: ["Broderie wordmark", "Stock limité", "Tarif à confirmer par la marque"],
    category: "accessory",
    collection: "accessoires",
    tags: ["bob", "bucket", "accessoire"],
    images: [
      { src: "/merch/photos/bob-black-wordmark.jpg", alt: "Bob noir Smilin' Dancin' au bord de la piscine", kind: "photo", view: "front" },
      { src: "/merch/photos/bobs-annecy.jpg", alt: "Bobs noirs portés à Annecy", kind: "worn", view: "worn" },
    ],
    colors: [{ name: "Noir", hex: "#111114" }],
    sizes: ["Unique"],
    variants: [],
    price: eur(0),
    status: "coming_soon",
    demo: false,
    provenance: "Instagram @smilin.dancin, highlight « Merch' » (« Casquettes, bandanas, bobs, stock limité »)",
    createdAt: "2026-06-01",
  },
  {
    id: "cap-wordmark",
    handle: "casquette-smilin-dancin",
    title: "Casquette Smilin' Dancin'",
    subtitle: "Wordmark brodé · navy, grise, rose délavée",
    description: "La casquette wordmark, vue en navy, en gris et en rose délavé. Stock limité, tarif à confirmer.",
    details: ["Broderie wordmark", "Coloris vus : navy, gris, rose délavé", "Stock limité", "Tarif à confirmer par la marque"],
    category: "accessory",
    collection: "accessoires",
    tags: ["casquette", "cap", "accessoire"],
    images: [
      { src: "/merch/photos/cap-navy-palms.jpg", alt: "Casquette navy sous les palmiers", kind: "worn", view: "worn" },
      { src: "/merch/photos/cap-grey-sunset.jpg", alt: "Casquette grise au sommet", kind: "worn", view: "worn" },
      { src: "/merch/photos/together-tee-white-cap-pink.jpg", alt: "Casquette rose délavée", kind: "worn", view: "worn" },
    ],
    colors: [
      { name: "Navy", hex: "#1f2a44" },
      { name: "Gris", hex: "#b9b9bd" },
      { name: "Rose délavé", hex: "#c97a94" },
    ],
    sizes: ["Unique"],
    variants: [],
    price: eur(0),
    status: "coming_soon",
    demo: false,
    provenance: "Instagram @smilin.dancin, highlight « Merch' »",
    createdAt: "2026-06-01",
  },
  {
    id: "bandana-allover",
    handle: "bandana-smilin-dancin",
    title: "Bandana Smilin' Dancin'",
    subtitle: "Allover wordmark · rose & bleu",
    description: "Le bandana allover, wordmark répété en bleu sur fond framboise. Stock limité, tarif à confirmer.",
    details: ["Motif allover wordmark", "Stock limité", "Tarif à confirmer par la marque"],
    category: "accessory",
    collection: "accessoires",
    tags: ["bandana", "accessoire"],
    images: [
      { src: "/merch/photos/bandana-lake.jpg", alt: "Bandanas portés au bord du lac", kind: "worn", view: "worn" },
      { src: "/merch/photos/bandana-duo.jpg", alt: "Bandana allover rose et bleu", kind: "worn", view: "worn" },
      { src: "/merch/photos/bandana-dog.jpg", alt: "Bandana sur un golden retriever", kind: "worn", view: "worn" },
    ],
    colors: [{ name: "Framboise", hex: "#a9426b" }],
    sizes: ["Unique"],
    variants: [],
    price: eur(0),
    status: "coming_soon",
    demo: false,
    provenance: "Instagram @smilin.dancin, highlight « Merch' »",
    createdAt: "2026-06-01",
  },
];

export const PRODUCTS: Product[] = [...DROPS_2026, ...collectionProducts, ...ACCESSORIES];

export const COLLECTIONS: Collection[] = [
  {
    id: "smilers-dancers",
    handle: "smilers-dancers",
    title: "Smilers & Dancers",
    tagline: "9 visuels au choix · T-shirts & sweats",
    description:
      "La collection 2024-2025 : 9 visuels, 6 coupes de tee (classic, oversize, débardeur, crop top), sweats à capuche brodés. Made in France, XS à XXL.",
    image: "/merch/photos/we-push-the-sky-hoodie-black.jpg",
    productHandles: collectionProducts.map((p) => p.handle),
  },
  {
    id: "drops-2026",
    handle: "drops-2026",
    title: "Nouvelle Co' 2026",
    tagline: "Groovers · The Real VIP",
    description: "Deux nouveaux visuels dévoilés au Mexico Show : Groovers (never miss the drop) et The Real VIP (is on the dancefloor). Précommande sur le festival.",
    image: "/merch/photos/campagne-2026.jpg",
    productHandles: DROPS_2026.map((p) => p.handle),
  },
  {
    id: "accessoires",
    handle: "accessoires",
    title: "Accessoires",
    tagline: "Casquettes · Bandanas · Bobs",
    description: "Stock limité. Casquettes et bobs brodés, bandana allover.",
    image: "/merch/photos/bob-black-wordmark.jpg",
    productHandles: ACCESSORIES.map((p) => p.handle),
  },
];
