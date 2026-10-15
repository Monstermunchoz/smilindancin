# DESIGN SYSTEM — Smilin' Dancin' (site e-commerce)

Tous les tokens vivent dans `src/app/globals.css` (`:root` + `@theme inline`). Changer une valeur met à jour tout le site.

## Couleurs
| Token | Valeur | Usage |
|---|---|---|
| `--sd-blue` | #37548F | Bleu officiel (logo). Dégradés, liens actifs, accents |
| `--sd-pink` | #A9426B | Framboise officiel (logo). CTA principal `.btn-brand`, focus, badges |
| `--sd-blue-sky` | #67A7DC | Sur-titres condensés, anneau du globe |
| `--sd-blue-deep` | #125AA6 | Dégradé marque (milieu) |
| `--sd-neon-blue` / `--sd-neon-pink` | #0858A0 / #D04080 | Globe néon |
| `--sd-periwinkle` / `--sd-plum` | #88A0D8 / #482038 | Badges admin, détails |
| `--sd-black` / `--sd-ink` / `--sd-ink-2` | #0A0A0C / #141418 / #1C1C22 | Fonds (page, sections, cartes) |
| `--sd-white` / `--sd-sand` | #F7F6F3 / #ECE9E2 | Texte, section claire « manifeste » |

Dégradés : `.g-brand` (fond bleu→bleu profond→framboise), `.g-brand-text` et `.g-neon-text` (texte, bleu→framboise = wordmark). Halo : `.neon-halo`. Texture : `.grain`, `.globe-grid`.

## Typographie (Google Fonts, chargées dans `layout.tsx`)
| Classe | Police | Réglages | Usage |
|---|---|---|---|
| `.t-display` | Archivo | 900, wdth 125, italique, line-height .85–.9, uppercase | Titres H1/H2, chiffres forts — jumeau du wordmark |
| `.t-display-up` | Archivo | idem sans italique | Variante droite |
| `.t-condensed` | Bebas Neue | letter-spacing .04em | Sur-titres « affiche », dates, prix « à venir » |
| `.t-label` | Doto (dot-matrix) | 12px, 800, .12em, uppercase | Micro-labels, fil d'Ariane, métadonnées |
| `.t-dot` | Doto | — | N° de commande, horaires, chiffres admin |
| body | Archivo 400–600 | 15–18px | Texte courant |

Échelle display : `clamp(44px, 8vw, 120px)` (H1 pages), `clamp(40px, 6vw, 88px)` (H2 sections), hero `13.5vw` desktop / `22vw` mobile.

## Espacements & grille
Gouttière `--gutter: clamp(16px, 4vw, 56px)` via `.container-x`. Sections : `mt-24 md:mt-36`. Grilles produits : 2 col mobile / 4 col desktop, `gap-x-3/5 gap-y-8/10`. Rayons : 2–4 px (cartes), 999px (boutons/pills). Ratio image produit : 4/5.

## Composants
- Boutons `.btn` + `.btn-primary` (blanc→framboise au hover) · `.btn-brand` (framboise) · `.btn-ghost` (contour) · `.btn-dark`.
- `ProductCard` : image 4/5, swap 1ʳᵉ→2ᵉ image au hover, zoom 1.04, bouton flottant desktop, badges « Bientôt » / « 2026 », prix « dès ».
- `ProductView` : galerie sticky + configurateur Coupe (6) → Impression (2, prix dynamique) → Couleur → Taille, guide des tailles inline, CTA sticky mobile, lien produit jumeau (tee ↔ sweat).
- `CartDrawer` : tiroir ressort (stiffness 320 / damping 34), quantités, suppression, sous-total, CTA.
- `VisualPicker` : grille 3×3 des 9 visuels, panneau détail animé (AnimatePresence).
- `Globe` : SVG de l'emblème, rotation 60–90 s, halo ; désactivé en `prefers-reduced-motion`.
- `Reveal` / `RevealMask` : apparition au scroll (opacity+y / clip-path), `once: true`, utilisées sur les titres de section et grandes images seulement.
- Admin : `Stat`, `Card`, `StatusBadge`, `BarChart` (SVG), `AdminShell` (sidebar).

## Motion (une seule bibliothèque : `motion`)
Chargement hero : lettres du wordmark (y 110% → 0, 1 s, ease expo, stagger 35 ms), puis globe (1.6 s) puis texte/CTA. Scroll : parallaxe hero (image +18 %, texte −30 %), révélations une fois. Interactions : hover image swap 600 ms, zoom 1.1–1.4 s expo, badge panier spring, toasts spring. Tout est coupé par `@media (prefers-reduced-motion: reduce)`.

## Accessibilité & perf
Focus visible framboise, `aria-pressed` sur les options, labels de formulaire, contrastes ≥ 4.5:1 sur texte courant, `next/image` (AVIF/WebP, `sizes`), polices `display=swap`, pas de vidéo lourde.
