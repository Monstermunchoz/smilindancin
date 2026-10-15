# BRAND AUDIT — Smilin' Dancin'

Date : 15 octobre 2026 · Réalisé pour 404 Agency · Méthode : Firecrawl (MCP) + navigateur (session Instagram du client) + fichiers du dossier client.

## 1. Sources explorées

| Source | Outil | Résultat |
|---|---|---|
| https://www.helloasso.com/associations/smilin-dancin | Firecrawl `scrape` | ✅ Description officielle, logo, bannière, « Prochain évènement 05.09.2026 — Info à venir » |
| https://shotgun.live/fr/venues/smilin-dancin | Firecrawl `scrape` | ✅ 2 événements passés, 12 artistes « ont joué ici », avatar/cover |
| https://shotgun.live/fr/festivals/smilin-dancin-presente-mexico-show | Firecrawl `scrape` | ✅ Texte complet, line-up (12 fiches), lieu, genres, affiche |
| https://shotgun.live/fr/events/smilin-dancin-presente-isla-electronica | Firecrawl `scrape` | ✅ Texte complet, line-up, lieu, genres, affiche |
| Recherches web (« smilin dancin » merch / boutique / instagram) | Firecrawl `search` ×3 | ✅ Bio Instagram indexée, post « SMILIN' DANCIN' MERCH 15h/22h », page Facebook, relais TikTok/Undergroundtekno |
| https://www.instagram.com/smilin.dancin/ | Firecrawl | ❌ **Instagram non supporté par Firecrawl** (« we do not support this site ») |
| https://www.facebook.com/p/Smilin-Dancin-61571865423784/ | Firecrawl | ❌ Non supporté |
| Instagram — profil public (12 derniers posts + légendes) | Navigateur intégré Claude (sans login) | ✅ |
| Instagram — highlight « Merch' » (12 stories), post collection 2024-2025 (11 slides), 52 posts (liste + légendes) | Claude in Chrome, **session connectée par le client** | ✅ Captures 626–892 px |
| Dossier client `Desktop/404 AGENCY/01_CLIENTS/Smilin Dancin` | Shell local | ✅ `COULEURS.txt`, logos PNG, visuels, projets vidéo |

Ce qui reste inaccessible / non vérifié : stories non archivées, DM, chiffres de ventes, fichiers sources des visuels (AI/PSD), photos HD (toutes les images récupérées sont des rendus web ≤ 1440 px).

## 2. Identité — faits établis

**Nom** : Smilin' Dancin' (apostrophes typographiques « ’ »). **Bio** : « De la Musique, des Sourires, des Souvenirs. 💃🪩🕺 ». **Signature** : 💙🩷 (bleu + rose) en fin de chaque post.
**Positionnement** (HelloAsso) : « œuvre à la création d'évènements culturels qui valorisent la musique électronique, le patrimoine architectural, ainsi que les savoir-faire locaux ». Badge : **Electronic Music Events & Clothing**.
**Fondateurs** : Flow et Lucho (post du 14/01/2025). Inspirations citées : Paradise, CircoLoco, Elrow. DJ résident : Jimmy Gomes. Lyon.
**Ton** : français, chaleureux, exclamatif, emojis, mots-clés en lettres espacées (« S M I L I N », « D A N C I N », « L O V I N », « J U M P I N », « M E M O R I E S »), slogans anglais courts (« Feel Better With Music », « The World Is Groove », « Never miss the drop », « The real VIP is on the dancefloor », « Music is my power », « We push the sky », « Más música por favor »).

## 3. Logo & variantes (fichiers client + Instagram)

1. **Wordmark** « SMILIN' / DANCIN' » sur deux lignes, italique, extended, très gras, SMILIN' bleu / DANCIN' framboise, décalé vers la droite. Fichiers : `logo/Design_sans_titre__25_-removebg-preview.png` (920×240, fond transparent), `SMILIN DANCIN/SMILIN’.png` (fond noir).
2. **Emblème globe** : globe grillagé bleu/rose, anneau orbital « THE WORLD IS GROOVE » (variante client) / « FEEL BETTER WITH MUSIC » (variante merch n°1 « Disco Ball »), wordmark en arc au-dessus et en dessous, effet relief/néon. Fichiers : `e1858e92…-removebg-preview.png`, `WhatsApp Image 2024-10-18…jpeg` (néon sur noir).
3. **Badge circulaire** « ELECTRONIC MUSIC EVENTS & CLOTHING » autour du globe et du wordmark, pervenche/prune (`Frame_276__2_-removebg-preview.png`).
4. Logo rond doré/miroir « Smilin' Dancin' » en scène (photos festival) et avatar Shotgun (`Frame_274_1`).

## 4. Palette (HEX / RGB)

