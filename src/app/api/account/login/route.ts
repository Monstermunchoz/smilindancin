import { NextResponse } from "next/server";
import { login, sessionToken, USER_COOKIE } from "@/lib/account/auth";
export async function POST(req: Request) {
  const b = await req.json();
  const r = await login(String(b.email ?? ""), String(b.password ?? ""));
  if (r.error || !r.user) {
    await new Promise((x) => setTimeout(x, 300));
    return NextResponse.json({ error: r.error }, { status: 401 });
  }
  const res = NextResponse.json({ user: r.user });
  res.cookies.set(USER_COOKIE, sessionToken(r.user.id), { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 30 });
  return res;
}
