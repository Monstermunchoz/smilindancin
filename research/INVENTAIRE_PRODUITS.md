# Inventaire des produits & images identifiés (Instagram @smilin.dancin)

Toutes les images ci-dessous sont des captures (626–892 px) réalisées depuis la session Instagram du client. Sources : post https://www.instagram.com/p/DPQrKZSiOKL/ (01/10/2025) et highlight « Merch' » (https://www.instagram.com/stories/highlights/18051177119448605/). Certitude = identification du produit sur la photo.

| Fichier (research/instagram-merch) | Produit(s) visibles | Coloris | Graphisme | Certitude |
|---|---|---|---|---|
| story-01-music-is-my-power-beach.png | T-shirt classic H | Noir | Petit wordmark cœur (devant) + grand « Music is my power » (dos) | Haute |
| story-02-cap-palms.png | Casquette | Navy | Wordmark brodé | Haute |
| story-03-in-tee-palm-beach.png | T-shirt F | Blanc | « IN » grand dos | Haute |
| story-04-hoodies-sommet.png | Sweats à capuche ×3, casquette grise, bandana (chien) | Noir, blanc, gris | Disco Ball brodé (cœur + manche), Más Música patch manche, wordmark | Haute |
| story-05-femmes-hoodies-bandanas.png | Sweats ×4, bandanas ×2, bob | Gris, blanc, noir | Music is my power, Feet on the ground, Events & Clothing, allover wordmark | Haute |
| story-06-feet-on-the-ground-hoodie.png | Sweat à capuche | Noir | Feet on the ground (cœur), Caprices Festival | Haute |
| story-07-mas-musica-tee.png | T-shirt | Noir | Patch Más Música | Moyenne (cadrage) |
| story-08-bobs-annecy.png | Bobs ×2, t-shirt | Noir | Wordmark brodé | Haute |
| story-09-groovers-debardeur.png | Débardeur | Blanc | Groovers (nouveau visuel 2026) | Haute |
| story-10-real-vip-tee.png | T-shirt oversize | Blanc | The Real VIP (dos) | Haute |
| story-11-bob-wordmark.png | Bob (packshot) | Noir | Wordmark brodé bleu/rose | Haute |
| story-12-infos-merch-groovers-realvip.png | Crop top F + T-shirt oversize H — **campagne 2026** | Noir / blanc | Groovers (cœur) + Real VIP (dos) ; texte « Infos merch » | Haute |
| post-01-we-push-the-sky-hoodie.png | Sweat à capuche | Noir | We push the sky brodé | Haute |
| post-02-hoodie-sleeve-wordmark.png | Sweat (manche) | Noir | Wordmark brodé manche | Haute |
| post-03-smilers-dancers-collection-9-visuels.png | — | — | **Les 9 visuels officiels** | Haute |
| post-04-events-clothing-tee-back.png | T-shirt oversize H | Noir (marron au filtre) | Events & Clothing grand dos | Haute |
| post-05-coupes-catalogue.png | **Catalogue des coupes** (classic, oversize, débardeur H ; sweat H/F ; classic, crop top, débardeur F) | Noir/blanc | — | Haute |
| post-06-feet-on-the-ground-croptop.png | Crop top F + bob | Blanc / noir | Feet on the ground grand dos | Haute |
| post-07-tarifs.png | **Grille TARIFS officielle** | — | — | Haute |
| post-08-together-tee-cap.png | T-shirt oversize H + casquette | Blanc / rose délavé | Together grand dos | Haute |
| post-09-we-push-the-sky-dog.png | Sweat à capuche | Noir | We push the sky | Haute |

Mapping site : `public/merch/photos/*.jpg` (recadrages, `scripts/crop-merch.py`), `public/merch/visuels/0X-*.jpg` (tuiles des 9 visuels).

Autres images de marque : `public/photos/*` (festival, posts publics sept.–oct. 2026, crédits dans `events.ts`), `public/events/*` (affiches Shotgun), `public/brand/*` (logos du dossier client).

## Photos — nettoyage (15/10/2026)

- Slides du post officiel DPQrKZSiOKL récupérées en pleine résolution (1440×1800) : textes « Official Merch' » et petit logo retirés par recadrage, sortie 1080×1350.
- Stories du highlight Merch' recadrées : plus aucun pseudo, sticker, compte à rebours, légende ni bandeau noir. Photos impossibles à nettoyer sans couper le produit retirées du site (crop Groovers débardeur, Más Música tee noir, Feet On The Ground sweat noir, Real VIP story).
- Visuels 1 à 9 : tuiles HD sans numéros + fichiers d'impression détourés (`public/merch/prints/`) utilisés par la vue 3D devant/dos.
- Photo des fondateurs (post DEz5etPiLzg) : texte « IS BORN » retiré, fond nettoyé, utilisée dans À propos.

## Musique d'accueil (17/10/2026)

- Fichier : `public/audio/marea.mp3` (Marea (We've Lost Dancing), Fred again.. feat. The Blessed Madonna), fourni par le client, réencodé en 112 kb/s (4 Mo).
- Droits : titre commercial. Avant mise en ligne publique, obtenir une licence de synchronisation / diffusion web (ayants droit, SACEM) ou remplacer par un titre libre de droits ou produit par Smilin' Dancin'.
- Comportement : volume 25 %, fondu, bouton couper toujours visible, préférence mémorisée, pause en arrière-plan, pas de son si « réduire les animations ».
