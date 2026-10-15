import { NextResponse } from "next/server";
import { readTable, writeTable, withLock } from "@/lib/db";
export async function POST(req: Request) {
  const b = await req.json();
  const { name, email, subject, message } = b ?? {};
  if (!name || !email || !message) return NextResponse.json({ error: "Champs manquants" }, { status: 400 });
  await withLock(async () => {
    const list = await readTable("contact");
    list.unshift({ id: `MSG-${Date.now()}`, at: new Date().toISOString(), name: String(name).slice(0, 120), email: String(email).slice(0, 160), subject: String(subject ?? "").slice(0, 160), message: String(message).slice(0, 4000), read: false });
    await writeTable("contact", list);
  });
  return NextResponse.json({ ok: true });
}
