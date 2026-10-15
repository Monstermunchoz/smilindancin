import Link from "next/link";
import { Globe } from "@/components/ui/Globe";
export default function NotFound() {
  return (
    <div className="container-x min-h-[80svh] flex flex-col items-center justify-center text-center pt-24">
      <Globe size={220} id="nf" />
      <h1 className="m-center t-display text-[clamp(34px,10vw,140px)] leading-[0.85] mt-6">404</h1>
      <p className="text-white/65 mt-4 max-w-md">Cette page n'est pas sur le dancefloor. The real VIP, lui, y est.</p>
      <div className="flex gap-3 mt-8"><Link href="/shop" className="btn btn-primary">Le shop</Link><Link href="/" className="btn btn-ghost">Accueil</Link></div>
    </div>
  );
}
