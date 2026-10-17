import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { isAdmin } from "@/lib/admin/auth";
import { readTable, writeTable, withLock, deleteFile } from "@/lib/db";

type Kind = "invoices" | "suppliers" | "shipments";
const KINDS: Kind[] = ["invoices", "suppliers", "shipments"];
const str = (v: unknown, max = 500) => (typeof v === "string" ? v.slice(0, max).trim() : "");
const cents = (v: unknown) => Math.max(0, Math.round(Number(v) || 0));

function clean(kind: Kind, b: Record<string, unknown>) {
  if (kind === "suppliers") {
    return { name: str(b.name, 120), category: str(b.category, 20) || "autre", contact: str(b.contact, 120), email: str(b.email, 160), phone: str(b.phone, 40), website: str(b.website, 200), siret: str(b.siret, 20), address: str(b.address, 300), notes: str(b.notes, 2000) };
  }
  if (kind === "shipments") {
    return { orderId: str(b.orderId, 30), recipient: str(b.recipient, 160), address: str(b.address, 300), carrier: str(b.carrier, 20) || "colissimo", tracking: str(b.tracking, 60), content: str(b.content, 300), cost: cents(b.cost), date: str(b.date, 10), status: str(b.status, 20) || "a_preparer", notes: str(b.notes, 2000) };
  }
  const ht = cents(b.amountHT);
  const rate = [0, 5.5, 10, 20].includes(Number(b.vatRate)) ? Number(b.vatRate) : 20;
  const ttc = b.amountTTC !== undefined && b.amountTTC !== "" ? cents(b.amountTTC) : Math.round(ht * (1 + rate / 100));
  const status = b.status === "payee" ? "payee" : "a_payer";
  const file = b.file && typeof b.file === "object" ? { url: str((b.file as Record<string, unknown>).url, 120), name: str((b.file as Record<string, unknown>).name, 160), type: str((b.file as Record<string, unknown>).type, 60) } : null;
  return { number: str(b.number, 60), supplierId: str(b.supplierId, 60) || null, supplierName: str(b.supplierName, 120), category: str(b.category, 20) || "autre", event: str(b.event, 80), label: str(b.label, 200), date: str(b.date, 10), dueDate: str(b.dueDate, 10), amountHT: ht, vatRate: rate, amountTTC: ttc, status, paidAt: status === "payee" ? str(b.paidAt, 10) || new Date().toISOString().slice(0, 10) : null, file: file && file.url.startsWith("/api/files/") ? file : null, notes: str(b.notes, 2000) };
}

async function guard() {
  return (await isAdmin()) ? null : NextResponse.json({ error: "Non autorisé" }, { status: 401 });
}

export async function POST(req: Request) {
  const g = await guard(); if (g) return g;
  const b = await req.json().catch(() => ({}));
  const kind = b.kind as Kind;
  if (!KINDS.includes(kind)) return NextResponse.json({ error: "Type inconnu" }, { status: 400 });
  const data = clean(kind, b.data ?? {});
  if (kind === "suppliers" && !data.name) return NextResponse.json({ error: "Nom du fournisseur obligatoire" }, { status: 400 });
  if (kind === "invoices" && !(data as { supplierName: string }).supplierName && !(data as { label: string }).label) return NextResponse.json({ error: "Indique au moins un fournisseur ou un libellé" }, { status: 400 });
  const item = await withLock(async () => {
    const list = (await readTable(kind)) as unknown as Record<string, unknown>[];
    const it = { id: randomUUID(), createdAt: new Date().toISOString(), ...data };
    list.unshift(it);
    await writeTable(kind, list as never);
    return it;
  });
  return NextResponse.json({ item });
}

export async function PATCH(req: Request) {
  const g = await guard(); if (g) return g;
  const b = await req.json().catch(() => ({}));
  const kind = b.kind as Kind;
  if (!KINDS.includes(kind) || typeof b.id !== "string") return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
  const item = await withLock(async () => {
    const list = (await readTable(kind)) as unknown as Record<string, unknown>[];
    const i = list.findIndex((x) => x.id === b.id);
    if (i < 0) return null;
    list[i] = { ...list[i], ...clean(kind, { ...list[i], ...(b.data ?? {}) }) };
    await writeTable(kind, list as never);
    return list[i];
  });
  return item ? NextResponse.json({ item }) : NextResponse.json({ error: "Introuvable" }, { status: 404 });
}

export async function DELETE(req: Request) {
  const g = await guard(); if (g) return g;
  const { searchParams } = new URL(req.url);
  const kind = searchParams.get("kind") as Kind;
  const id = searchParams.get("id");
  if (!KINDS.includes(kind) || !id) return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
  const removed = await withLock(async () => {
    const list = (await readTable(kind)) as unknown as Record<string, unknown>[];
    const i = list.findIndex((x) => x.id === id);
    if (i < 0) return null;
    const [r] = list.splice(i, 1);
    await writeTable(kind, list as never);
    return r;
  });
  const f = (removed as { file?: { url?: string } } | null)?.file?.url;
  if (f?.startsWith("/api/files/")) await deleteFile(f.split("/").pop()!);
  return removed ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "Introuvable" }, { status: 404 });
}
