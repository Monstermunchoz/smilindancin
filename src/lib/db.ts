/**
 * Mini base de données fichier (JSON) pour le mode local / démo.
 * - data/runtime/*.json est créé à la demande (ignoré par git).
 * - En production avec Shopify, les commandes/produits viennent de Shopify (voir lib/commerce/shopify.ts).
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import os from "node:os";
import type { Order, Product } from "@/lib/commerce/types";
import { PRODUCTS } from "@/lib/data/products";

/**
 * En local : data/runtime (persistant). Sur Vercel / serverless (disque en lecture seule) : dossier temporaire
 * — les données y sont ÉPHÉMÈRES (perdues à chaque redémarrage de fonction). En production, brancher Stripe
 * (commandes visibles dans le Dashboard Stripe) et/ou une base (Vercel Postgres, Supabase, Upstash…).
 */
const RUNTIME_DIR = process.env.SD_DATA_DIR ?? (process.env.VERCEL ? path.join(os.tmpdir(), "sd-runtime") : path.join(process.cwd(), "data", "runtime"));

type Tables = {
  orders: Order[];
  products: Product[];
  newsletter: { email: string; at: string; source: string }[];
  contact: { id: string; at: string; name: string; email: string; subject: string; message: string; read: boolean }[];
};

const defaults: Tables = { orders: [], products: PRODUCTS, newsletter: [], contact: [] };

let lock: Promise<void> = Promise.resolve();

async function ensureDir() {
  await fs.mkdir(RUNTIME_DIR, { recursive: true });
}

export async function readTable<K extends keyof Tables>(name: K): Promise<Tables[K]> {
  await ensureDir();
  const file = path.join(RUNTIME_DIR, `${name}.json`);
  try {
    const raw = await fs.readFile(file, "utf8");
    return JSON.parse(raw) as Tables[K];
  } catch {
    return structuredClone(defaults[name]) as Tables[K];
  }
}

export async function writeTable<K extends keyof Tables>(name: K, data: Tables[K]): Promise<void> {
  await ensureDir();
  const file = path.join(RUNTIME_DIR, `${name}.json`);
  const tmp = `${file}.${process.pid}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(data, null, 2), "utf8");
  await fs.rename(tmp, file);
}

/** Sérialise les écritures concurrentes (read-modify-write). */
export function withLock<T>(fn: () => Promise<T>): Promise<T> {
  const run = lock.then(fn, fn);
  lock = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

export async function nextOrderNumber(): Promise<number> {
  const orders = await readTable("orders");
  return orders.reduce((m, o) => Math.max(m, o.number), 0) + 1;
}

export async function resetRuntime(): Promise<void> {
  await ensureDir();
  for (const name of Object.keys(defaults)) {
    try {
      await fs.unlink(path.join(RUNTIME_DIR, `${name}.json`));
    } catch {}
  }
}
