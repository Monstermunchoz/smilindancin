import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin/auth";
import { commerce } from "@/lib/commerce";
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json();
  if (body.variantId !== undefined && body.stock !== undefined) {
    const p = await commerce.setVariantStock(id, body.variantId, Number(body.stock));
    return p ? NextResponse.json({ product: p }) : NextResponse.json({ error: "not found" }, { status: 404 });
  }
  const allowed = ["title", "subtitle", "description", "status", "featured", "price"] as const;
  const patch: Record<string, unknown> = {};
  for (const k of allowed) if (body[k] !== undefined) patch[k] = body[k];
  const p = await commerce.updateProduct(id, patch);
  return p ? NextResponse.json({ product: p }) : NextResponse.json({ error: "not found" }, { status: 404 });
}