| Rôle | HEX | RGB | Source | Confiance |
|---|---|---|---|---|
| Bleu officiel | `#37548F` | 55 84 143 | `COULEURS.txt` (« BLEU ») + extraction logo (#385890) | **Confirmée** |
| Framboise officiel (« ROUGE ») | `#A9426B` | 169 66 107 | `COULEURS.txt` + extraction logo (#A84068) | **Confirmée** |
| Bleu profond | `#125AA6` | 18 90 166 | `COULEURS.txt` | Confirmée (secondaire) |
| Bleu ciel | `#67A7DC` | 103 167 220 | `COULEURS.txt` | Confirmée (secondaire) |
| Bleu néon (globe) | `#0858A0` | 8 88 160 | extraction PNG | Estimée |
| Rose néon (globe) | `#D04080` | 208 64 128 | extraction PNG | Estimée |
| Pervenche (badge) | `#88A0D8` | 136 160 216 | extraction PNG | Estimée |
| Prune (badge) | `#482038` | 72 32 56 | extraction PNG | Estimée |
| Noir / Blanc | `#0A0A0C` / `#F7F6F3` | — | fonds des visuels, tees noir/blanc | Choix DA |

Les affiches d'événements (Mexico Show : orange/vert/rouge mexicain ; Isla : bleu/orange cubain) sont **temporaires** et ne font pas partie de la charte permanente.

## 5. Typographie

- Wordmark : sans-serif géométrique **extended, black, italique** (police non identifiée — fichiers Canva). Alternative libre retenue : **Archivo** (variable, wdth 125 / wght 900 / italic) — même structure (S plats, C large, N droit).
- Affiches / stories : condensé capitales (style Bebas/Oswald : « FEEL BETTER WITH MUSIC », « INFOS MERCH », « TARIFS ») → **Bebas Neue**.
- Merch (« IN ») : capitales larges + Anton. Post collection : serif display « Official Merch' » (ponctuel).
- Labels/UI : police dot-matrix **Doto** (référence Nothing demandée par le client) — n'est pas dans la charte d'origine, c'est un choix web.

## 6. Merchandising réel — « Smilers & Dancers Collection » (post du 01/10/2025)

**9 visuels au choix** : 1 Disco Ball · 2 Feet on the ground to dance / Spirit in the clouds to dream · 3 Smilin' Dancin' (wordmark) · 4 We push the sky · 5 Together · 6 Smil' Lov' Danc' Mov' Dream' Jump' IN · 7 Electronic Music Events & Clothing · 8 Music is my power · 9 Más música por favor.

**Tarifs officiels (slide TARIFS)** — tailles XS·S·M·L·XL·XXL, Made in France :
- Visuel devant en petit / DTF : T-shirt classic H 25 € · oversize H 30 € · débardeur H 30 € · T-shirt classic F 25 € · crop top F 25 € · débardeur F 30 €
- Visuel derrière en grand / DTF : classic H 30 € · oversize H 35 € · débardeur H 35 € · classic F 30 € · crop top F 30 € · débardeur F 30 €
- Sweat à capuche (visuel cœur + manche / broderie) : 1 → 80 € · 2 → 80 € · 3 → 60 € (centré devant uniquement) · 4 → 90 € · 5 → 80 € · 6 → 70 € · 7 → 80 € · 8 → 80 € · 9 → 80 €
- Coloris : tees noir/blanc · sweats noir/blanc/gris. Commande : « glissez en DM ».

**2026 (highlight Merch', story « Infos merch »)** : deux nouveaux visuels — **Groovers · Never miss the drop** (crop top noir, débardeur blanc) et **The Real VIP is on the dancefloor** (tee blanc, dos) — « T-shirts sur pré-commande sur le festival ». **Casquettes, bandanas, bobs — stock limité** (bob noir brodé, casquettes navy/grise/rose délavé, bandana allover). Prix non publiés.

Inventaire image par image : `research/INVENTAIRE_PRODUITS.md`.

## 7. Photographie

Solaire et naturelle (plage, lac d'Annecy, sommets, terrasse du Yacht), lumière de jour, modèles réels (amis/crew), couleurs saturées ; côté club : néon bleu/rose, logo lumineux. Crédits : @vg.photographe, @louloulebrunlavorel, @logan_villy, @pbxprod.

## 8. Recommandations DA (appliquées)

- Noir profond + blanc chaud ; bleu `#37548F` → framboise `#A9426B` en **dégradé signature** (comme le wordmark), bleu ciel `#67A7DC` en accent.
- Display italique extended (Archivo 900/125) = jumeau du wordmark ; condensé Bebas pour les lignes « affiche » ; Doto pour les micro-labels.
- Un seul élément mémorable : le **globe grillagé** vectorisé, néon, en rotation lente (hero, events, newsletter, 404).
- Photos portées réelles en grand, grilles strictes, beaucoup d'air (réf. Nothing).
- Merch = cœur : hero campagne 2026, drops, sélecteur des 9 visuels, pièces du moment, campagne éditoriale.
- Pas de fausse date, pas de faux prix : « Tarif à venir » + capture d'email pour les pièces 2026 et accessoires.

## 9. À confirmer par la marque

Photos HD originales (toutes les images sont des captures ≤ 1440 px) · fichiers vectoriels des 9 visuels · police exacte du wordmark · prix Groovers / Real VIP / accessoires · stocks · mensurations guide des tailles · email de contact, adresse, RNA/SIRET (mentions légales) · frais de port réels · politique retours · moyen de paiement (Shopify / Stripe) · prochaine date d'événement.
