import { NextResponse } from "next/server";
import { checkPassword, makeSession, ADMIN_COOKIE } from "@/lib/admin/auth";
export async function POST(req: Request) {
  const { password } = await req.json();
  if (typeof password !== "string" || !checkPassword(password)) {
    await new Promise((r) => setTimeout(r, 400));
    return NextResponse.json({ error: "invalid" }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, makeSession(), { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 12 });
  return res;
}
