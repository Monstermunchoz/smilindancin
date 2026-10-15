"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/store/cart";
export default function CartPage() {
  const setOpen = useCart((s) => s.setOpen);
  const router = useRouter();
  useEffect(() => { setOpen(true); router.replace("/shop"); }, [setOpen, router]);
  return <div className="container-x pt-36 text-white/60">Ouverture du panier…</div>;
}
