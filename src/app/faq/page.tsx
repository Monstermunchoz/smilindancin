import type { Metadata } from "next";
export const metadata: Metadata = { title: "FAQ" };
const faq = [
  ["Comment commander un vêtement ?", "Choisissez votre visuel, votre coupe (classic, oversize, débardeur, crop top ou sweat), l'impression (devant petit ou dos grand), la couleur et la taille, puis ajoutez au panier. Le paiement en ligne sera activé prochainement ; en attendant, l'équipe vous contacte par email, ou commandez en DM sur Instagram."],
  ["Les pièces sont-elles fabriquées en France ?", "Oui — la collection Smilers & Dancers est Made in France (impression DTF et broderie)."],
  ["Quelles tailles ?", "XS, S, M, L, XL, XXL pour les t-shirts, débardeurs, crop tops et sweats."],
  ["Puis-je récupérer ma commande à un événement ?", "Oui : choisissez « Retrait à l'événement » au checkout (gratuit) et récupérez votre pièce au stand Merch."],
  ["Quand sortent les nouveaux visuels Groovers et The Real VIP ?", "Ils ont été dévoilés au Mexico Show 2026 en pré-commande sur le festival. Inscrivez-vous à la newsletter pour être prévenu·e de l'ouverture des commandes en ligne."],
  ["Où acheter des billets ?", "Sur Shotgun : shotgun.live/fr/venues/smilin-dancin. Aucune billetterie n'est gérée sur ce site."],
  ["Retours et échanges ?", "Les pièces imprimées ou brodées à la demande sont personnalisées. Voir la page Livraison & retours — conditions à confirmer par l'association."],
];
export default function FAQ() {
  const jsonLd = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faq.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) };
  return (
    <div className="container-x pt-28 md:pt-36 max-w-3xl">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <h1 className="t-display text-[clamp(44px,8vw,112px)] leading-[0.85] mb-10">FAQ</h1>
      <div className="divide-y divide-white/10">
        {faq.map(([q, a]) => (
          <details key={q} className="group py-5">
            <summary className="flex justify-between items-center cursor-pointer list-none font-semibold text-lg"><span>{q}</span><span className="text-white/40 group-open:rotate-45 transition-transform text-2xl">+</span></summary>
            <p className="text-white/70 mt-3 leading-relaxed">{a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
