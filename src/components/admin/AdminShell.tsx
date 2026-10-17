"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/format";

/* Icônes au trait (24×24, stroke 1.8), cohérentes entre elles */
const P: Record<string, React.ReactNode> = {
  home: <><rect x="3" y="3" width="7.5" height="7.5" rx="2" /><rect x="13.5" y="3" width="7.5" height="7.5" rx="2" /><rect x="3" y="13.5" width="7.5" height="7.5" rx="2" /><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="2" /></>,
  orders: <><path d="M4 7.5 12 3l8 4.5v9L12 21l-8-4.5z" /><path d="M4 7.5 12 12l8-4.5M12 12v9" /></>,
  tickets: <><path d="M3 8.5V6a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v2.5a2.5 2.5 0 0 0 0 5V16a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-2.5a2.5 2.5 0 0 0 0-5Z" /><path d="M14 5v12" strokeDasharray="2 2.2" /></>,
  scan: <><path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3" /><path d="M7 12h10" /></>,
  more: <><circle cx="5" cy="12" r="1.6" /><circle cx="12" cy="12" r="1.6" /><circle cx="19" cy="12" r="1.6" /></>,
  products: <><path d="M8 3 4 6l2 4 2-1v12h8V9l2 1 2-4-4-3c-.5 1.5-2 2.5-4 2.5S8.5 4.5 8 3Z" /></>,
  stock: <><path d="M3 9h18M3 15h18M5 4h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" /></>,
  customers: <><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20c.8-3.5 3.4-5.5 6.5-5.5s5.7 2 6.5 5.5" /><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18.5 14.8c1.6.8 2.6 2.6 3 5.2" /></>,
  newsletter: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3.5 6.5 8.5 6.5 8.5-6.5" /></>,
  messages: <><path d="M4 5h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H9l-5 4v-4H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z" /></>,
  events: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></>,
  journal: <><path d="M5 4h11l3 3v13H5z" /><path d="M8 10h8M8 14h8M8 18h5" /></>,
  settings: <><circle cx="12" cy="12" r="3" /><path d="M12 2.5v3M12 18.5v3M21.5 12h-3M5.5 12h-3M18.7 5.3l-2.1 2.1M7.4 16.6l-2.1 2.1M18.7 18.7l-2.1-2.1M7.4 7.4 5.3 5.3" /></>,
  site: <><path d="M14 4h6v6M20 4l-9 9" /><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" /></>,
  logout: <><path d="M15 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4M10 17l5-5-5-5M15 12H3" /></>,
  invoices: <><path d="M6 3h12v18l-3-2-3 2-3-2-3 2z" /><path d="M9 8h6M9 12h6M9 16h3" /></>,
  sales: <><path d="M4 19V5M4 19h16" /><path d="m7 15 4-4 3 3 5-6" /></>,
};
function Icon({ name, className }: { name: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={cn("w-5 h-5 shrink-0", className)} aria-hidden>
      {P[name]}
    </svg>
  );
}

type Item = { href: string; label: string; short: string; icon: string; badge?: "orders" | "messages" };
const NAV: Item[] = [
  { href: "/admin", label: "Tableau de bord", short: "Accueil", icon: "home" },
  { href: "/admin/orders", label: "Commandes shop", short: "Commandes", icon: "orders", badge: "orders" },
  { href: "/admin/billetterie", label: "Billetterie", short: "Billets", icon: "tickets" },
  { href: "/admin/checkin", label: "Scanner", short: "Scanner", icon: "scan" },
  { href: "/admin/products", label: "Shop", short: "Shop", icon: "products" },
  { href: "/admin/ventes", label: "Merch vendu", short: "Ventes", icon: "sales" },
  { href: "/admin/factures", label: "Factures", short: "Factures", icon: "invoices" },
  { href: "/admin/stock", label: "Stock", short: "Stock", icon: "stock" },
  { href: "/admin/customers", label: "Clients", short: "Clients", icon: "customers" },
  { href: "/admin/newsletter", label: "Newsletter", short: "Newsletter", icon: "newsletter" },
  { href: "/admin/messages", label: "Messages", short: "Messages", icon: "messages", badge: "messages" },
  { href: "/admin/events", label: "Événements", short: "Événements", icon: "events" },
  { href: "/admin/journal", label: "Journal", short: "Journal", icon: "journal" },
  { href: "/admin/settings", label: "Réglages", short: "Réglages", icon: "settings" },
];
const TABS = NAV.slice(0, 4);
const MORE = NAV.slice(4);

