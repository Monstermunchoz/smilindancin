import type { Metadata } from "next";
import { isAdmin } from "@/lib/admin/auth";
import { AdminShell } from "@/components/admin/AdminShell";
import { readTable } from "@/lib/db";
export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const ok = await isAdmin();
  if (!ok) return <div className="min-h-dvh bg-black">{children}</div>;
  let counts = { orders: 0, messages: 0 };
  try {
    const [orders, contact] = await Promise.all([readTable("orders"), readTable("contact")]);
    counts = { orders: orders.filter((o) => o.status === "paid" || o.status === "preparing").length, messages: contact.filter((m) => !m.read).length };
  } catch {}
  return <AdminShell counts={counts}>{children}</AdminShell>;
}
