# Smilin' Dancin' — Site e-commerce (Smiling Dancing 2)

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · Motion · Zustand.
Boutique de merchandising + événements + journal + **espace administrateur**.

## Lancer en local
```bash
npm install
cp .env.example .env.local   # puis ajuster si besoin
npm run dev                  # http://localhost:3000
```
Admin : http://localhost:3000/admin — mot de passe `ADMIN_PASSWORD` (défaut dev : `smilin-admin`).

## Ce qui est opérationnel
- Accueil (hero campagne 2026, drops, sélecteur des 9 visuels, pièces du moment, campagne, events, journal, manifeste, newsletter)
- Shop (filtres catégorie/couleur, tri), collections, recherche, fiches produit avec **configurateur coupe × impression × couleur × taille et prix réels**
- Panier persistant (localStorage), checkout → **Stripe Checkout** (dès que la clé est définie ; sinon mode démo sans paiement), confirmation, webhook paiement/remboursement
- Admin : tableau de bord (CA, commandes, panier moyen, graphique 14 j, meilleures ventes, stock faible), commandes (filtres, détail, statuts, paiement, note, historique), produits (édition, statut, mise en avant, **stock par variante**), stock, clients, newsletter (export CSV), messages, événements, journal, réglages
- SEO : metadata, Open Graph, JSON-LD (Product, MusicEvent, Article, FAQ), sitemap.xml, robots.txt
- Pages : events (+ archives), journal, à propos, contact, FAQ, guide des tailles, livraison/retours, mentions légales, CGV, confidentialité, 404

## Données
- Catalogue réel : `src/lib/data/products.ts` (source : Instagram @smilin.dancin, post collection 2024-2025 + highlight Merch'). Les prix sont les tarifs officiels publiés ; pièces 2026 et accessoires = « tarif à venir ».
- Événements : `src/lib/data/events.ts` (Shotgun + Instagram). Journal : `src/lib/data/journal.ts`.
- Mode local : commandes, stocks, newsletter et messages sont stockés dans `data/runtime/*.json` (ignoré par git). Supprimer le dossier pour repartir de zéro.

## Paiement avec Stripe (recommandé — intégré)
1. Compte Stripe → Developers → API keys → `STRIPE_SECRET_KEY=sk_test_…` dans `.env.local`.
2. Webhook : Developers → Webhooks → endpoint `https://<site>/api/webhooks/stripe`, événements `checkout.session.completed` et `charge.refunded` → `STRIPE_WEBHOOK_SECRET=whsec_…`. En local : `stripe listen --forward-to localhost:3000/api/webhooks/stripe`.
3. Redémarrer. Flux : commande enregistrée (`pending_payment`) → redirection Stripe Checkout (`/api/checkout/stripe`) → webhook → commande `paid`. Annulation → `/checkout/confirmation/<id>?cancelled=1` avec bouton « Réessayer ». Remboursement Stripe → commande `refunded`.
Carte de test : 4242 4242 4242 4242, date future, CVC quelconque.

## Connecter Shopify (alternative)
1. Shopify Admin → Settings → Apps and sales channels → Develop apps → créer « Smilin' Dancin' site ».
2. Storefront API scopes : `unauthenticated_read_product_listings`, `unauthenticated_read_product_inventory`, `unauthenticated_write_checkouts`, `unauthenticated_read_checkouts`.
   Admin API scopes : `read_orders`, `write_orders`, `read_products`, `write_products`, `read_inventory`, `write_inventory`, `read_customers`.
3. Installer l'app, copier les tokens dans `.env.local` : `SHOPIFY_STORE_DOMAIN`, `SHOPIFY_STOREFRONT_ACCESS_TOKEN`, `SHOPIFY_ADMIN_ACCESS_TOKEN`.
4. Créer les produits dans Shopify (handles identiques, options Coupe / Impression / Couleur / Taille) — ou adapter `mapProduct` dans `src/lib/commerce/shopify.ts`.
5. `COMMERCE_PROVIDER=shopify` puis redémarrer. Le checkout doit alors rediriger vers `checkoutUrl` (cartCreate) — route à implémenter dans `src/app/api/checkout/shopify/route.ts` (TODO documenté).
Alternative plus simple sans Shopify : Stripe Checkout sur la route `POST /api/orders` (créer une session Stripe, marquer la commande `paid` via webhook).

Aucun secret côté client : toutes les variables sensibles sont sans préfixe `NEXT_PUBLIC_`.

## Images
Les photos (`public/merch/photos`) sont des captures web (≤ 1440 px) des publications Instagram de la marque — à remplacer par les originaux HD. Les 9 visuels (`public/merch/visuels`) sont extraits du post officiel. Mockups générés : `scripts/make-mockups.py` (non utilisés sur le site). Recadrage : `scripts/crop-merch.py`.

## Scripts QA
`node scripts/shoot.mjs / /shop` (captures desktop+mobile, overflow), `node scripts/e2e.mjs` (parcours produit → panier → commande → admin), `node scripts/overflow.mjs /page`.

## Docs
`BRAND_AUDIT.md` (recherche, sources, palette, typo, merch), `DESIGN_SYSTEM.md` (tokens, composants, motion), `research/INVENTAIRE_PRODUITS.md`, `research/instagram-merch/` (captures sources).

## Espace admin : gestion

- **Tableau de bord** : chiffre d'affaires, résultat après dépenses, « À faire », places vendues par tarif (cliquable vers la billetterie filtrée), merch vendu par produit (cliquable vers les commandes du produit).
- **Shop** (`/admin/products`) : ajouter, modifier, supprimer un produit ; upload de photos (redimensionnées dans le navigateur, WebP), tailles, couleurs, prix, prix barré, précommande, visibilité, stock par variante.
- **Merch vendu** (`/admin/ventes`) : détail par produit, variante, couleur et taille.
- **Factures** (`/admin/factures`) : dépenses par poste (Comm, Déco, Son & lumière, Artistes, Lieu, Merch, Bar, Sécurité, Transport), pièce jointe PDF/photo privée, fournisseurs, envois avec suivi transporteur, recherche.
- Les fichiers uploadés sont stockés dans la base (Supabase en production), 4 Mo max par fichier ; les factures ne sont lisibles que connecté en admin.
