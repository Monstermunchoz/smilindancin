/**
 * ÉVÉNEMENTS — uniquement des données réelles, vérifiées sur Shotgun et Instagram (15/10/2026).
 * Sources : https://shotgun.live/fr/venues/smilin-dancin
 */
import type { EventTicketing } from "@/lib/tickets/types";

export type Artist = { name: string; from?: string; handle?: string; role?: string };

export type SDEvent = {
  slug: string;
  title: string;
  edition: string;
  concept: string;
  date: string; // ISO
  dateLabel: string;
  hours?: string;
  venue: { name: string; address: string; city: string; mapsUrl: string };
  status: "past" | "upcoming" | "announced";
  ticketUrl: string;
  sourceUrl: string;
  poster: string;
  cover: string;
  photos: { src: string; alt: string; credit?: string; sourceUrl?: string }[];
  genres: string[];
  lineup: Artist[];
  stages?: { name: string; hours: string }[];
  description: string[];
  practical: string[];
  interested?: number;
  theme: { from: string; to: string; emoji: string };
  /** Billetterie intégrée (sinon lien externe ticketUrl). */
  ticketing?: EventTicketing;
  demo?: boolean;
};

export const EVENTS: SDEvent[] = [
  {
    slug: "mexico-show-2026",
    title: "Mexico Show",
    edition: "Smilin' Dancin' Festival — 2ᵉ édition",
    concept: "Sortez vos meilleurs outfits mexicains : de la couleur, du style et de la fiesta. 3 scènes, 21 h de musique non-stop, 14 DJs.",
    date: "2026-09-05",
    dateLabel: "Samedi 5 septembre 2026",
    hours: "11h30 → 08h30",
    venue: {
      name: "Le Yacht",
      address: "16 avenue Jacques Brel, 69650 Saint-Germain-au-Mont-d'Or",
      city: "À 20 min au nord de Lyon",
      mapsUrl: "https://www.google.com/maps/search/LE%20YACHT%2C%2016%20Avenue%20Jacques%20Brel%2C%2069650%20Saint-Germain-au-Mont-d'Or%2C%20France",
    },
    status: "past",
    ticketUrl: "https://shotgun.live/fr/festivals/smilin-dancin-presente-mexico-show",
    sourceUrl: "https://shotgun.live/fr/festivals/smilin-dancin-presente-mexico-show",
    poster: "/events/mexico-show-2026.jpg",
    cover: "/photos/memories.jpg",
    photos: [
      { src: "/photos/smilin.jpg", alt: "S M I L I N — 05.09.26", credit: "@vg.photographe", sourceUrl: "https://www.instagram.com/p/DdRc7FqCNzv/" },
      { src: "/photos/dancin.jpg", alt: "D A N C I N — 05.09.26", credit: "@louloulebrunlavorel", sourceUrl: "https://www.instagram.com/p/DdZe6RZCJ6p/" },
      { src: "/photos/lovin.jpg", alt: "L O V I N — 05.09.26", credit: "@louloulebrunlavorel / @vg.photographe", sourceUrl: "https://www.instagram.com/p/Ddge5_8iPOz/" },
      { src: "/photos/jumpin.jpg", alt: "J U M P I N", credit: "Smilin' Dancin'", sourceUrl: "https://www.instagram.com/p/Dd1BuomCKfp/" },
      { src: "/photos/memories.jpg", alt: "M E M O R I E S — 05.09.26", credit: "@vg.photographe", sourceUrl: "https://www.instagram.com/p/DdKDmxGiDuW/" },
      { src: "/photos/terrasse.jpg", alt: "Terrasse du Yacht — J-9", credit: "Smilin' Dancin'", sourceUrl: "https://www.instagram.com/p/DciURhOsrg2/" },
    ],
    genres: ["House", "Melodic", "Techno", "Progressive", "Eurodance", "Peaktime", "Psytrance"],
    lineup: [
      { name: "KIKO", handle: "kiko_officiel.fr", role: "Closing" },
      { name: "Messina", handle: "messina.ofc" },
      { name: "Aohna", handle: "aohna_music" },
      { name: "Clarks", handle: "clarksfr" },
      { name: "Messaline", handle: "messaline" },
      { name: "Dniz", handle: "dniz_music" },
      { name: "LPO" },
      { name: "Mr. Beard", handle: "mr.beardcoco" },
      { name: "Gäte", handle: "gate___official" },
      { name: "12:21 (La Douze)", handle: "ladouze_music" },
      { name: "Boots", handle: "boots.frequencies" },
      { name: "Cocor", handle: "cocor_music" },
      { name: "T@o", handle: "dj_ta0" },
      { name: "Jim Rows", handle: "jim.rows" },
    ],
    stages: [
      { name: "Terrace Stage", hours: "11h30 → 22h45" },
      { name: "Club Stage", hours: "22h45 → 05h30" },
      { name: "After Stage (R+1)", hours: "05h30 → 08h30" },
    ],
    description: [
      "Deuxième édition du Smilin' Dancin' Festival : un lieu entièrement revisité aux couleurs du Mexique, avec 3 scènes qui se succèdent au fil de l'événement.",
      "21 heures de musique non-stop avec 14 DJs de styles différents, pour vous ambiancer jusqu'au petit matin.",
      "BBQ et chili con carne offerts avec la place pour toute arrivée avant 14h, Happy Hour, Mexican Food le soir au cœur du Village Market avec exposants, créateurs et partenaires — et le stand Smilin' Dancin' Merch.",
    ],
    practical: [
      "Bus TCL ligne 96, arrêt Stade J. Lacaze, au pied du site",
      "Gare ferroviaire à 15 min à pied",
      "Parking & VTC sur place",
      "Capacité limitée",
    ],
    interested: 112,
    theme: { from: "#a9426b", to: "#f0a35a", emoji: "🇲🇽" },
  },
  {
    slug: "isla-electronica-2025",
    title: "Isla Electrónica",
    edition: "Smilin' Dancin' Festival — 1ʳᵉ édition",
    concept: "Destination Cuba : un voyage sensoriel et festif au cœur de La Havane, sans quitter la région. Dress code cubain fortement recommandé.",
    date: "2025-09-06",
    dateLabel: "Samedi 6 septembre 2025",
    hours: "16h00 → 04h00",
    venue: {
      name: "Le Yacht",
      address: "16 avenue Jacques Brel, 69650 Saint-Germain-au-Mont-d'Or",
      city: "À 20 min au nord de Lyon",
      mapsUrl: "https://www.google.com/maps/search/16%20Avenue%20Jacques%20Brel%2C%2069650%20Saint-Germain-au-Mont-d'Or%2C%20France",
    },
    status: "past",
    ticketUrl: "https://shotgun.live/fr/events/smilin-dancin-presente-isla-electronica",
    sourceUrl: "https://shotgun.live/fr/events/smilin-dancin-presente-isla-electronica",
    poster: "/events/isla-electronica-2025.jpg",
    cover: "/events/isla-electronica-2025.jpg",
    photos: [],
    genres: ["House", "Melodic House & Techno", "Tech House", "Deep Tech", "Techno"],
    lineup: [
      { name: "Abstraal", from: "Lyon" },
      { name: "Julien Blanch", from: "Barcelone" },
      { name: "ZAT", from: "Genève" },
      { name: "Messaline", from: "Lyon" },
      { name: "Sergy Di Sergio", from: "Lyon" },
      { name: "LPO", from: "Lyon" },
      { name: "Gäte", from: "Annecy" },
      { name: "Jimmy Gomes", role: "Résident Smilin' Dancin'" },
    ],
    description: [
      "Un concept inédit, solaire et vibrant : une immersion dans l'ambiance caliente des rues cubaines. Couleurs vives, rythmes envoûtants, décor dépaysant.",
      "12 heures non-stop, de la house à la techno en passant par la deep, la mélodique et la tech-house, avec des artistes venus de Lyon, Genève, Barcelone et Annecy.",
      "Chemises fleuries, robes colorées, chapeaux en paille : préparez vos plus beaux outfits. Aquí está la fiesta !",
    ],
    practical: ["Capacité limitée", "Indoor & outdoor festival"],
    interested: 52,
    theme: { from: "#37548f", to: "#e8763a", emoji: "🇨🇺" },
  },
];

