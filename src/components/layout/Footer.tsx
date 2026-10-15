"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { NewsletterForm } from "@/components/ui/NewsletterForm";
import { SITE } from "@/lib/site";

const cols = [
  { title: "Shop", links: [["/shop", "Tout le shop"], ["/collections/smilers-dancers", "Smilers & Dancers"], ["/collections/drops-2026", "Nouvelle co' 2026"], ["/collections/accessoires", "Accessoires"], ["/guide-des-tailles", "Guide des tailles"], ["/livraison-retours", "Livraison & retours"]] },
  { title: "Smilin' Dancin'", links: [["/events", "Événements"], ["/journal", "Journal"], ["/about", "À propos"], ["/contact", "Contact"], ["/faq", "FAQ"]] },
  { title: "Suivre", links: [[SITE.instagram, "Instagram"], [SITE.shotgun, "Shotgun"], [SITE.helloasso, "HelloAsso"], [SITE.facebook, "Facebook"]] },
];

export function Footer() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;
  return (
    <footer className="relative mt-24 border-t border-white/8 bg-black overflow-hidden">
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[80vw] h-[60vh] neon-halo opacity-50 pointer-events-none" />
      <div className="container-x relative pt-16 pb-10">
        <div className="m-center grid lg:grid-cols-[1.4fr_1fr] gap-12 lg:gap-20">
          <div>
            <p className="t-label text-white/50 mb-4">Newsletter</p>
            <h2 className="t-display text-[clamp(32px,6vw,72px)] text-white mb-6">
              Never miss <span className="g-brand-text">the drop</span>
            </h2>
            <NewsletterForm source="footer" />
            <p className="text-xs text-white/40 mt-3 max-w-md">Drops, dates, line-ups. Pas de spam. Désinscription en un clic.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
            {cols.map((c) => (
              <div key={c.title}>
                <p className="t-label text-white/50 mb-4">{c.title}</p>
                <ul className="space-y-2.5">
                  {c.links.map(([href, label]) => (
                    <li key={href}>
                      {href.startsWith("http") ? (
                        <a href={href} target="_blank" rel="noreferrer" className="text-sm text-white/80 hover:text-white u-line">{label}</a>
                      ) : (
                        <Link href={href} className="text-sm text-white/80 hover:text-white u-line">{label}</Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="m-center mt-16 pt-8 border-t border-white/8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <Image src="/brand/wordmark.png" alt="Smilin' Dancin'" width={920} height={240} className="h-10 w-auto mb-3 mx-auto md:mx-0" />
            <p className="text-xs text-white/50">{SITE.tagline} 💙🩷 Electronic Music Events & Clothing · Lyon</p>
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-white/40">
            <Link href="/legal/mentions-legales" className="hover:text-white">Mentions légales</Link>
            <Link href="/legal/cgv" className="hover:text-white">CGV</Link>
            <Link href="/legal/confidentialite" className="hover:text-white">Confidentialité</Link>
            <Link href="/admin" className="hover:text-white">Admin</Link>
            <span>© 2026 Smilin' Dancin'</span>
          </div>
        </div>
      </div>
      <div className="marquee border-t border-white/8 py-3 overflow-hidden" aria-hidden>
        <div className="marquee-track t-condensed text-[22px] text-white/30" style={{ ["--marquee-speed" as string]: "40s" }}>
          {Array.from({ length: 2 }).map((_, k) => (
            <span key={k} className="flex gap-10 pr-10">
              {["Smilin'", "Lovin'", "Dancin'", "Movin'", "Dreamin'", "Shinin'", "Jumpin'", "The World Is Groove", "Feel Better With Music"].map((w) => (
                <span key={w} className="flex items-center gap-10"><span>{w}</span><span className="text-pink">✦</span></span>
              ))}
            </span>
          ))}
        </div>
      </div>
    </footer>
  );
}
