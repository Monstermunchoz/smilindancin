"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { NAV } from "@/lib/site";
import { useCart, cartCount } from "@/lib/store/cart";
import { cn } from "@/lib/format";

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);
  const lines = useCart((s) => s.lines);
  const setOpen = useCart((s) => s.setOpen);
  const [mounted, setMounted] = useState(false);
  const count = mounted ? cartCount(lines) : 0;

  useEffect(() => {
    setMounted(true);
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => setMenu(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = menu ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menu]);

  if (pathname?.startsWith("/admin")) return null;
  const onHome = pathname === "/";

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-[background-color,backdrop-filter,border-color] duration-500",
          scrolled || !onHome ? "bg-black/70 backdrop-blur-xl border-b border-white/8" : "bg-transparent border-b border-transparent",
        )}
      >
        <div className="container-x h-16 md:h-[72px] flex items-center justify-between gap-6">
          <Link href="/" aria-label="Smilin' Dancin' — accueil" className="shrink-0 flex items-center">
            <Image src="/brand/wordmark.png" alt="Smilin' Dancin'" width={920} height={240} priority className="h-7 md:h-8 w-auto" />
          </Link>

          <nav className="hidden lg:flex items-center gap-6 xl:gap-8" aria-label="Navigation principale">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} className={cn("t-label u-line py-2 transition-colors", pathname?.startsWith(n.href) ? "text-white" : "text-white/70 hover:text-white")}>
                {n.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2 md:gap-3">
            <Link href="/search" aria-label="Rechercher" className="p-2 text-white/80 hover:text-white transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
            </Link>
            <Link href="/compte" aria-label="Espace client" className="p-2 text-white/80 hover:text-white transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="8" r="4" /><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" /></svg>
            </Link>
            <button onClick={() => setOpen(true)} aria-label="Ouvrir le panier" className="relative p-2 text-white/80 hover:text-white transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8h12l-1 12H7L6 8Z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" /></svg>
              <AnimatePresence>
                {count > 0 && (
                  <motion.span
                    key={count}
                    initial={{ scale: 0.4, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.4, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 22 }}
                    className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-pink text-[10px] font-bold grid place-items-center"
                  >
                    {count}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
            <button onClick={() => setMenu((m) => !m)} aria-label="Menu" aria-expanded={menu} className="lg:hidden p-2 text-white">
              <span className="block w-6 h-[2px] bg-current mb-[6px] transition-transform" style={{ transform: menu ? "translateY(8px) rotate(45deg)" : "" }} />
              <span className="block w-6 h-[2px] bg-current transition-opacity" style={{ opacity: menu ? 0 : 1 }} />
              <span className="block w-6 h-[2px] bg-current mt-[6px] transition-transform" style={{ transform: menu ? "translateY(-8px) rotate(-45deg)" : "" }} />
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {menu && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-black/95 backdrop-blur-xl lg:hidden flex flex-col pt-24 pb-10 container-x overflow-y-auto"
          >
            <div className="absolute inset-0 neon-halo opacity-60 pointer-events-none" />
            <nav className="relative flex flex-col gap-2" aria-label="Navigation mobile">
              {NAV.map((n, i) => (
                <motion.div key={n.href} initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.05 + i * 0.06, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}>
                  <Link href={n.href} className="t-display block text-[clamp(40px,11vw,64px)] leading-[1] py-1 text-white active:text-pink transition-colors">
                    {n.label}
                  </Link>
                </motion.div>
              ))}
            </nav>
            <div className="relative mt-auto flex gap-6 t-label text-white/60">
              <a href="https://www.instagram.com/smilin.dancin/" target="_blank" rel="noreferrer">Instagram</a>
              <a href="https://shotgun.live/fr/venues/smilin-dancin" target="_blank" rel="noreferrer">Shotgun</a>
              <Link href="/contact">Contact</Link>
              <Link href="/compte">Mon compte</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