export function AdminShell({ children, counts = { orders: 0, messages: 0 } }: { children: React.ReactNode; counts?: { orders: number; messages: number } }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sheet, setSheet] = useState(false);
  useEffect(() => setSheet(false), [pathname]);
  const isActive = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));
  const moreActive = MORE.some((i) => isActive(i.href));
  const badge = (i: Item) => (i.badge ? counts[i.badge] : 0);

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className="min-h-dvh bg-[#0d0d10] text-white lg:grid lg:grid-cols-[248px_1fr]">
      {/* ---------- PC : barre latérale ---------- */}
      <aside className="hidden lg:flex flex-col gap-6 border-r border-white/10 p-5 sticky top-0 h-dvh overflow-y-auto hide-scroll">
        <Link href="/admin" className="flex items-center gap-2">
          <Image src="/brand/wordmark.png" alt="Smilin' Dancin'" width={920} height={240} className="h-6 w-auto" />
          <span className="t-label text-white/40">Admin</span>
        </Link>
        <nav className="flex flex-col gap-1 flex-1">
          {NAV.map((i) => (
            <Link key={i.href} href={i.href} className={cn("flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-sm transition-colors", isActive(i.href) ? "bg-white text-black font-semibold" : "text-white/70 hover:bg-white/[.06] hover:text-white")}>
              <Icon name={i.icon} className="w-[18px] h-[18px]" />
              <span className="flex-1">{i.label}</span>
              {badge(i) > 0 && <span className="min-w-5 h-5 px-1.5 rounded-full bg-pink text-white text-[11px] font-bold grid place-items-center">{badge(i)}</span>}
            </Link>
          ))}
        </nav>
        <div className="flex flex-col gap-1 border-t border-white/10 pt-4">
          <Link href="/" className="flex items-center gap-3 px-3 py-2 text-sm text-white/55 hover:text-white"><Icon name="site" className="w-[18px] h-[18px]" />Voir le site</Link>
          <button onClick={logout} className="flex items-center gap-3 px-3 py-2 text-sm text-white/55 hover:text-pink text-left"><Icon name="logout" className="w-[18px] h-[18px]" />Déconnexion</button>
        </div>
      </aside>

      {/* ---------- Mobile / tablette : barre du haut ---------- */}
      <header className="lg:hidden sticky top-0 z-40 bg-[#0d0d10]/90 backdrop-blur-xl border-b border-white/10">
        <div className="h-16 px-5 flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-2.5">
            <Image src="/brand/wordmark.png" alt="Smilin' Dancin'" width={920} height={240} className="h-6 w-auto" />
            <span className="t-label text-[10px] text-white/45 border border-white/15 rounded-full px-2 py-0.5">Admin</span>
          </Link>
          <div className="flex items-center gap-1">
            <Link href="/" aria-label="Voir le site" className="w-10 h-10 grid place-items-center rounded-full text-white/70 hover:bg-white/10"><Icon name="site" /></Link>
            <button onClick={logout} aria-label="Déconnexion" className="w-10 h-10 grid place-items-center rounded-full text-white/70 hover:bg-white/10"><Icon name="logout" /></button>
          </div>
        </div>
      </header>

      <main className="p-5 md:p-8 lg:p-10 min-w-0 pb-[calc(7.5rem+env(safe-area-inset-bottom))] lg:pb-10">{children}</main>

      {/* ---------- Mobile / tablette : menu du bas ---------- */}
      <nav className="lg:hidden fixed z-50 inset-x-3 bottom-[calc(12px+env(safe-area-inset-bottom))]" aria-label="Navigation admin">
        <div className="mx-auto max-w-md grid grid-cols-5 gap-1 p-1.5 rounded-[26px] bg-[#16161b]/95 backdrop-blur-xl border border-white/10 shadow-[0_18px_50px_-12px_rgba(0,0,0,.8)]">
          {TABS.map((i) => {
            const on = isActive(i.href);
            return (
              <Link key={i.href} href={i.href} className={cn("relative flex flex-col items-center justify-center gap-1 h-[60px] rounded-[20px] text-[10.5px] font-semibold transition-colors", on ? "g-brand text-white shadow-[0_8px_24px_-8px_rgba(169,66,107,.9)]" : "text-white/60 active:bg-white/10")}>
                <Icon name={i.icon} className="w-[22px] h-[22px]" />
                {i.short}
                {badge(i) > 0 && <span className="absolute top-1.5 right-[18%] min-w-[18px] h-[18px] px-1 rounded-full bg-pink text-white text-[10px] font-bold grid place-items-center ring-2 ring-[#16161b]">{badge(i)}</span>}
              </Link>
            );
          })}
          <button onClick={() => setSheet((s) => !s)} aria-expanded={sheet} className={cn("relative flex flex-col items-center justify-center gap-1 h-[60px] rounded-[20px] text-[10.5px] font-semibold transition-colors", moreActive || sheet ? "bg-white text-black" : "text-white/60 active:bg-white/10")}>
            <Icon name="more" className="w-[22px] h-[22px]" />
            Plus
            {counts.messages > 0 && <span className="absolute top-1.5 right-[18%] min-w-[18px] h-[18px] px-1 rounded-full bg-pink text-white text-[10px] font-bold grid place-items-center ring-2 ring-[#16161b]">{counts.messages}</span>}
          </button>
        </div>
      </nav>

      {/* Feuille « Plus » */}
      <AnimatePresence>
        {sheet && (
          <>
            <motion.button aria-label="Fermer" className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSheet(false)} />
            <motion.div
              className="lg:hidden fixed z-50 inset-x-3 bottom-[calc(96px+env(safe-area-inset-bottom))] mx-auto max-w-md rounded-[26px] bg-[#16161b] border border-white/10 p-3 shadow-[0_24px_60px_-10px_rgba(0,0,0,.9)]"
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 420, damping: 34 }}
            >
              <div className="grid grid-cols-4 gap-1.5">
                {MORE.map((i) => (
                  <Link key={i.href} href={i.href} className={cn("relative flex flex-col items-center justify-center gap-1.5 aspect-square rounded-[18px] text-[10.5px] font-semibold text-center leading-tight px-1", isActive(i.href) ? "bg-white text-black" : "bg-white/[.04] text-white/80 active:bg-white/10")}>
                    <Icon name={i.icon} className="w-[22px] h-[22px]" />
                    {i.short}
                    {badge(i) > 0 && <span className="absolute top-2 right-2 min-w-[18px] h-[18px] px-1 rounded-full bg-pink text-white text-[10px] font-bold grid place-items-center">{badge(i)}</span>}
                  </Link>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
