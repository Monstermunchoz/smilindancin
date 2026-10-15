"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/format";

const nav = [
  ["/admin", "Tableau de bord", "◧"],
  ["/admin/orders", "Commandes", "▤"],
  ["/admin/products", "Produits", "▣"],
  ["/admin/stock", "Stock", "▥"],
  ["/admin/customers", "Clients", "◉"],
  ["/admin/newsletter", "Newsletter", "✉"],
  ["/admin/messages", "Messages", "◈"],
  ["/admin/events", "Événements", "◍"],
  ["/admin/journal", "Journal", "▦"],
  ["/admin/settings", "Réglages", "⚙"],
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }
  return (
    <div className="min-h-dvh bg-[#0d0d10] text-white grid lg:grid-cols-[240px_1fr]">
      <aside className="border-b lg:border-b-0 lg:border-r border-white/10 p-4 lg:p-5 flex lg:flex-col gap-4 lg:gap-6 overflow-x-auto hide-scroll lg:sticky lg:top-0 lg:h-dvh">
        <Link href="/admin" className="flex items-center gap-2 shrink-0">
          <Image src="/brand/wordmark.png" alt="Smilin' Dancin'" width={920} height={240} className="h-6 w-auto" />
          <span className="t-label text-white/40 hidden lg:inline">Admin</span>
        </Link>
        <nav className="flex lg:flex-col gap-1 flex-1">
          {nav.map(([href, label, icon]) => {
            const active = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
            return (
              <Link key={href} href={href} className={cn("flex items-center gap-3 rounded-[3px] px-3 py-2 text-sm whitespace-nowrap transition-colors", active ? "bg-white text-black font-semibold" : "text-white/70 hover:bg-white/8 hover:text-white")}>
                <span className="w-4 text-center opacity-70">{icon}</span>{label}
              </Link>
            );
          })}
        </nav>
        <div className="flex lg:flex-col gap-2 shrink-0">
          <Link href="/" className="text-xs text-white/50 hover:text-white">← Voir le site</Link>
          <button onClick={logout} className="text-xs text-white/50 hover:text-pink text-left">Déconnexion</button>
        </div>
      </aside>
      <main className="p-5 md:p-8 lg:p-10 min-w-0">{children}</main>
    </div>
  );
}
