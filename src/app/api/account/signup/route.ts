import { NextResponse } from "next/server";
import { signup, sessionToken, USER_COOKIE } from "@/lib/account/auth";
export async function POST(req: Request) {
  const b = await req.json();
  const r = await signup({ email: String(b.email ?? ""), password: String(b.password ?? ""), firstName: String(b.firstName ?? ""), lastName: String(b.lastName ?? "") });
  if (r.error || !r.user) return NextResponse.json({ error: r.error }, { status: 400 });
  const res = NextResponse.json({ user: r.user });
  res.cookies.set(USER_COOKIE, sessionToken(r.user.id), { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 30 });
  return res;
}
