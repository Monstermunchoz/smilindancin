import type { Metadata } from "next";
import { ContactForm } from "@/components/ui/ContactForm";
import { SITE } from "@/lib/site";
export const metadata: Metadata = { title: "Contact" };
export default function ContactPage() {
  return (
    <div className="container-x pt-28 md:pt-36 grid lg:grid-cols-[1fr_1.2fr] gap-12">
      <div>
        <h1 className="t-display text-[clamp(44px,8vw,112px)] leading-[0.85]">Contact</h1>
        <p className="text-white/65 mt-6 max-w-md">Commande merch, partenariat, exposant au Village Market, presse : écrivez-nous. Le plus rapide reste le DM Instagram.</p>
        <ul className="mt-8 space-y-3 text-sm">
          <li><a href={SITE.instagram} target="_blank" rel="noreferrer" className="u-line">Instagram @smilin.dancin</a></li>
          <li><a href={SITE.helloasso} target="_blank" rel="noreferrer" className="u-line">HelloAsso — Smilin' Dancin'</a></li>
          <li><a href={SITE.shotgun} target="_blank" rel="noreferrer" className="u-line">Shotgun — billetterie</a></li>
          <li className="text-white/50">Email de contact : à confirmer par l'association</li>
        </ul>
      </div>
      <ContactForm />
    </div>
  );
}
