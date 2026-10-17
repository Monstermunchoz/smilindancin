/** Gestion : factures (dépenses), fournisseurs, envois. Montants en centimes. */
export const EXPENSE_CATEGORIES = [
  { id: "comm", label: "Comm", hint: "Graphisme, impression, pub, réseaux" },
  { id: "deco", label: "Déco", hint: "Scénographie, décor, fleurs, mobilier" },
  { id: "son", label: "Son & lumière", hint: "Sono, lumière, scène, technique" },
  { id: "artistes", label: "Artistes", hint: "Cachets, déplacements, hébergement" },
  { id: "lieu", label: "Lieu", hint: "Location, ménage, électricité" },
  { id: "merch", label: "Merch", hint: "Textile, impression DTF, broderie" },
  { id: "bar", label: "Bar & food", hint: "Boissons, food, consommables" },
  { id: "securite", label: "Sécurité", hint: "Agents, secours, assurances" },
  { id: "transport", label: "Transport & envois", hint: "Livraisons, navettes, Colissimo" },
  { id: "autre", label: "Autre", hint: "" },
] as const;
export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number]["id"];
export const catLabel = (id: string) => EXPENSE_CATEGORIES.find((c) => c.id === id)?.label ?? id;

export type Invoice = {
  id: string;
  number: string; // n° de facture fournisseur
  supplierId: string | null;
  supplierName: string;
  category: ExpenseCategory;
  event: string; // slug d'événement ou "" (général)
  label: string;
  date: string; // AAAA-MM-JJ
  dueDate: string;
  amountHT: number;
  vatRate: number; // 0, 5.5, 10, 20
  amountTTC: number;
  status: "a_payer" | "payee";
  paidAt: string | null;
  file: { url: string; name: string; type: string } | null;
  notes: string;
  createdAt: string;
};

export type Supplier = {
  id: string;
  name: string;
  category: ExpenseCategory;
  contact: string;
  email: string;
  phone: string;
  website: string;
  siret: string;
  address: string;
  notes: string;
  createdAt: string;
};

export type Shipment = {
  id: string;
  orderId: string; // commande shop liée (facultatif)
  recipient: string;
  address: string;
  carrier: "colissimo" | "mondial_relay" | "chronopost" | "ups" | "dhl" | "main_propre" | "autre";
  tracking: string;
  content: string;
  cost: number;
  date: string;
  status: "a_preparer" | "expedie" | "livre" | "retour";
  notes: string;
  createdAt: string;
};

export const CARRIERS: Record<Shipment["carrier"], { label: string; track?: (n: string) => string }> = {
  colissimo: { label: "Colissimo", track: (n) => `https://www.laposte.fr/outils/suivre-vos-envois?code=${encodeURIComponent(n)}` },
  mondial_relay: { label: "Mondial Relay", track: (n) => `https://www.mondialrelay.fr/suivi-de-colis/?numeroExpedition=${encodeURIComponent(n)}` },
  chronopost: { label: "Chronopost", track: (n) => `https://www.chronopost.fr/tracking-no-cms/suivi-page?listeNumerosLT=${encodeURIComponent(n)}` },
  ups: { label: "UPS", track: (n) => `https://www.ups.com/track?tracknum=${encodeURIComponent(n)}` },
  dhl: { label: "DHL", track: (n) => `https://www.dhl.com/fr-fr/home/suivi.html?tracking-id=${encodeURIComponent(n)}` },
  main_propre: { label: "Remise en main propre" },
  autre: { label: "Autre" },
};
export const SHIP_STATUS: Record<Shipment["status"], { label: string; cls: string }> = {
  a_preparer: { label: "À préparer", cls: "bg-yellow-400/15 text-yellow-300" },
  expedie: { label: "Expédié", cls: "bg-blue-sky/15 text-blue-sky" },
  livre: { label: "Livré", cls: "bg-emerald-400/15 text-emerald-300" },
  retour: { label: "Retour", cls: "bg-pink/15 text-pink" },
};
