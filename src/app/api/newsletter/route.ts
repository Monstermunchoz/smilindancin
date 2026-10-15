import { NextResponse } from "next/server";
import { readTable, writeTable, withLock } from "@/lib/db";
export async function POST(req: Request) {
  const { email, source = "site" } = await req.json();
  if (typeof email !== "string" || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return NextResponse.json({ error: "Email invalide" }, { status: 400 });
  await withLock(async () => {
    const list = await readTable("newsletter");
    if (!list.some((x) => x.email.toLowerCase() === email.toLowerCase())) list.unshift({ email, at: new Date().toISOString(), source: String(source).slice(0, 80) });
    await writeTable("newsletter", list);
  });
  return NextResponse.json({ ok: true });
}
