import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin/auth";
import { updateTier } from "@/lib/tickets/service";
export async function PATCH(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const b = await req.json();
  const patch: { quota?: number; price?: number; closed?: boolean } = {};
  if (b.quota !== undefined) patch.quota = Math.max(0, Math.floor(Number(b.quota)));
  if (b.price !== undefined) patch.price = Math.max(0, Math.round(Number(b.price)));
  if (b.closed !== undefined) patch.closed = Boolean(b.closed);
  await updateTier(String(b.eventSlug), String(b.tierId), patch);
  return NextResponse.json({ ok: true });
}