EVENTS.push({
  slug: "after-ski-bathrobe-boogie-2025",
  title: "After Ski — Bathrobe Boogie",
  edition: "Soirée de lancement — crew & staff",
  concept: "Un after ski dans un fort médiéval tenu secret, pour célébrer la naissance de Smilin' Dancin'. Dress code : peignoirs et accessoires funky.",
  date: "2025-02-15",
  dateLabel: "Samedi 15 février 2025",
  venue: { name: "Fort médiéval tenu secret", address: "Lieu non communiqué", city: "Région lyonnaise", mapsUrl: "" },
  status: "past",
  ticketUrl: "https://www.instagram.com/reel/DHB-W7qIlv9/",
  sourceUrl: "https://www.instagram.com/reel/DHB-W7qIlv9/",
  poster: "/photos/lefilm.jpg",
  cover: "/photos/lefilm.jpg",
  photos: [],
  genres: ["House"],
  lineup: [{ name: "Jimmy Gomes", role: "DJ résident Smilin' Dancin'" }],
  description: [
    "« On a voulu marquer le coup pour célébrer la naissance de Smilin' Dancin' avec notre crew et futur staff de feu ! »",
    "Le délire « Bathrobe Boogie » : tout le monde en peignoir, chacun avec ses accessoires funky, ambiancé par le DJ résident Jimmy.",
  ],
  practical: ["Événement privé (crew & staff)", "Flashback publié le 10 mars 2025 sur Instagram"],
  theme: { from: "#67a7dc", to: "#37548f", emoji: "⛷️" },
});

