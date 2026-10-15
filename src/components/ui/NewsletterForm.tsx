"use client";
import { useState } from "react";
import { useToast } from "./Toaster";

export function NewsletterForm({ source = "site", light = false }: { source?: string; light?: boolean }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");
  const push = useToast((s) => s.push);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return push("Entrez une adresse email valide.", "error");
    setState("loading");
    const r = await fetch("/api/newsletter", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, source }) });
    if (r.ok) {
      setState("done");
      push("Inscrit·e. À très vite sur le dancefloor 💙🩷");
    } else {
      setState("idle");
      push("Impossible de vous inscrire pour le moment.", "error");
    }
  }
  if (state === "done") return <p className={`text-sm ${light ? "text-black" : "text-white"}`}>Merci, vous êtes sur la liste.</p>;
  return (
    <form onSubmit={submit} className="flex w-full max-w-md gap-2">
      <label className="sr-only" htmlFor={`nl-${source}`}>Email</label>
      <input
        id={`nl-${source}`}
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="ton@email.com"
        className={`flex-1 w-full min-w-0 rounded-full px-5 py-3.5 text-sm outline-none border transition-colors ${light ? "bg-white/70 border-black/15 text-black placeholder:text-black/40 focus:border-black" : "bg-white/5 border-white/15 text-white placeholder:text-white/35 focus:border-white/60"}`}
      />
      <button type="submit" disabled={state === "loading"} className={`btn ${light ? "btn-dark" : "btn-primary"} shrink-0 !px-5 sm:!px-[26px]`}>
        {state === "loading" ? "…" : "S'inscrire"}
      </button>
    </form>
  );
}
