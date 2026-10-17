import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { isAdmin } from "@/lib/admin/auth";
import { putFile } from "@/lib/db";

const MAX = 4 * 1024 * 1024;
const OK = /^(image\/(jpeg|png|webp|avif|gif)|application\/pdf)$/;

/** Upload admin : photos produits (publiques) et factures (privées, réservées à l'admin). */
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "Aucun fichier" }, { status: 400 });
  if (!OK.test(file.type)) return NextResponse.json({ error: "Format accepté : JPG, PNG, WebP, GIF ou PDF" }, { status: 400 });
  if (file.size > MAX) return NextResponse.json({ error: "Fichier trop lourd (4 Mo max)" }, { status: 413 });
  const priv = form?.get("private") === "1";
  const id = randomUUID();
  const data = Buffer.from(await file.arrayBuffer()).toString("base64");
  await putFile({ id, name: file.name.slice(0, 160), type: file.type, size: file.size, private: priv, data, createdAt: new Date().toISOString() });
  return NextResponse.json({ url: `/api/files/${id}`, name: file.name, type: file.type, size: file.size });
}
