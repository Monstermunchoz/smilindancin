"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/format";

export function AuthForms() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [f, setF] = useState({ email: "", password: "", firstName: "", lastName: "" });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const inp = "w-full bg-white/5 border border-white/15 rounded-[3px] px-4 py-3 outline-none focus:border-white";
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setErr("");
    const r = await fetch(`/api/account/${mode}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(f) });
    const d = await r.json();
    setLoading(false);
    if (!r.ok) return setErr(d.error ?? "Erreur");
    router.refresh();
  }
  return (
    <div className="max-w-md mx-auto">
      <div className="grid grid-cols-2 p-1 rounded-full border border-white/15 mb-8">
        {(["login", "signup"] as const).map((m) => (
          <button key={m} type="button" onClick={() => { setMode(m); setErr(""); }} className={cn("py-2.5 rounded-full text-xs font-bold uppercase tracking-[0.08em] transition-colors", mode === m ? "bg-white text-black" : "text-white/60")}>{m === "login" ? "Connexion" : "Créer un compte"}</button>
        ))}
      </div>
      <form onSubmit={submit} className="space-y-4">
        {mode === "signup" && (
          <div className="grid grid-cols-2 gap-3">
            <div><label htmlFor="a-fn" className="t-label text-white/55 block mb-1.5">Prénom</label><input id="a-fn" required autoComplete="given-name" className={inp} value={f.firstName} onChange={(e) => setF({ ...f, firstName: e.target.value })} /></div>
            <div><label htmlFor="a-ln" className="t-label text-white/55 block mb-1.5">Nom</label><input id="a-ln" autoComplete="family-name" className={inp} value={f.lastName} onChange={(e) => setF({ ...f, lastName: e.target.value })} /></div>
          </div>
        )}
        <div><label htmlFor="a-em" className="t-label text-white/55 block mb-1.5">Email</label><input id="a-em" type="email" required autoComplete="email" autoCapitalize="none" className={inp} value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></div>
        <div><label htmlFor="a-pw" className="t-label text-white/55 block mb-1.5">Mot de passe {mode === "signup" && <span className="normal-case tracking-normal">(8 caractères min.)</span>}</label><input id="a-pw" type="password" required minLength={mode === "signup" ? 8 : 1} autoComplete={mode === "signup" ? "new-password" : "current-password"} className={inp} value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} /></div>
        {err && <p className="text-sm text-pink">{err}</p>}
        <button disabled={loading} className="btn btn-primary w-full !py-4">{loading ? "…" : mode === "login" ? "Se connecter" : "Créer mon compte"}</button>
        <p className="text-xs text-white/45 text-center">Tes commandes et billets passés avec le même email apparaissent automatiquement.</p>
      </form>
    </div>
  );
}

export function LogoutButton() {
  const router = useRouter();
  return <button onClick={async () => { await fetch("/api/account/logout", { method: "POST" }); router.refresh(); }} className="btn btn-ghost !py-3">Déconnexion</button>;
}