/**
 * ÉDITION 3 — BILLETTERIE DE DÉMONSTRATION
 * Aucune date ni line-up n'est publié pour la prochaine édition : cet événement sert à présenter la
 * billetterie intégrée (tarifs progressifs Early Bird → Regular → Last Release, QR codes, contrôle d'accès).
 * Tarifs, quotas et textes sont des valeurs de démonstration, modifiables (admin → Billetterie, ou ce fichier).
 */
EVENTS.push({
  slug: "smilin-dancin-festival-2027",
  title: "Festival 2027",
  edition: "Smilin' Dancin' Festival — 3ᵉ édition",
  concept: "Nouvelle destination, nouveau thème : la 3ᵉ édition se prépare. Les premières places partent en Early Bird.",
  date: "2027-09-04",
  dateLabel: "Date à annoncer · fin d'été 2027",
  venue: { name: "Lieu à annoncer", address: "Région lyonnaise", city: "Région lyonnaise", mapsUrl: "" },
  status: "announced",
  ticketUrl: "/billetterie/smilin-dancin-festival-2027",
  sourceUrl: "https://www.instagram.com/smilin.dancin/",
  poster: "/photos/memories.jpg",
  cover: "/photos/memories.jpg",
  photos: [],
  genres: ["House", "Melodic", "Techno"],
  lineup: [],
  description: [
    "Après La Isla Electrónica et le Mexico Show, Smilin' Dancin' prépare sa 3ᵉ édition. Thème, line-up et lieu seront dévoilés sur Instagram.",
    "Comme à chaque édition : plusieurs scènes, un village market, un dress code à thème et le stand Smilin' Dancin' Merch.",
  ],
  practical: ["Billet nominatif avec QR code, à présenter à l'entrée", "Capacité limitée", "Tarifs progressifs : plus tôt = moins cher"],
  theme: { from: "#37548f", to: "#a9426b", emoji: "🪩" },
  demo: true,
  ticketing: {
    demo: true,
    feePercent: 0,
    tiers: [
      { id: "early-bird", name: "Early Bird", description: "Les premières places, au meilleur prix.", price: 2500, quota: 150, perOrderMax: 4, badge: "Meilleur prix" },
      { id: "regular", name: "Regular", description: "Ouvre quand l'Early Bird est épuisé.", price: 3200, quota: 350, perOrderMax: 6 },
      { id: "last-release", name: "Last Release", description: "Les dernières places.", price: 3800, quota: 150, perOrderMax: 6 },
      { id: "pack-merch", name: "Pack Billet + Tee", description: "1 billet + 1 t-shirt Smilin' Dancin' à retirer au stand Merch.", price: 5500, quota: 80, perOrderMax: 4, badge: "Exclu" },
    ],
  },
});

export const upcomingEvents = () => EVENTS.filter((e) => e.status !== "past").sort((a, b) => a.date.localeCompare(b.date));
export const pastEvents = () => EVENTS.filter((e) => e.status === "past").sort((a, b) => b.date.localeCompare(a.date));
export const getEvent = (slug: string) => EVENTS.find((e) => e.slug === slug);

/** Prochaine date publiée sur HelloAsso (sans détail) : « Prochain évènement 05.09.2026 — Info à venir ». */
export const NEXT_DATE_HINT = {
  label: "Prochaine date",
  value: "Info à venir",
  note: "Aucune date future confirmée publiquement au 15/10/2026. Suivez @smilin.dancin.",
  shotgunUrl: "https://shotgun.live/fr/venues/smilin-dancin",
};
