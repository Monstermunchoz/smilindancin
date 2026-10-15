import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin/auth";
import { commerce } from "@/lib/commerce";
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await params;
  const patch = await req.json();
  const o = await commerce.updateOrder(id, patch, "admin");
  if (!o) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ order: o });
}
