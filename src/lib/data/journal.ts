/**
 * JOURNAL — architecture éditoriale SEO.
 * Les articles ci-dessous s'appuient uniquement sur des faits documentés
 * (pages Shotgun, publications Instagram publiques, HelloAsso). Pas d'anecdote inventée.
 */
export type Article = {
  slug: string;
  title: string;
  excerpt: string;
  category: "Événements" | "Coulisses" | "Culture" | "Collections" | "Artistes" | "Actualités";
  date: string;
  readingTime: string;
  cover: string;
  coverAlt: string;
  credit?: string;
  body: Array<{ type: "p" | "h2" | "quote" | "list"; text?: string; items?: string[] }>;
  related: string[]; // slugs
  sources: { label: string; url: string }[];
};

export const ARTICLES: Article[] = [
  {
    slug: "mexico-show-2026-le-film",
    title: "Mexico Show : la fête s'est terminée, les souvenirs restent",
    excerpt: "Retour sur la 2ᵉ édition du Smilin' Dancin' Festival au Yacht : 3 scènes, 21 heures de musique, 14 DJs et un closing signé KIKO.",
    category: "Événements",
    date: "2026-10-04",
    readingTime: "4 min",
    cover: "/photos/memories.jpg",
    coverAlt: "Le public du Mexico Show sur la terrasse du Yacht",
    credit: "@vg.photographe",
    body: [
      { type: "p", text: "Le 5 septembre 2026, Le Yacht, à 20 minutes au nord de Lyon, en bord de Saône, s'est transformé aux couleurs du Mexique pour la deuxième édition du festival Smilin' Dancin'." },
      { type: "h2", text: "Trois scènes qui se succèdent" },
      { type: "p", text: "Le concept : trois événements qui s'enchaînent au même endroit, pour que tout le monde vive le même moment, ensemble. Terrace Stage de 11h30 à 22h45, Club Stage de 22h45 à 5h30, puis After Stage au R+1 jusqu'à 8h30." },
      { type: "list", items: ["House · Melodic · Techno · Progressive · Eurodance · Peaktime · Psytrance", "14 DJs : KIKO, Messina, Aohna, Clarks, Messaline, Dniz, LPO, Mr. Beard, Gäte, 12:21, Boots, Cocor, T@o, Jim Rows", "BBQ & chili con carne offerts avant 14h, Happy Hour, Mexican Food le soir", "Village Market avec exposants, créateurs, partenaires, et le stand Smilin' Dancin' Merch"] },
      { type: "quote", text: "La fête s'est terminée. Les souvenirs restent. Merci 💙🩷" },
      { type: "h2", text: "Le film" },
      { type: "p", text: "Cinq minutes de bonheur montées par @pbxprod avec des images complémentaires de @logan_villy sont à voir sur le compte Instagram @smilin.dancin." },
    ],
    related: ["isla-electronica-2025-destination-cuba", "le-yacht-notre-terrain-de-jeu"],
    sources: [
      { label: "Shotgun, Mexico Show", url: "https://shotgun.live/fr/festivals/smilin-dancin-presente-mexico-show" },
      { label: "Instagram, LE FILM", url: "https://www.instagram.com/reel/DeFNWbVIG76/" },
    ],
  },
  {
    slug: "isla-electronica-2025-destination-cuba",
    title: "Isla Electrónica : la première édition, destination Cuba",
    excerpt: "Le 6 septembre 2025, Smilin' Dancin' lançait son premier festival à thème : La Havane sans quitter la région.",
    category: "Événements",
    date: "2025-09-20",
    readingTime: "3 min",
    cover: "/events/isla-electronica-2025.jpg",
    coverAlt: "Affiche Isla Electrónica 2025",
    body: [
      { type: "p", text: "Un concept inédit, solaire et vibrant : une immersion dans l'ambiance caliente des rues cubaines, avec couleurs vives, rythmes envoûtants et décor dépaysant." },
      { type: "h2", text: "12 heures non-stop" },
      { type: "p", text: "De la house à la techno en passant par la deep, la mélodique et la tech-house, avec des artistes venus de Lyon, Genève, Barcelone et Annecy : Abstraal, Julien Blanch, ZAT, Messaline, Sergy Di Sergio, LPO, Gäte et Jimmy Gomes, résident Smilin' Dancin'." },
      { type: "h2", text: "Un dress code assumé" },
      { type: "p", text: "Chemises fleuries, robes colorées, chapeaux en paille tressés : « notre concept repose sur des événements à thème, on compte sur vous pour jouer le jeu à fond ». C'est l'ADN de la marque : la fête comme un voyage." },
    ],
    related: ["mexico-show-2026-le-film"],
    sources: [{ label: "Shotgun, Isla Electrónica", url: "https://shotgun.live/fr/events/smilin-dancin-presente-isla-electronica" }],
  },
  {
    slug: "le-yacht-notre-terrain-de-jeu",
    title: "Le Yacht : notre terrain de jeu en bord de Saône",
    excerpt: "Pourquoi les deux premières éditions se sont jouées au même endroit, à 20 minutes de Lyon.",
    category: "Coulisses",
    date: "2026-08-18",
    readingTime: "3 min",
    cover: "/photos/terrasse.jpg",
    coverAlt: "La terrasse du Yacht avec le panneau Smilin' Dancin' Festival",
    body: [
      { type: "p", text: "Un établissement situé à seulement 20 minutes de Lyon, offrant un superbe panorama sur la nature et une magnifique terrasse extérieure en bord de Saône : le cadre idéal pour démarrer une journée de festival." },
      { type: "list", items: ["Bus TCL ligne 96, arrêt au pied du site", "Gare ferroviaire à 15 minutes à pied", "Grand parking public à l'entrée, VTC sur place"] },
      { type: "p", text: "Trois scènes, trois ambiances, un bar sur chaque zone, et un Village Market au cœur du site. De la musique, des sourires, des souvenirs." },
    ],
    related: ["mexico-show-2026-le-film"],
    sources: [{ label: "Instagram, implantation", url: "https://www.instagram.com/p/DcLKSLnoq3V/" }],
  },
  {
    slug: "de-la-musique-des-sourires-des-souvenirs",
    title: "De la musique, des sourires, des souvenirs",
    excerpt: "Ce que veut dire Smilin' Dancin' : une association lyonnaise qui crée des événements électroniques et une ligne de vêtements.",
    category: "Culture",
    date: "2026-06-01",
    readingTime: "2 min",
    cover: "/photos/smilin.jpg",
    coverAlt: "DJ devant le logo Smilin' Dancin' au Yacht",
    credit: "@vg.photographe",
    body: [
      { type: "p", text: "Smilin' Dancin' œuvre à la création d'événements culturels qui valorisent la musique électronique, le patrimoine architectural ainsi que les savoir-faire locaux." },
      { type: "p", text: "La marque se décline en événements à thème (Isla Electrónica, Mexico Show) et en vêtements, « Electronic Music Events & Clothing », portés par un emblème : le globe grillagé et sa devise, The World Is Groove." },
      { type: "quote", text: "Smilin', Lovin', Dancin', Jumpin'." },
    ],
    related: ["mexico-show-2026-le-film", "isla-electronica-2025-destination-cuba"],
    sources: [
      { label: "HelloAsso, Smilin' Dancin'", url: "https://www.helloasso.com/associations/smilin-dancin" },
      { label: "Instagram, @smilin.dancin", url: "https://www.instagram.com/smilin.dancin/" },
    ],
  },
];

export const getArticle = (slug: string) => ARTICLES.find((a) => a.slug === slug);
