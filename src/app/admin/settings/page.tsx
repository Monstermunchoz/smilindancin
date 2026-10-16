import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin/auth";
import { shopifyConfigured, shopifyAdminConfigured } from "@/lib/commerce/shopify";
import { stripeConfigured } from "@/lib/stripe";
import { PageTitle, Card } from "@/components/admin/ui";
import { SITE } from "@/lib/site";
export default async function Settings() {
  if (!(await isAdmin())) redirect("/admin/login");
  const rows = [
    ["Moteur commerce", process.env.COMMERCE_PROVIDER === "shopify" && shopifyConfigured ? "Shopify" : "Local (JSON, démo sans paiement)"],
    ["Shopify Storefront", shopifyConfigured ? "Configuré" : "Non configuré"],
    ["Shopify Admin API", shopifyAdminConfigured ? "Configuré" : "Non configuré"],
    ["Paiement en ligne", stripeConfigured ? `Stripe Checkout actif${process.env.STRIPE_WEBHOOK_SECRET ? " + webhook" : ", webhook manquant (STRIPE_WEBHOOK_SECRET)"}` : "Désactivé, ajouter STRIPE_SECRET_KEY"],
    ["URL du site", SITE.url],
    ["Mot de passe admin", process.env.ADMIN_PASSWORD ? "Personnalisé (.env)" : "Défaut dev, à changer !"],
  ];
  return (
    <div>
      <PageTitle title="Réglages" />
      <div className="grid lg:grid-cols-2 gap-4">
        <Card title="Intégrations"><dl className="divide-y divide-white/10 text-sm">{rows.map(([k, v]) => <div key={k} className="py-2.5 flex justify-between gap-4"><dt className="text-white/60">{k}</dt><dd className="text-right">{v}</dd></div>)}</dl></Card>
        <Card title="Activer Stripe (recommandé)">
          <ol className="text-sm text-white/75 space-y-2 list-decimal pl-5">
            <li>Créer un compte sur stripe.com (association : statuts + RIB + pièce d'identité du représentant).</li><li>Developers → API keys → copier la clé secrète dans <code className="t-dot">STRIPE_SECRET_KEY</code>.</li><li>Developers → Webhooks → ajouter <code className="t-dot">https://votre-site/api/webhooks/stripe</code> (événements <code className="t-dot">checkout.session.completed</code>, <code className="t-dot">charge.refunded</code>) → copier le secret dans <code className="t-dot">STRIPE_WEBHOOK_SECRET</code>.</li><li>Redémarrer : le checkout redirige vers Stripe, le webhook passe la commande en « Payée ».</li>
          </ol>
        </Card>
        <Card title="Connecter Shopify (alternative)">
          <ol className="text-sm text-white/75 space-y-2 list-decimal pl-5">
            <li>Shopify Admin → Apps → Develop apps → créer « Smilin' Dancin' site ».</li><li>Activer Storefront API (lecture produits, panier) et Admin API (commandes, stocks).</li><li>Copier les tokens dans <code className="t-dot">.env.local</code> (voir <code className="t-dot">.env.example</code>).</li><li>Créer les produits avec les options Coupe / Impression / Couleur / Taille.</li><li>Passer <code className="t-dot">COMMERCE_PROVIDER=shopify</code> et redémarrer.</li>
          </ol>
          <p className="text-xs text-white/45 mt-4">Détails : src/lib/commerce/shopify.ts et README.md.</p>
        </Card>
        <Card title="Identité">
          <dl className="text-sm space-y-2"><div className="flex justify-between"><dt className="text-white/60">Marque</dt><dd>{SITE.name}</dd></div><div className="flex justify-between"><dt className="text-white/60">Instagram</dt><dd>@smilin.dancin</dd></div><div className="flex justify-between"><dt className="text-white/60">Billetterie</dt><dd>Shotgun</dd></div><div className="flex justify-between"><dt className="text-white/60">Association</dt><dd>HelloAsso</dd></div></dl>
          <p className="text-xs text-white/45 mt-4">Couleurs et typographies : src/app/globals.css (tokens) · DESIGN_SYSTEM.md</p>
        </Card>
      </div>
    </div>
  );
}
