import "server-only";
import { localProvider } from "./local";
import { shopifyProvider, shopifyConfigured } from "./shopify";
import type { CommerceProvider } from "./provider";

/** Sélection du moteur commerce : local (JSON, démo sans paiement) ou Shopify. */
export function getCommerce(): CommerceProvider {
  if (process.env.COMMERCE_PROVIDER === "shopify" && shopifyConfigured) return shopifyProvider;
  return localProvider;
}

export const commerce = getCommerce();
export * from "./types";
export { CommerceError } from "./provider";
