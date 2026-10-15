"""
Génère des mockups produits (PNG) à partir des VRAIS graphismes Smilin' Dancin'
(fichiers du dossier client), posés sur des silhouettes neutres (t-shirt, hoodie, casquette, tote).
Ce sont des MOCKUPS, pas des photos produit : à remplacer par les photos officielles.
Usage : python3 scripts/make-mockups.py
"""
from PIL import Image, ImageDraw, ImageFilter
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BRAND = os.path.join(ROOT, "public", "brand")
OUT = os.path.join(ROOT, "public", "products")
os.makedirs(OUT, exist_ok=True)

W = H = 1400
BG = (236, 234, 230)  # sable clair (studio)


def canvas():
    im = Image.new("RGBA", (W, H), BG + (255,))
    # léger vignettage studio
    v = Image.new("L", (W, H), 0)
    d = ImageDraw.Draw(v)
    d.ellipse((-300, -200, W + 300, H + 400), fill=255)
    v = v.filter(ImageFilter.GaussianBlur(220))
    dark = Image.new("RGBA", (W, H), (190, 186, 180, 255))
    im = Image.composite(im, dark, v)
    return im


def shadow(im, mask, offset=(0, 26), blur=38, alpha=90):
    sh = Image.new("RGBA", im.size, (0, 0, 0, 0))
    s = Image.new("RGBA", im.size, (0, 0, 0, alpha))
    sh.paste(s, offset, mask)
    sh = sh.filter(ImageFilter.GaussianBlur(blur))
    return Image.alpha_composite(im, sh)


def tee_mask(color):
    layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    c = color + (255,)
    # corps
    d.rounded_rectangle((370, 330, 1030, 1180), radius=40, fill=c)
    # manches
    d.polygon([(370, 340), (230, 470), (300, 600), (400, 560), (400, 420)], fill=c)
    d.polygon([(1030, 340), (1170, 470), (1100, 600), (1000, 560), (1000, 420)], fill=c)
    # épaules / col
    d.polygon([(370, 340), (560, 300), (840, 300), (1030, 340), (1030, 420), (370, 420)], fill=c)
    neck = tuple(max(0, x - 18) for x in color) + (255,)
    d.ellipse((600, 262, 800, 372), fill=BG + (255,))
    d.arc((600, 262, 800, 372), 0, 180, fill=neck, width=10)
    # plis subtils
    fold = tuple(max(0, x - 10) for x in color) + (60,)
    for x in (470, 560, 860, 940):
        d.line((x, 650, x + 12, 1170), fill=fold, width=3)
    return layer


def hoodie_mask(color):
    layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    c = color + (255,)
    d.rounded_rectangle((340, 360, 1060, 1200), radius=46, fill=c)
    d.polygon([(340, 380), (170, 520), (220, 1000), (340, 980)], fill=c)
    d.polygon([(1060, 380), (1230, 520), (1180, 1000), (1060, 980)], fill=c)
    # capuche
    hood = tuple(max(0, x - 14) for x in color) + (255,)
    d.chord((470, 220, 930, 560), 170, 370, fill=hood)
    d.polygon([(470, 390), (700, 250), (930, 390), (930, 470), (700, 540), (470, 470)], fill=hood)
    d.ellipse((610, 330, 790, 450), fill=BG + (255,))
    # poche kangourou
    pocket = tuple(max(0, x - 8) for x in color) + (255,)
    d.rounded_rectangle((470, 900, 930, 1140), radius=30, fill=pocket)
    # cordons
    d.line((690, 480, 670, 760), fill=(220, 220, 220, 255), width=6)
    d.line((710, 480, 730, 760), fill=(220, 220, 220, 255), width=6)
    return layer


def cap_mask(color):
    layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    c = color + (255,)
    d.chord((380, 380, 1020, 960), 180, 360, fill=c)  # calotte
    d.rectangle((380, 668, 1020, 760), fill=c)
    dark = tuple(max(0, x - 16) for x in color) + (255,)
    d.ellipse((330, 700, 1180, 900), fill=dark)  # visière
    d.rectangle((330, 700, 1180, 800), fill=BG + (255,))
    d.chord((330, 700, 1180, 900), 0, 180, fill=dark)
    for x in (560, 700, 840):
        d.line((x, 400, 700, 690), fill=dark, width=4)
    return layer


def tote_mask(color):
    layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    c = color + (255,)
    d.rounded_rectangle((380, 520, 1020, 1200), radius=24, fill=c)
    handle = tuple(max(0, x - 22) for x in color) + (255,)
    d.arc((470, 250, 930, 700), 180, 360, fill=handle, width=34)
    return layer


def place_graphic(im, name, box, fit="contain"):
    g = Image.open(os.path.join(BRAND, name)).convert("RGBA")
    bw, bh = box[2] - box[0], box[3] - box[1]
    g.thumbnail((bw, bh), Image.LANCZOS)
    x = box[0] + (bw - g.width) // 2
    y = box[1] + (bh - g.height) // 2
    # léger "print" texture: réduire l'alpha un poil
    a = g.split()[3].point(lambda v: int(v * 0.96))
    g.putalpha(a)
    im.alpha_composite(g, (x, y))
    return im


BLACK = (24, 24, 27)
NAVY = (31, 42, 68)
SAND = (228, 219, 204)
WHITE = (246, 246, 244)
BLUE = (55, 84, 143)

specs = [
    # (fichier sortie, forme, couleur, graphisme, box)
    ("tee-world-is-groove-black-front.png", tee_mask, BLACK, "globe.png", (520, 520, 880, 880)),
    ("tee-world-is-groove-black-back.png", tee_mask, BLACK, "wordmark.png", (560, 520, 840, 620)),
    ("tee-in-black-front.png", tee_mask, BLACK, "in-tee-transparent.png", (520, 500, 880, 860)),
    ("tee-badge-sand-front.png", tee_mask, SAND, "badge.png", (520, 500, 880, 860)),
    ("hoodie-wordmark-navy-front.png", hoodie_mask, NAVY, "wordmark.png", (470, 620, 930, 780)),
    ("hoodie-wordmark-black-front.png", hoodie_mask, BLACK, "wordmark.png", (470, 620, 930, 780)),
    ("cap-wordmark-black-front.png", cap_mask, BLACK, "wordmark.png", (600, 560, 800, 640)),
    ("tote-feel-better-sand-front.png", tote_mask, SAND, "feel-better-music-transparent.png", (450, 700, 950, 1040)),
]

for out, maker, color, graphic, box in specs:
    base = canvas()
    layer = maker(color)
    mask = layer.split()[3]
    base = shadow(base, mask)
    base.alpha_composite(layer)
    base = place_graphic(base, graphic, box)
    base.convert("RGB").save(os.path.join(OUT, out), quality=90, optimize=True)
    print("ok", out)
