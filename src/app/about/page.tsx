import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Reveal, RevealMask } from "@/components/ui/Reveal";
import { Globe } from "@/components/ui/Globe";
export const metadata: Metadata = { title: "À propos", description: "Smilin' Dancin', né à Lyon en janvier 2025 : événements électroniques à thème et vêtements Made in France. De la musique, des sourires, des souvenirs." };

const timeline = [
  { date: "14 janvier 2025", title: "Décollage", text: "Flow et Lucho présentent Smilin' Dancin' : « bien plus qu'un concept événementiel, un état d'esprit fait de good vibes, de partage et d'amour, le tout porté par la musique ». Inspirés par Paradise, CircoLoco ou Elrow, ils veulent des événements intimistes." },
  { date: "15 février 2025", title: "After Ski — Bathrobe Boogie", text: "Soirée de naissance dans un fort médiéval tenu secret, avec le crew et le futur staff, ambiancée par le DJ résident Jimmy." },
  { date: "6 septembre 2025", title: "La Isla Electrónica", text: "Première édition du festival au Yacht : destination Cuba, 12 h non-stop, 8 artistes de Lyon, Genève, Barcelone et Annecy. Stand Smilin' Dancin' Merch au Mini Mercado." },
  { date: "1er octobre 2025", title: "Smilers & Dancers Collection", text: "La collection 2024-2025 est dévoilée : 9 visuels, t-shirts et sweats brodés, Made in France." },
  { date: "5 septembre 2026", title: "Mexico Show — format XXL", text: "Deuxième édition : 3 scènes, 21 h de musique, 14 DJs, closing de KIKO. Deux nouveaux visuels merch : Groovers et The Real VIP." },
];

export default function AboutPage() {
  return (
    <div className="pt-28 md:pt-36">
      <section className="container-x relative overflow-hidden">
        <div className="absolute right-0 -top-24 opacity-60 pointer-events-none hidden md:block"><Globe size={520} id="ab" /></div>
        <div className="relative max-w-4xl">
          <p className="t-condensed text-blue-sky text-xl">Lyon · depuis janvier 2025</p>
          <h1 className="t-display text-[clamp(44px,9vw,128px)] leading-[0.82] mt-2">De la musique,<br />des sourires,<br /><span className="g-neon-text">des souvenirs.</span></h1>
        </div>
      </section>
      <section className="container-x mt-16 grid lg:grid-cols-[1fr_1.2fr] gap-10 lg:gap-20 items-start">
        <RevealMask><div className="relative aspect-[4/5] overflow-hidden rounded-[3px]"><Image src="/photos/smilin.jpg" alt="DJ devant le logo Smilin' Dancin' au Yacht" fill sizes="(max-width:1024px) 100vw, 45vw" className="object-cover" /><span className="absolute bottom-3 left-3 t-label text-[10px] bg-black/60 px-2 py-1 rounded">@vg.photographe</span></div></RevealMask>
        <Reveal delay={0.1}>
          <div className="space-y-5 text-base md:text-lg leading-relaxed text-white/80">
            <p>Smilin' Dancin' œuvre à la création d'événements culturels qui valorisent la musique électronique, le patrimoine architectural ainsi que les savoir-faire locaux.</p>
            <p>Nous, c'est Flow et Lucho : deux bons vivants, fêtards et amis inséparables, toujours animés par l'euphorie de vibrer devant les enceintes. Après des années à parcourir les festivals, une idée nous trottait en tête : partager des instants mémorables en musique avec ceux qui nous entourent.</p>
            <p>Le concept repose sur des événements à thème — La Isla Electrónica, le Mexico Show — où l'on vous demande de jouer le jeu à fond. Et sur des vêtements : Electronic Music Events & Clothing. Une collection Made in France pour continuer à danser quand la fête est finie.</p>
            <div className="flex flex-wrap gap-3 pt-2"><Link href="/shop" className="btn btn-primary">Le shop</Link><Link href="/events" className="btn btn-ghost">Les événements</Link></div>
          </div>
        </Reveal>
      </section>
      <section className="container-x mt-24">
        <h2 className="t-display text-[clamp(36px,6vw,88px)] mb-10">Chronologie</h2>
        <ol className="relative border-l border-white/15 ml-2 space-y-10">
          {timeline.map((t, i) => (
            <Reveal key={t.title} delay={i * 0.05}>
              <li className="pl-8 relative">
                <span className="absolute -left-[5px] top-2 w-[9px] h-[9px] rounded-full g-brand" />
                <p className="t-dot text-sm text-blue-sky">{t.date}</p>
                <h3 className="t-display text-2xl md:text-3xl mt-1">{t.title}</h3>
                <p className="text-white/70 mt-2 max-w-2xl">{t.text}</p>
              </li>
            </Reveal>
          ))}
        </ol>
      </section>
      <section className="container-x mt-24 grid md:grid-cols-3 gap-4">
        {[["Événements", "Festivals à thème au Yacht, 20 min au nord de Lyon. Intimistes, immersifs, 3 scènes.", "/events"], ["Vêtements", "9 visuels, 6 coupes, sweats brodés. Made in France, XS à XXL.", "/shop"], ["Association", "Smilin' Dancin' est une association loi 1901. Soutenez le projet sur HelloAsso.", "https://www.helloasso.com/associations/smilin-dancin"]].map(([t, d, h]) => (
          <Link key={t} href={h} className="border border-white/10 rounded-[3px] p-6 hover:border-white/30 transition-colors">
            <p className="t-display text-2xl">{t}</p><p className="text-sm text-white/65 mt-2">{d}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}
