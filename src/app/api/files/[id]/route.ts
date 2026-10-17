import { NextResponse } from "next/server";
import { getFile } from "@/lib/db";
import { isAdmin } from "@/lib/admin/auth";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const f = await getFile(id);
  if (!f) return new NextResponse("Introuvable", { status: 404 });
  if (f.private && !(await isAdmin())) return new NextResponse("Non autorisé", { status: 401 });
  const body = Buffer.from(f.data, "base64");
  return new NextResponse(body, {
    headers: {
      "Content-Type": f.type,
      "Content-Length": String(body.length),
      "Cache-Control": f.private ? "private, no-store" : "public, max-age=31536000, immutable",
      "Content-Disposition": `${f.type === "application/pdf" ? "inline" : "inline"}; filename="${encodeURIComponent(f.name)}"`,
      "X-Content-Type-Options": "nosniff",
    },
  });
}
