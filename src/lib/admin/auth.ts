import "server-only";
import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "node:crypto";

const COOKIE = "sd_admin";
const secret = () => process.env.ADMIN_SESSION_SECRET ?? "dev-secret-change-me";
const password = () => process.env.ADMIN_PASSWORD ?? "smilin-admin";

function sign(payload: string) {
  return createHmac("sha256", secret()).update(payload).digest("hex");
}

export function makeSession(): string {
  const exp = Date.now() + 1000 * 60 * 60 * 12;
  const payload = `admin.${exp}`;
  return `${payload}.${sign(payload)}`;
}

export function verifySession(token?: string | null): boolean {
  if (!token) return false;
  const [who, exp, sig] = token.split(".");
  if (!who || !exp || !sig) return false;
  const expected = sign(`${who}.${exp}`);
  if (expected.length !== sig.length) return false;
  if (!timingSafeEqual(Buffer.from(expected), Buffer.from(sig))) return false;
  return Number(exp) > Date.now();
}

export function checkPassword(input: string): boolean {
  const a = Buffer.from(input);
  const b = Buffer.from(password());
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function isAdmin(): Promise<boolean> {
  const c = await cookies();
  return verifySession(c.get(COOKIE)?.value);
}

export const ADMIN_COOKIE = COOKIE;
