import "server-only";
import { cookies } from "next/headers";
import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { readTable, writeTable, withLock } from "@/lib/db";
import type { PublicUser, User } from "./types";

const COOKIE = "sd_user";
const secret = () => process.env.ADMIN_SESSION_SECRET ?? "dev-secret-change-me";
const sign = (v: string) => createHmac("sha256", secret() + ":user").update(v).digest("hex");

export const toPublic = ({ passwordHash: _p, salt: _s, ...u }: User): PublicUser => u;

function hash(password: string, salt: string) {
  return scryptSync(password, salt, 64).toString("hex");
}

export function sessionToken(userId: string) {
  const exp = Date.now() + 1000 * 60 * 60 * 24 * 30;
  const payload = `${userId}.${exp}`;
  return `${payload}.${sign(payload)}`;
}

export const USER_COOKIE = COOKIE;

export async function currentUser(): Promise<PublicUser | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  const [id, exp, sig] = token.split(".");
  if (!id || !exp || !sig) return null;
  const expected = sign(`${id}.${exp}`);
  if (expected.length !== sig.length || !timingSafeEqual(Buffer.from(expected), Buffer.from(sig)) || Number(exp) < Date.now()) return null;
  const users = await readTable("users");
  const u = users.find((x) => x.id === id);
  return u ? toPublic(u) : null;
}

export async function signup(input: { email: string; password: string; firstName: string; lastName: string }): Promise<{ user?: PublicUser; error?: string }> {
  const email = input.email.trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { error: "Email invalide." };
  if (input.password.length < 8) return { error: "Mot de passe : 8 caractères minimum." };
  if (!input.firstName.trim()) return { error: "Prénom requis." };
  return withLock(async () => {
    const users = await readTable("users");
    if (users.some((u) => u.email === email)) return { error: "Un compte existe déjà avec cet email." };
    const salt = randomBytes(16).toString("hex");
    const user: User = { id: `U${Date.now().toString(36)}${randomBytes(3).toString("hex")}`, email, firstName: input.firstName.trim(), lastName: input.lastName.trim(), salt, passwordHash: hash(input.password, salt), createdAt: new Date().toISOString() };
    users.push(user);
    await writeTable("users", users);
    return { user: toPublic(user) };
  });
}

export async function login(emailRaw: string, password: string): Promise<{ user?: PublicUser; error?: string }> {
  const email = emailRaw.trim().toLowerCase();
  const users = await readTable("users");
  const u = users.find((x) => x.email === email);
  if (!u) return { error: "Email ou mot de passe incorrect." };
  const a = Buffer.from(hash(password, u.salt), "hex");
  const b = Buffer.from(u.passwordHash, "hex");
  if (a.length !== b.length || !timingSafeEqual(a, b)) return { error: "Email ou mot de passe incorrect." };
  return { user: toPublic(u) };
}
