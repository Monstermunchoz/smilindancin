import type { Metadata } from "next";
export const metadata: Metadata = { title: "Livraison & retours" };
export default function Shipping() {
  return (
    <div className="container-x pt-28 md:pt-36 max-w-3xl space-y-10">
      <h1 className="t-display text-[clamp(44px,8vw,112px)] leading-[0.85]">Livraison<br />& retours</h1>
      <section><h2 className="t-display text-2xl mb-3">Livraison</h2>
        <ul className="space-y-2 text-white/75 text-sm">
          <li>✦ Colissimo domicile (France métropolitaine) — 5,90 € · 2 à 4 jours ouvrés après fabrication</li>
          <li>✦ Point relais — 3,90 € · 3 à 5 jours ouvrés après fabrication</li>
          <li>✦ Retrait au stand Merch du prochain événement — offert</li>
        </ul>
        <p className="text-xs text-white/45 mt-3">Tarifs indicatifs à confirmer par l'association. Les pièces sont imprimées / brodées à la demande : comptez un délai de fabrication communiqué à la commande.</p>
      </section>
      <section><h2 className="t-display text-2xl mb-3">Retours & échanges</h2>
        <p className="text-white/75 text-sm leading-relaxed">Conformément à l'article L221-28 du Code de la consommation, les biens confectionnés selon les spécifications du consommateur ou nettement personnalisés (choix du visuel, de la coupe, de l'impression) ne sont pas soumis au droit de rétractation. En cas de défaut de fabrication, contactez-nous sous 14 jours avec photos : échange ou remboursement. Politique définitive à valider par l'association.</p>
      </section>
    </div>
  );
}
