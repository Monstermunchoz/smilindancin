"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
export default function AdminLogin() {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setErr("");
    const r = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password: pw }) });
    setLoading(false);
    if (r.ok) { const next = new URLSearchParams(window.location.search).get("next"); router.push(next && next.startsWith("/admin") ? next : "/admin"); router.refresh(); } else setErr("Mot de passe incorrect.");
  }
  return (
    <div className="min-h-dvh grid place-items-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 neon-halo opacity-40 pointer-events-none" />
      <form onSubmit={submit} className="relative w-full max-w-sm border border-white/10 rounded-[4px] p-8 bg-black/60 backdrop-blur-xl space-y-5">
        <Image src="/brand/wordmark.png" alt="Smilin' Dancin'" width={920} height={240} className="h-8 w-auto" />
        <div><p className="t-display text-2xl">Espace admin</p><p className="text-xs text-white/50 mt-1">Commandes, produits, stock, événements.</p></div>
        <div>
          <label htmlFor="pw" className="t-label text-white/55 block mb-1.5">Mot de passe</label>
          <input id="pw" type="password" autoFocus value={pw} onChange={(e) => setPw(e.target.value)} className="w-full bg-white/5 border border-white/15 rounded-[3px] px-4 py-3 text-sm outline-none focus:border-white" />
          {err && <p className="text-xs text-pink mt-2">{err}</p>}
        </div>
        <button disabled={loading} className="btn btn-primary w-full">{loading ? "…" : "Se connecter"}</button>
        <p className="text-[11px] text-white/35">Mot de passe défini par ADMIN_PASSWORD dans .env.local (défaut dev : smilin-admin).</p>
      </form>
    </div>
  );
}
