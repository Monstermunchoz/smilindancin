/**
 * Stockage des données dynamiques (commandes, billets, comptes, stocks, newsletter, messages).
 *
 * - Production : Supabase (Postgres) — activé dès que POSTGRES_URL (intégration Vercel ↔ Supabase),
 *   DATABASE_URL ou SUPABASE_DB_URL est défini. La table `sd_kv` est créée automatiquement.
 * - Alternative : Upstash Redis (KV_REST_API_URL + KV_REST_API_TOKEN).
 * - Local : fichiers JSON dans data/runtime (ignoré par git).
 * - Vercel sans base : dossier temporaire (données éphémères — à éviter pour une démo).
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import os from "node:os";
import type { Order, Product } from "@/lib/commerce/types";
import type { Ticket, TicketOrder, TierSales } from "@/lib/tickets/types";
import type { User } from "@/lib/account/types";
import { PRODUCTS } from "@/lib/data/products";
import { AsyncLocalStorage } from "node:async_hooks";
import postgres from "postgres";

type Tables = {
  orders: Order[];
  products: Product[];
  newsletter: { email: string; at: string; source: string }[];
  contact: { id: string; at: string; name: string; email: string; subject: string; message: string; read: boolean }[];
  users: User[];
  tickets: Ticket[];
  ticketOrders: TicketOrder[];
  tierSales: TierSales;
};

const defaults: Tables = { orders: [], products: PRODUCTS, newsletter: [], contact: [], users: [], tickets: [], ticketOrders: [], tierSales: {} };

const REDIS_URL = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
const PG_URL = process.env.POSTGRES_URL ?? process.env.DATABASE_URL ?? process.env.SUPABASE_DB_URL;
export const dbMode: "postgres" | "redis" | "file" | "ephemeral" = PG_URL ? "postgres" : REDIS_URL && REDIS_TOKEN ? "redis" : process.env.VERCEL ? "ephemeral" : "file";

/* ---------- Postgres / Supabase ---------- */
type Sql = ReturnType<typeof postgres>;
const g = globalThis as unknown as { __sdSql?: Sql; __sdReady?: Promise<void> };
function pg(): Sql {
  if (!g.__sdSql) {
    // prepare:false → compatible avec le pooler Supabase (pgbouncer, mode transaction)
    g.__sdSql = postgres(PG_URL!.replace(/[?&]supa=[^&]*/, ""), { ssl: PG_URL!.includes("localhost") ? false : "require", prepare: false, max: Number(process.env.SD_PG_MAX ?? 3), idle_timeout: 20, connect_timeout: 15 });
  }
  return g.__sdSql;
}
async function pgReady() {
  if (!g.__sdReady) g.__sdReady = pg()`create table if not exists sd_kv (key text primary key, value jsonb not null, updated_at timestamptz not null default now())`.then(() => undefined);
  return g.__sdReady;
}
const txStore = new AsyncLocalStorage<postgres.TransactionSql>();
const q = () => (txStore.getStore() as unknown as Sql | undefined) ?? pg();

/** Une connexion coupée (pooler, mise en veille serverless) est retentée une fois. */
async function retry<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (e) {
    const code = (e as { code?: string }).code;
    if (!txStore.getStore() && (code === "ECONNRESET" || code === "CONNECTION_ENDED" || code === "CONNECTION_CLOSED" || code === "CONNECT_TIMEOUT")) {
      await new Promise((r) => setTimeout(r, 200));
      return fn();
    }
    throw e;
  }
}
const PREFIX = process.env.SD_DB_PREFIX ?? "sd:v1:";

const RUNTIME_DIR = process.env.SD_DATA_DIR ?? (process.env.VERCEL ? path.join(os.tmpdir(), "sd-runtime") : path.join(process.cwd(), "data", "runtime"));

