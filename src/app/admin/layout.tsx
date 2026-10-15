import type { Metadata } from "next";
import { isAdmin } from "@/lib/admin/auth";
import { AdminShell } from "@/components/admin/AdminShell";
export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const ok = await isAdmin();
  if (!ok) return <div className="min-h-dvh bg-black">{children}</div>;
  return <AdminShell>{children}</AdminShell>;
}
