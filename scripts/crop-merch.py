"""
Découpe les captures Instagram (research/instagram-merch) en visuels web :
- public/merch/photos/*.jpg  : photos portées (vraies photos de la marque, captures 626–892 px)
- public/merch/visuels/*.jpg : les 9 visuels de la Smilers & Dancers Collection (tuiles du post officiel)
Sources : post https://www.instagram.com/p/DPQrKZSiOKL/ et highlight « Merch' » @smilin.dancin.
Les fichiers HD doivent être fournis par la marque pour la mise en production.
"""
from PIL import Image, ImageFilter
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "research", "instagram-merch")
PH = os.path.join(ROOT, "public", "merch", "photos")
VI = os.path.join(ROOT, "public", "merch", "visuels")
os.makedirs(PH, exist_ok=True)
os.makedirs(VI, exist_ok=True)



def save(src, box, out_dir, name, upscale=None, q=86):
    im = Image.open(os.path.join(SRC, src)).convert("RGB").crop(box)
    if upscale:
        im = im.resize((int(im.width * upscale), int(im.height * upscale)), Image.LANCZOS)
        im = im.filter(ImageFilter.UnsharpMask(radius=1.2, percent=50, threshold=2))
    im.save(os.path.join(out_dir, name), quality=q, optimize=True)
    print("ok", name, im.size)


# ---- Visuels (grille 892x1113) ----
cols = [(8, 298), (306, 596), (604, 888)]
rows = [(110, 398), (408, 698), (708, 998)]
names = [
    "01-disco-ball", "02-feet-on-the-ground", "03-wordmark",
    "04-we-push-the-sky", "05-together", "06-in",
    "07-electronic-music-events-clothing", "08-music-is-my-power", "09-mas-musica-por-favor",
]
i = 0
for r in rows:
    for c in cols:
        save("post-03-smilers-dancers-collection-9-visuels.png", (c[0], r[0], c[1], r[1]), VI, names[i] + ".jpg", upscale=2.0, q=88)
        i += 1
save("post-03-smilers-dancers-collection-9-visuels.png", (0, 0, 892, 1113), VI, "collection-grid.jpg", q=86)

# ---- Photos portées ----
# story-01 : 4 tuiles (Music is my power, plage)
save("story-01-music-is-my-power-beach.png", (0, 0, 308, 555), PH, "music-is-my-power-tee-front.jpg", upscale=1.6)
save("story-01-music-is-my-power-beach.png", (312, 0, 626, 555), PH, "music-is-my-power-tee-back.jpg", upscale=1.6)
save("story-01-music-is-my-power-beach.png", (0, 560, 308, 1113), PH, "music-is-my-power-tee-back-walk.jpg", upscale=1.6)
save("story-01-music-is-my-power-beach.png", (312, 560, 626, 1113), PH, "music-is-my-power-tee-front-2.jpg", upscale=1.6)
# story-02 : casquette palmiers
save("story-02-cap-palms.png", (58, 112, 568, 1000), PH, "cap-navy-palms.jpg", upscale=1.3)
# story-03 : tee IN blanc Palm Beach
save("story-03-in-tee-palm-beach.png", (58, 118, 562, 1000), PH, "in-tee-white-palm-beach.jpg", upscale=1.3)
# story-04 : hoodies sommet (6 tuiles)
save("story-04-hoodies-sommet.png", (0, 0, 308, 370), PH, "cap-grey-sunset.jpg", upscale=1.8)
save("story-04-hoodies-sommet.png", (312, 0, 626, 370), PH, "bandana-dog.jpg", upscale=1.8)
save("story-04-hoodies-sommet.png", (0, 375, 308, 740), PH, "disco-ball-hoodie-black.jpg", upscale=1.8)
save("story-04-hoodies-sommet.png", (312, 375, 626, 740), PH, "disco-ball-hoodie-black-detail.jpg", upscale=1.8)
save("story-04-hoodies-sommet.png", (312, 745, 626, 1113), PH, "mas-musica-hoodie-white-sleeve.jpg", upscale=1.8)
# story-05 : femmes (4 tuiles)
save("story-05-femmes-hoodies-bandanas.png", (0, 0, 308, 545), PH, "bandana-lake.jpg", upscale=1.6)
save("story-05-femmes-hoodies-bandanas.png", (312, 0, 626, 545), PH, "hoodies-trio-lake.jpg", upscale=1.6)
save("story-05-femmes-hoodies-bandanas.png", (0, 595, 308, 1113), PH, "hoodies-duo-feet-music.jpg", upscale=1.6)
save("story-05-femmes-hoodies-bandanas.png", (312, 595, 626, 1113), PH, "bandana-duo.jpg", upscale=1.6)
# story-06 : hoodie feet on the ground noir
save("story-06-feet-on-the-ground-hoodie.png", (58, 112, 566, 1000), PH, "feet-on-the-ground-hoodie-black.jpg", upscale=1.3)
# story-07 : más música tee (patch)
save("story-07-mas-musica-tee.png", (58, 108, 556, 1000), PH, "mas-musica-tee-black.jpg", upscale=1.3)
# story-08 : bobs Annecy
save("story-08-bobs-annecy.png", (0, 0, 626, 1113), PH, "bobs-annecy.jpg", upscale=1.2)
# story-09 : Groovers débardeur
save("story-09-groovers-debardeur.png", (0, 0, 626, 1113), PH, "groovers-debardeur-white.jpg", upscale=1.2)
# story-10 : Real VIP tee
save("story-10-real-vip-tee.png", (58, 112, 562, 1000), PH, "real-vip-tee-white-back.jpg", upscale=1.3)
# story-11 : bob wordmark
save("story-11-bob-wordmark.png", (0, 0, 626, 1113), PH, "bob-black-wordmark.jpg", upscale=1.2)
# story-12 : campagne Groovers / Real VIP (modèles mur béton)
save("story-12-infos-merch-groovers-realvip.png", (0, 60, 626, 1113), PH, "campaign-groovers-realvip.jpg", upscale=1.4)
save("story-12-infos-merch-groovers-realvip.png", (0, 140, 626, 830), PH, "campaign-groovers-realvip-crop.jpg", upscale=1.6)
# posts (892x1113)
save("post-01-we-push-the-sky-hoodie.png", (0, 0, 892, 905), PH, "we-push-the-sky-hoodie-black.jpg", upscale=1.1)
save("post-02-hoodie-sleeve-wordmark.png", (0, 240, 892, 1113), PH, "hoodie-black-sleeve-wordmark.jpg", upscale=1.1)
save("post-04-events-clothing-tee-back.png", (0, 0, 892, 905), PH, "events-clothing-tee-back.jpg", upscale=1.1)
save("post-05-coupes-catalogue.png", (0, 0, 892, 1113), PH, "coupes-catalogue.jpg")
save("post-06-feet-on-the-ground-croptop.png", (0, 230, 892, 1113), PH, "feet-on-the-ground-croptop-white.jpg", upscale=1.1)
save("post-07-tarifs.png", (0, 0, 892, 1113), PH, "tarifs-officiels.jpg")
save("post-08-together-tee-cap.png", (0, 0, 892, 905), PH, "together-tee-white-cap-pink.jpg", upscale=1.1)
save("post-09-we-push-the-sky-dog.png", (0, 0, 892, 905), PH, "we-push-the-sky-hoodie-dog.jpg", upscale=1.1)
