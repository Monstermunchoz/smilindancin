import type { Metadata } from "next";
import { notFound } from "next/navigation";
const pages: Record<string, { title: string; body: string[] }> = {
  "mentions-legales": { title: "Mentions légales", body: [
    "Éditeur : Smilin' Dancin', association loi 1901, siège social : [à compléter], RNA : [à compléter], SIRET : [à compléter].",
    "Directeur de la publication : [à compléter].",
    "Hébergement : [Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, USA, à confirmer selon l'hébergeur retenu].",
    "Contact : [email à compléter], Instagram @smilin.dancin.",
    "Propriété intellectuelle : les visuels, logos, photographies et textes sont la propriété de Smilin' Dancin' ou de leurs auteurs (crédits photo : @vg.photographe, @louloulebrunlavorel, @logan_villy, @pbxprod). Toute reproduction est interdite sans autorisation.",
  ] },
  cgv: { title: "Conditions générales de vente", body: [
    "Article 1. Objet : les présentes CGV régissent les ventes de vêtements et accessoires Smilin' Dancin' sur ce site. [Version provisoire à valider juridiquement.]",
    "Article 2. Prix : prix en euros TTC. Frais de livraison indiqués avant validation. L'association [est / n'est pas] assujettie à la TVA, à compléter.",
    "Article 3. Commande : la commande est ferme après validation et paiement. Tant que le paiement en ligne n'est pas activé, la commande vaut demande et est confirmée par email.",
    "Article 4. Paiement : [Shopify Payments / Stripe, à activer]. Paiement sécurisé par carte bancaire.",
    "Article 5. Livraison : France métropolitaine, Colissimo, point relais ou retrait à l'événement. Délais indicatifs.",
    "Article 6. Rétractation : les articles personnalisés (visuel, coupe, impression à la demande) sont exclus du droit de rétractation (art. L221-28 C. conso). Les articles non personnalisés bénéficient d'un délai de 14 jours.",
    "Article 7. Garanties : garantie légale de conformité (art. L217-3 et s.) et des vices cachés (art. 1641 et s. C. civ.).",
    "Article 8. Médiation : [médiateur de la consommation à désigner].",
    "Article 9. Droit applicable : droit français.",
  ] },
  confidentialite: { title: "Politique de confidentialité", body: [
    "Responsable de traitement : Smilin' Dancin' [coordonnées à compléter].",
    "Données collectées : identité et coordonnées pour les commandes (email, nom, adresse, téléphone optionnel), email pour la newsletter, messages de contact. Panier stocké localement dans votre navigateur.",
    "Finalités : traitement des commandes, service client, envoi de la newsletter (sur consentement), statistiques anonymes.",
    "Durée : données de commande conservées 5 ans (obligations comptables) ; newsletter jusqu'à désinscription ; messages 1 an.",
    "Destinataires : l'association et ses prestataires techniques (hébergeur, plateforme e-commerce, transporteur).",
    "Droits : accès, rectification, effacement, opposition, portabilité, contactez [email à compléter]. Réclamation possible auprès de la CNIL.",
    "Cookies : ce site n'utilise pas de cookies publicitaires. Un cookie technique sert à l'espace administrateur.",
  ] },
};
export function generateStaticParams() { return Object.keys(pages).map((slug) => ({ slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> { const { slug } = await params; return { title: pages[slug]?.title ?? "Légal", robots: { index: false } }; }
export default async function Legal({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = pages[slug];
  if (!p) notFound();
  return (
    <div className="container-x pt-28 md:pt-36 max-w-3xl">
      <h1 className="m-center t-display text-[clamp(34px,6vw,88px)] leading-[0.85] mb-8">{p.title}</h1>
      <div className="space-y-4 text-sm md:text-base text-white/75 leading-relaxed">{p.body.map((b, i) => <p key={i}>{b}</p>)}</div>
      <p className="mt-10 text-xs text-white/40">Les mentions entre crochets sont à compléter par l'association avant mise en ligne.</p>
    </div>
  );
}
