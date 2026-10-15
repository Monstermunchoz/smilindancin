import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SITE } from "@/lib/site";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/shop/CartDrawer";
import { Toaster } from "@/components/ui/Toaster";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: `${SITE.name} — Electronic Music Events & Clothing`, template: `%s · ${SITE.name}` },
  description: SITE.description,
  openGraph: { type: "website", locale: "fr_FR", siteName: SITE.name, images: ["/merch/photos/campaign-groovers-realvip-crop.jpg"] },
  twitter: { card: "summary_large_image" },
  icons: { icon: "/favicon.ico" },
};

export const viewport: Viewport = { themeColor: "#0a0a0c", width: "device-width", initialScale: 1, viewportFit: "cover" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Archivo:ital,wdth,wght@0,62..125,100..900;1,62..125,100..900&family=Bebas+Neue&family=Doto:wght@400..900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-dvh flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <CartDrawer />
        <Toaster />
      </body>
    </html>
  );
}
