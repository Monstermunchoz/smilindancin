"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
export function SearchForm({ initial = "" }: { initial?: string }) {
  const [q, setQ] = useState(initial);
  const router = useRouter();
  return (
    <form onSubmit={(e) => { e.preventDefault(); router.push(`/search?q=${encodeURIComponent(q)}`); }} className="flex gap-2 max-w-xl">
      <label htmlFor="q" className="sr-only">Rechercher</label>
      <input id="q" autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Sweat, together, blanc, bob…" className="flex-1 min-w-0 bg-white/5 border border-white/15 rounded-full px-5 py-3.5 text-sm outline-none focus:border-white" />
      <button className="btn btn-primary">Chercher</button>
    </form>
  );
}
