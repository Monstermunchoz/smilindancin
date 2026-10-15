"use client";
import { useState } from "react";
import { useToast } from "./Toaster";
export function ContactForm() {
  const [f, setF] = useState({ name: "", email: "", subject: "Commande merch", message: "" });
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");
  const push = useToast((s) => s.push);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!f.name || !f.email || !f.message) return push("Remplissez tous les champs.", "error");
    setState("loading");
    const r = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(f) });
    if (r.ok) { setState("done"); push("Message envoyé."); } else { setState("idle"); push("Envoi impossible.", "error"); }
  }
  if (state === "done") return <p className="border border-white/15 rounded-[3px] p-6">Merci, on vous répond vite 💙🩷</p>;
  const cls = "w-full bg-white/5 border border-white/15 rounded-[3px] px-4 py-3 text-sm outline-none focus:border-white";
  return (
    <form onSubmit={submit} className="space-y-4 max-w-xl">
      <div className="grid sm:grid-cols-2 gap-4">
        <div><label className="t-label text-white/55 block mb-1.5" htmlFor="c-name">Nom</label><input id="c-name" className={cls} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></div>
        <div><label className="t-label text-white/55 block mb-1.5" htmlFor="c-email">Email</label><input id="c-email" type="email" className={cls} value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></div>
      </div>
      <div><label className="t-label text-white/55 block mb-1.5" htmlFor="c-subject">Sujet</label>
        <select id="c-subject" className={cls} value={f.subject} onChange={(e) => setF({ ...f, subject: e.target.value })}>
          {["Commande merch", "Événement / billetterie", "Partenariat / exposant", "Presse", "Autre"].map((s) => <option key={s} className="bg-black">{s}</option>)}
        </select></div>
      <div><label className="t-label text-white/55 block mb-1.5" htmlFor="c-msg">Message</label><textarea id="c-msg" rows={6} className={cls} value={f.message} onChange={(e) => setF({ ...f, message: e.target.value })} /></div>
      <button disabled={state === "loading"} className="btn btn-primary">{state === "loading" ? "Envoi…" : "Envoyer"}</button>
    </form>
  );
}