async function redis<T>(command: (string | number)[]): Promise<T> {
  const res = await fetch(REDIS_URL!, {
    method: "POST",
    headers: { Authorization: `Bearer ${REDIS_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify(command),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Redis ${res.status}: ${await res.text()}`);
  const json = (await res.json()) as { result: T; error?: string };
  if (json.error) throw new Error(`Redis: ${json.error}`);
  return json.result;
}

export async function readTable<K extends keyof Tables>(name: K): Promise<Tables[K]> {
  if (dbMode === "postgres") {
    await pgReady();
    const rows = await retry(() => q()`select value from sd_kv where key = ${PREFIX + name}`);
    return rows.length ? (rows[0].value as Tables[K]) : (structuredClone(defaults[name]) as Tables[K]);
  }
  if (dbMode === "redis") {
    const raw = await redis<string | null>(["GET", PREFIX + name]);
    return raw ? (JSON.parse(raw) as Tables[K]) : (structuredClone(defaults[name]) as Tables[K]);
  }
  await fs.mkdir(RUNTIME_DIR, { recursive: true });
  try {
    return JSON.parse(await fs.readFile(path.join(RUNTIME_DIR, `${name}.json`), "utf8")) as Tables[K];
  } catch {
    return structuredClone(defaults[name]) as Tables[K];
  }
}

export async function writeTable<K extends keyof Tables>(name: K, data: Tables[K]): Promise<void> {
  if (dbMode === "postgres") {
    await pgReady();
    const json = q().json(data as unknown as postgres.JSONValue);
    await retry(() => q()`insert into sd_kv (key, value, updated_at) values (${PREFIX + name}, ${json}, now()) on conflict (key) do update set value = excluded.value, updated_at = now()`);
    return;
  }
  if (dbMode === "redis") {
    await redis(["SET", PREFIX + name, JSON.stringify(data)]);
    return;
  }
  await fs.mkdir(RUNTIME_DIR, { recursive: true });
  const file = path.join(RUNTIME_DIR, `${name}.json`);
  const tmp = `${file}.${process.pid}.${Date.now()}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(data), "utf8");
  await fs.rename(tmp, file);
}

/**
 * Sérialise les écritures (read-modify-write).
 * En mode Redis, un verrou distribué (SET NX PX) évite que deux fonctions serverless écrivent en même temps.
 */
let localLock: Promise<void> = Promise.resolve();
export function withLock<T>(fn: () => Promise<T>): Promise<T> {
  const run = localLock.then(() => (dbMode === "postgres" ? withPgLock(fn) : dbMode === "redis" ? withRedisLock(fn) : fn()));
  localLock = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

/** Transaction + verrou consultatif : lectures et écritures de fn() passent par la même transaction. */
async function withPgLock<T>(fn: () => Promise<T>): Promise<T> {
  if (txStore.getStore()) return fn();
  await pgReady();
  return (await pg().begin(async (tx) => {
    await tx`select pg_advisory_xact_lock(424242)`;
    return txStore.run(tx, fn);
  })) as T;
}

async function withRedisLock<T>(fn: () => Promise<T>): Promise<T> {
  const key = PREFIX + "lock";
  const id = Math.random().toString(36).slice(2);
  for (let i = 0; i < 40; i++) {
    const ok = await redis<string | null>(["SET", key, id, "NX", "PX", 8000]);
    if (ok === "OK") {
      try {
        return await fn();
      } finally {
        const cur = await redis<string | null>(["GET", key]);
        if (cur === id) await redis(["DEL", key]);
      }
    }
    await new Promise((r) => setTimeout(r, 150));
  }
  throw new Error("Base occupée, réessayez.");
}

export async function nextOrderNumber(): Promise<number> {
  const orders = await readTable("orders");
  return orders.reduce((m, o) => Math.max(m, o.number), 0) + 1;
}

export async function resetRuntime(): Promise<void> {
  for (const name of Object.keys(defaults) as (keyof Tables)[]) {
    if (dbMode === "postgres") await q()`delete from sd_kv where key = ${PREFIX + name}`;
    else if (dbMode === "redis") await redis(["DEL", PREFIX + name]);
    else {
      try {
        await fs.unlink(path.join(RUNTIME_DIR, `${name}.json`));
      } catch {}
    }
  }
}
