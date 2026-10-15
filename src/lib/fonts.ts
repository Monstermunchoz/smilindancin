import localFont from "next/font/local";

/** Polices auto-hébergées (fichiers dans src/fonts) : préchargées, aucune requête vers Google. */
export const archivo = localFont({
  src: [
    { path: "../fonts/archivo-wdth-normal.woff2", style: "normal", weight: "100 900" },
    { path: "../fonts/archivo-wdth-italic.woff2", style: "italic", weight: "100 900" },
  ],
  variable: "--font-archivo",
  display: "swap",
  declarations: [{ prop: "font-stretch", value: "62% 125%" }],
  fallback: ["Arial", "Helvetica", "sans-serif"],
});

export const bebas = localFont({
  src: "../fonts/bebas-neue.woff2",
  variable: "--font-bebas",
  display: "swap",
  weight: "400",
  fallback: ["Impact", "Arial Narrow", "sans-serif"],
});

export const doto = localFont({
  src: "../fonts/doto-full.woff2",
  variable: "--font-doto",
  display: "swap",
  weight: "100 900",
  fallback: ["ui-monospace", "monospace"],
  preload: false,
});
