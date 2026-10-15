import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin/auth";
import { checkIn } from "@/lib/tickets/service";
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { code } = await req.json();
  return NextResponse.json(await checkIn(String(code ?? "")));
}
