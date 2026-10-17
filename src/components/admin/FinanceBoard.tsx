"use client";
import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { EXPENSE_CATEGORIES, catLabel, CARRIERS, SHIP_STATUS, type Invoice, type Supplier, type Shipment } from "@/lib/admin/finance";
import { useToast } from "@/components/ui/Toaster";
import { cn, formatPrice } from "@/lib/format";
import { uploadFile } from "./ProductForm";

type OrderLite = { id: string; name: string; address: string; status: string; items: string; total: number; createdAt: string };
type Tab = "factures" | "fournisseurs" | "envois";
const today = () => new Date().toISOString().slice(0, 10);
const fmtDate = (d: string) => (d ? new Date(d + "T12:00:00").toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" }) : "");
const inp = "w-full bg-white/[.04] border border-white/15 rounded-[10px] px-3.5 py-3 text-[15px] outline-none focus:border-white/60 transition-colors";
const lbl = "t-label text-white/55 block mb-2";
const chip = (on: boolean) => cn("shrink-0 h-9 px-3.5 rounded-full text-[13px] font-semibold border transition-colors whitespace-nowrap", on ? "bg-white text-black border-white" : "border-white/15 text-white/70");

async function api(method: "POST" | "PATCH" | "DELETE", body: Record<string, unknown>) {
  const url = method === "DELETE" ? `/api/admin/finance?kind=${body.kind}&id=${body.id}` : "/api/admin/finance";
  const r = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: method === "DELETE" ? undefined : JSON.stringify(body) });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(d.error ?? "Erreur");
  return d;
}

function Sheet({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button aria-label="Fermer" className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div
            role="dialog"
            aria-label={title}
            className="fixed z-[70] inset-x-0 bottom-0 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[640px] max-h-[92dvh] overflow-y-auto overscroll-contain rounded-t-[24px] md:rounded-[24px] bg-[#131318] border border-white/10 p-5 md:p-7 pb-[calc(20px+env(safe-area-inset-bottom))]"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 30, opacity: 0 }}
            transition={{ type: "spring", stiffness: 420, damping: 36 }}
          >
            <div className="md:hidden mx-auto w-10 h-1 rounded-full bg-white/20 mb-4" />
            <div className="flex items-center justify-between gap-4 mb-5">
              <h2 className="t-display text-2xl">{title}</h2>
              <button onClick={onClose} aria-label="Fermer" className="w-10 h-10 rounded-full border border-white/15 grid place-items-center text-white/70">✕</button>
            </div>
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export function FinanceBoard({ invoices, suppliers, shipments, orders, events }: { invoices: Invoice[]; suppliers: Supplier[]; shipments: Shipment[]; orders: OrderLite[]; events: { slug: string; title: string }[] }) {
  const sp = useSearchParams();
  const router = useRouter();
  const push = useToast((s) => s.push);
  const [tab, setTab] = useState<Tab>(((sp.get("tab") as Tab) ?? "factures"));
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("all");
  const [pay, setPay] = useState<"all" | "a_payer" | "payee">("all");
  const [edit, setEdit] = useState<{ kind: Tab; item: Record<string, unknown> | null } | null>(null);
  const needle = q.trim().toLowerCase();
  const match = (o: object) => !needle || JSON.stringify(o).toLowerCase().includes(needle);

  const go = (t: Tab) => { setTab(t); setQ(""); router.replace(`/admin/factures?tab=${t}`, { scroll: false }); };

  const inv = useMemo(() => invoices.filter((i) => (cat === "all" || i.category === cat) && (pay === "all" || i.status === pay) && match(i)), [invoices, cat, pay, needle]); // eslint-disable-line react-hooks/exhaustive-deps
  const totalTTC = invoices.reduce((s, i) => s + i.amountTTC, 0);
  const due = invoices.filter((i) => i.status === "a_payer");
  const byCat = EXPENSE_CATEGORIES.map((c) => ({ ...c, total: invoices.filter((i) => i.category === c.id).reduce((s, i) => s + i.amountTTC, 0) })).filter((c) => c.total > 0).sort((a, b) => b.total - a.total);
  const sup = suppliers.filter((s) => (cat === "all" || s.category === cat) && match(s));
  const ship = shipments.filter(match);
  const toShip = orders.filter((o) => (o.status === "paid" || o.status === "preparing") && !shipments.some((s) => s.orderId === o.id));

  async function quick(kind: Tab, id: string, data: Record<string, unknown>) {
    try { await api("PATCH", { kind: kindKey(kind), id, data }); router.refresh(); } catch (e) { push((e as Error).message, "error"); }
  }

  return (
    <div>
      {/* Onglets */}
      <div className="flex gap-1 p-1 rounded-full bg-white/[.04] border border-white/10 w-full sm:w-fit mb-5">
        {([["factures", `Factures (${invoices.length})`], ["fournisseurs", `Fournisseurs (${suppliers.length})`], ["envois", `Envois (${shipments.length})`]] as [Tab, string][]).map(([t, l]) => (
          <button key={t} onClick={() => go(t)} className={cn("flex-1 sm:flex-none h-10 px-4 rounded-full text-[13px] font-semibold transition-colors whitespace-nowrap", tab === t ? "bg-white text-black" : "text-white/65")}>{l}</button>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <svg viewBox="0 0 24 24" className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={tab === "factures" ? "Rechercher : fournisseur, n°, libellé, montant…" : tab === "fournisseurs" ? "Rechercher : nom, contact, email, ville…" : "Rechercher : destinataire, n° de suivi, commande…"} className="w-full bg-white/[.04] border border-white/15 rounded-full pl-12 pr-5 h-12 text-[15px] outline-none focus:border-white/60" />
        </div>
        <button onClick={() => setEdit({ kind: tab, item: null })} className="btn btn-brand !py-3 shrink-0">+ {tab === "factures" ? "Nouvelle facture" : tab === "fournisseurs" ? "Nouveau fournisseur" : "Nouvel envoi"}</button>
      </div>

      {/* ---------- FACTURES ---------- */}
      {tab === "factures" && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
            <Kpi label="Dépenses TTC" value={formatPrice(totalTTC)} hint={`${invoices.length} facture(s)`} />
            <Kpi label="À payer" value={formatPrice(due.reduce((s, i) => s + i.amountTTC, 0))} hint={`${due.length} facture(s)`} tone="pink" onClick={() => setPay(pay === "a_payer" ? "all" : "a_payer")} active={pay === "a_payer"} />
            <Kpi label="Payées" value={formatPrice(totalTTC - due.reduce((s, i) => s + i.amountTTC, 0))} hint={`${invoices.length - due.length} facture(s)`} onClick={() => setPay(pay === "payee" ? "all" : "payee")} active={pay === "payee"} />
            <Kpi label="TVA récupérable" value={formatPrice(invoices.reduce((s, i) => s + (i.amountTTC - i.amountHT), 0))} hint="si assujetti" />
          </div>
          {byCat.length > 0 && (
            <div className="border border-white/10 rounded-[16px] p-4 mb-4 bg-white/[.02]">
              <p className="t-label text-white/50 mb-3">Par poste</p>
              <div className="space-y-2">
                {byCat.map((c) => (
                  <button key={c.id} onClick={() => setCat(cat === c.id ? "all" : c.id)} className={cn("w-full text-left grid grid-cols-[110px_1fr_auto] items-center gap-3 text-sm rounded-[8px] px-2 py-1 transition-colors", cat === c.id ? "bg-white/10" : "hover:bg-white/[.04]")}>
                    <span className="truncate">{c.label}</span>
                    <span className="h-2 rounded-full bg-white/10 overflow-hidden"><span className="block h-full g-brand" style={{ width: `${(c.total / Math.max(1, byCat[0].total)) * 100}%` }} /></span>
                    <span className="tabular-nums text-white/75">{formatPrice(c.total)}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          <CatChips cat={cat} setCat={setCat} />
          <div className="space-y-2 mt-4">
            {inv.map((i) => (
              <div key={i.id} className="flex items-center gap-3 border border-white/10 rounded-[14px] p-3.5 bg-white/[.02] hover:border-white/25 transition-colors">
                <button onClick={() => setEdit({ kind: "factures", item: i })} className="flex-1 min-w-0 text-left">
                  <p className="font-semibold truncate">{i.supplierName || "Sans fournisseur"} <span className="text-white/45 font-normal">· {i.label || "Facture"}</span></p>
                  <p className="text-xs text-white/50 mt-1 truncate">{fmtDate(i.date)}{i.number ? ` · n° ${i.number}` : ""} · <span className="text-blue-sky">{catLabel(i.category)}</span>{i.event ? ` · ${events.find((e) => e.slug === i.event)?.title ?? i.event}` : ""}</p>
                </button>
                {i.file && <a href={i.file.url} target="_blank" rel="noreferrer" className="hidden sm:inline-flex h-9 px-3 rounded-full border border-white/15 text-xs items-center gap-1.5 text-white/70 hover:text-white" title={i.file.name}>📎 Fichier</a>}
                <div className="text-right shrink-0">
                  <p className="tabular-nums font-semibold">{formatPrice(i.amountTTC)}</p>
                  <button onClick={() => quick("factures", i.id, { status: i.status === "payee" ? "a_payer" : "payee" })} className={cn("mt-1 text-[11px] font-semibold rounded-full px-2.5 py-1", i.status === "payee" ? "bg-emerald-400/15 text-emerald-300" : "bg-pink/15 text-pink")}>{i.status === "payee" ? "Payée" : "À payer"}</button>
                </div>
              </div>
            ))}
            {inv.length === 0 && <EmptyState text={invoices.length ? "Aucune facture ne correspond." : "Aucune facture. Ajoute la première avec son PDF ou sa photo."} />}
          </div>
        </>
      )}

      {/* ---------- FOURNISSEURS ---------- */}
      {tab === "fournisseurs" && (
        <>
          <CatChips cat={cat} setCat={setCat} />
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3 mt-4">
            {sup.map((s) => {
              const theirs = invoices.filter((i) => i.supplierId === s.id || (!i.supplierId && i.supplierName.toLowerCase() === s.name.toLowerCase()));
              return (
                <div key={s.id} className="border border-white/10 rounded-[16px] p-4 bg-white/[.02]">
                  <div className="flex items-start justify-between gap-3">
                    <button onClick={() => setEdit({ kind: "fournisseurs", item: s })} className="text-left min-w-0">
                      <p className="font-semibold truncate">{s.name}</p>
                      <p className="text-xs text-blue-sky mt-0.5">{catLabel(s.category)}</p>
                    </button>
                    <button onClick={() => { setQ(s.name); go("factures"); setQ(s.name); }} className="text-right shrink-0">
                      <p className="tabular-nums text-sm font-semibold">{formatPrice(theirs.reduce((t, i) => t + i.amountTTC, 0))}</p>
                      <p className="text-[11px] text-white/45">{theirs.length} facture(s)</p>
                    </button>
                  </div>
                  {s.contact && <p className="text-sm text-white/70 mt-3">{s.contact}</p>}
                  <div className="flex flex-wrap gap-2 mt-3">
                    {s.phone && <a href={`tel:${s.phone.replace(/\s/g, "")}`} className="h-9 px-3 rounded-full border border-white/15 text-xs inline-flex items-center">📞 {s.phone}</a>}
                    {s.email && <a href={`mailto:${s.email}`} className="h-9 px-3 rounded-full border border-white/15 text-xs inline-flex items-center max-w-full truncate">✉ {s.email}</a>}
                    {s.website && <a href={s.website.startsWith("http") ? s.website : `https://${s.website}`} target="_blank" rel="noreferrer" className="h-9 px-3 rounded-full border border-white/15 text-xs inline-flex items-center">Site ↗</a>}
                  </div>
                </div>
              );
            })}
          </div>
          {sup.length === 0 && <EmptyState text={suppliers.length ? "Aucun fournisseur ne correspond." : "Aucun fournisseur. Ajoute tes prestataires : imprimeur, déco, son, lieu, textile…"} />}
        </>
      )}

      {/* ---------- ENVOIS ---------- */}
      {tab === "envois" && (
        <>
          {toShip.length > 0 && (
            <div className="border border-pink/30 bg-pink/[.06] rounded-[16px] p-4 mb-4">
              <p className="t-label text-pink mb-3">Commandes à expédier ({toShip.length})</p>
              <div className="space-y-2">
                {toShip.map((o) => (
                  <div key={o.id} className="flex items-center gap-3 text-sm">
                    <Link href={`/admin/orders/${o.id}`} className="t-dot shrink-0 hover:text-blue-sky">{o.id}</Link>
                    <span className="flex-1 min-w-0 truncate text-white/75">{o.name} · {o.items}</span>
                    <button onClick={() => setEdit({ kind: "envois", item: { orderId: o.id, recipient: o.name, address: o.address, content: o.items, carrier: "colissimo", status: "a_preparer", date: today() } })} className="h-9 px-3.5 rounded-full bg-white text-black text-xs font-semibold shrink-0">Créer l'envoi</button>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="space-y-2">
            {ship.map((s) => {
              const c = CARRIERS[s.carrier];
              return (
                <div key={s.id} className="flex items-center gap-3 border border-white/10 rounded-[14px] p-3.5 bg-white/[.02]">
                  <button onClick={() => setEdit({ kind: "envois", item: s })} className="flex-1 min-w-0 text-left">
                    <p className="font-semibold truncate">{s.recipient || "Destinataire"} <span className="text-white/45 font-normal">· {c.label}</span></p>
                    <p className="text-xs text-white/50 mt-1 truncate">{fmtDate(s.date)}{s.orderId ? ` · ${s.orderId}` : ""}{s.content ? ` · ${s.content}` : ""}</p>
                  </button>
                  {s.tracking && (c.track ? <a href={c.track(s.tracking)} target="_blank" rel="noreferrer" className="hidden sm:inline-flex h-9 px-3 rounded-full border border-white/15 text-xs items-center t-dot">{s.tracking}</a> : <span className="hidden sm:inline t-dot text-xs text-white/60">{s.tracking}</span>)}
                  <select value={s.status} onChange={(e) => quick("envois", s.id, { status: e.target.value })} className={cn("shrink-0 appearance-none text-[11px] font-semibold rounded-full px-3 py-1.5 border-0 outline-none", SHIP_STATUS[s.status].cls)}>
                    {Object.entries(SHIP_STATUS).map(([k, v]) => <option key={k} value={k} className="bg-black text-white">{v.label}</option>)}
                  </select>
                </div>
              );
            })}
          </div>
          {ship.length === 0 && <EmptyState text={shipments.length ? "Aucun envoi ne correspond." : "Aucun envoi répertorié. Crée-les depuis les commandes à expédier ou à la main."} />}
        </>
      )}

      <Editor edit={edit} onClose={() => setEdit(null)} suppliers={suppliers} orders={orders} events={events} />
    </div>
  );
}

const kindKey = (t: Tab) => (t === "factures" ? "invoices" : t === "fournisseurs" ? "suppliers" : "shipments");

function Kpi({ label, value, hint, tone, onClick, active }: { label: string; value: string; hint?: string; tone?: "pink"; onClick?: () => void; active?: boolean }) {
  const C = onClick ? "button" : "div";
  return (
    <C onClick={onClick} className={cn("text-left border rounded-[16px] p-4 bg-white/[.02] transition-colors", active ? "border-white" : "border-white/10", onClick && "hover:border-white/30")}>
      <p className="t-label text-white/45">{label}</p>
      <p className={cn("t-dot text-2xl md:text-3xl mt-2 tabular-nums", tone === "pink" && "text-pink")}>{value}</p>
      {hint && <p className="text-xs text-white/45 mt-1">{hint}</p>}
    </C>
  );
}

function CatChips({ cat, setCat }: { cat: string; setCat: (c: string) => void }) {
  return (
    <div className="flex gap-2 overflow-x-auto hide-scroll -mx-5 px-5 md:mx-0 md:px-0">
      <button onClick={() => setCat("all")} className={chip(cat === "all")}>Tous les postes</button>
      {EXPENSE_CATEGORIES.map((c) => <button key={c.id} onClick={() => setCat(cat === c.id ? "all" : c.id)} className={chip(cat === c.id)}>{c.label}</button>)}
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return <p className="text-sm text-white/45 text-center py-12 border border-dashed border-white/10 rounded-[16px] mt-2">{text}</p>;
}

function Editor({ edit, onClose, suppliers, orders, events }: { edit: { kind: Tab; item: Record<string, unknown> | null } | null; onClose: () => void; suppliers: Supplier[]; orders: OrderLite[]; events: { slug: string; title: string }[] }) {
  const open = Boolean(edit);
  const kind = edit?.kind ?? "factures";
  const existing = edit?.item && typeof edit.item.id === "string" ? edit.item : null;
  const title = kind === "factures" ? (existing ? "Facture" : "Nouvelle facture") : kind === "fournisseurs" ? (existing ? "Fournisseur" : "Nouveau fournisseur") : existing ? "Envoi" : "Nouvel envoi";
  return (
    <Sheet open={open} onClose={onClose} title={title}>
      {edit && <EditorForm key={String(existing?.id ?? "new") + kind} kind={kind} item={edit.item} existing={Boolean(existing)} onDone={onClose} suppliers={suppliers} orders={orders} events={events} />}
    </Sheet>
  );
}

function EditorForm({ kind, item, existing, onDone, suppliers, orders, events }: { kind: Tab; item: Record<string, unknown> | null; existing: boolean; onDone: () => void; suppliers: Supplier[]; orders: OrderLite[]; events: { slug: string; title: string }[] }) {
  const router = useRouter();
  const push = useToast((s) => s.push);
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [up, setUp] = useState(false);
  const base: Record<string, unknown> =
    kind === "factures"
      ? { number: "", supplierId: "", supplierName: "", category: "comm", event: "", label: "", date: today(), dueDate: "", amountHT: 0, vatRate: 20, amountTTC: 0, status: "a_payer", file: null, notes: "" }
      : kind === "fournisseurs"
        ? { name: "", category: "comm", contact: "", email: "", phone: "", website: "", siret: "", address: "", notes: "" }
        : { orderId: "", recipient: "", address: "", carrier: "colissimo", tracking: "", content: "", cost: 0, date: today(), status: "a_preparer", notes: "" };
  const [f, setF] = useState<Record<string, unknown>>({ ...base, ...(item ?? {}) });
  const set = (k: string, v: unknown) => setF((s) => ({ ...s, [k]: v }));
  const euro = (k: string) => ((Number(f[k]) || 0) / 100).toString();
  const setEuro = (k: string, v: string) => set(k, Math.round((Number(v.replace(",", ".")) || 0) * 100));

  async function save() {
    setBusy(true);
    try {
      const data = { ...f };
      if (kind === "factures") {
        const s = suppliers.find((x) => x.id === data.supplierId);
        if (s) data.supplierName = s.name;
      }
      await api(existing ? "PATCH" : "POST", { kind: kindKey(kind), id: f.id, data });
      push("Enregistré.");
      router.refresh();
      onDone();
    } catch (e) {
      push((e as Error).message, "error");
    } finally {
      setBusy(false);
    }
  }
  async function del() {
    if (!window.confirm("Supprimer définitivement ?")) return;
    try { await api("DELETE", { kind: kindKey(kind), id: f.id }); push("Supprimé."); router.refresh(); onDone(); } catch (e) { push((e as Error).message, "error"); }
  }
  async function attach(file: File) {
    setUp(true);
    try { const r = await uploadFile(file, { private: true }); set("file", { url: r.url, name: r.name, type: r.type }); } catch (e) { push((e as Error).message, "error"); } finally { setUp(false); }
  }

  const file = f.file as Invoice["file"];
  return (
    <div className="space-y-4">
      {kind === "factures" && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 sm:col-span-1">
              <label className={lbl}>Fournisseur</label>
              <select className={inp} value={String(f.supplierId ?? "")} onChange={(e) => { const s = suppliers.find((x) => x.id === e.target.value); set("supplierId", e.target.value); if (s) setF((st) => ({ ...st, supplierId: s.id, supplierName: s.name, category: s.category })); }}>
                <option value="" className="bg-black">Saisie libre</option>
                {suppliers.map((s) => <option key={s.id} value={s.id} className="bg-black">{s.name}</option>)}
              </select>
            </div>
            <div className="col-span-2 sm:col-span-1"><label className={lbl}>Nom</label><input className={inp} value={String(f.supplierName ?? "")} onChange={(e) => set("supplierName", e.target.value)} placeholder="Ex. Imprimerie Lyon" disabled={Boolean(f.supplierId)} /></div>
          </div>
          <div><label className={lbl}>Libellé</label><input className={inp} value={String(f.label ?? "")} onChange={(e) => set("label", e.target.value)} placeholder="Ex. Flyers Mexico Show ×2000" /></div>
          <div>
            <label className={lbl}>Poste</label>
            <div className="flex flex-wrap gap-2">{EXPENSE_CATEGORIES.map((c) => <button key={c.id} type="button" onClick={() => set("category", c.id)} className={chip(f.category === c.id)}>{c.label}</button>)}</div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={lbl}>N° facture</label><input className={inp} value={String(f.number ?? "")} onChange={(e) => set("number", e.target.value)} /></div>
            <div><label className={lbl}>Événement</label><select className={inp} value={String(f.event ?? "")} onChange={(e) => set("event", e.target.value)}><option value="" className="bg-black">Général</option>{events.map((e) => <option key={e.slug} value={e.slug} className="bg-black">{e.title}</option>)}</select></div>
            <div><label className={lbl}>Date</label><input type="date" className={inp} value={String(f.date ?? "")} onChange={(e) => set("date", e.target.value)} /></div>
            <div><label className={lbl}>Échéance</label><input type="date" className={inp} value={String(f.dueDate ?? "")} onChange={(e) => set("dueDate", e.target.value)} /></div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div><label className={lbl}>Montant HT (€)</label><input inputMode="decimal" className={inp} value={euro("amountHT")} onChange={(e) => { setEuro("amountHT", e.target.value); const ht = Math.round((Number(e.target.value.replace(",", ".")) || 0) * 100); set("amountTTC", Math.round(ht * (1 + Number(f.vatRate) / 100))); }} /></div>
            <div><label className={lbl}>TVA</label><select className={inp} value={String(f.vatRate)} onChange={(e) => { set("vatRate", Number(e.target.value)); set("amountTTC", Math.round((Number(f.amountHT) || 0) * (1 + Number(e.target.value) / 100))); }}>{[20, 10, 5.5, 0].map((r) => <option key={r} value={r} className="bg-black">{r} %</option>)}</select></div>
            <div><label className={lbl}>TTC (€)</label><input inputMode="decimal" className={inp} value={euro("amountTTC")} onChange={(e) => setEuro("amountTTC", e.target.value)} /></div>
          </div>
          <div className="flex gap-2">
            {(["a_payer", "payee"] as const).map((s) => <button key={s} type="button" onClick={() => set("status", s)} className={cn("flex-1 h-11 rounded-full text-sm font-semibold border", f.status === s ? (s === "payee" ? "bg-emerald-400/20 border-emerald-300 text-emerald-200" : "bg-pink/20 border-pink text-pink") : "border-white/15 text-white/65")}>{s === "payee" ? "Payée" : "À payer"}</button>)}
          </div>
          <div>
            <label className={lbl}>Pièce jointe (PDF ou photo)</label>
            {file ? (
              <div className="flex items-center gap-3 border border-white/15 rounded-[12px] p-3">
                <span className="text-xl">{file.type === "application/pdf" ? "📄" : "🖼️"}</span>
                <a href={file.url} target="_blank" rel="noreferrer" className="flex-1 min-w-0 truncate text-sm u-line">{file.name}</a>
                <button type="button" onClick={() => set("file", null)} className="text-xs text-pink">Retirer</button>
              </div>
            ) : (
              <button type="button" onClick={() => fileRef.current?.click()} className="w-full h-24 rounded-[12px] border-2 border-dashed border-white/20 hover:border-white/50 text-sm text-white/60 transition-colors">{up ? "Envoi…" : "+ Joindre la facture (PDF, JPG, PNG · 4 Mo max)"}</button>
            )}
            <input ref={fileRef} type="file" accept="application/pdf,image/*" capture={undefined} hidden onChange={(e) => { const x = e.target.files?.[0]; if (x) attach(x); e.target.value = ""; }} />
          </div>
        </>
      )}

      {kind === "fournisseurs" && (
        <>
          <div><label className={lbl}>Nom *</label><input className={inp} value={String(f.name ?? "")} onChange={(e) => set("name", e.target.value)} placeholder="Ex. Atelier Brodeur Lyon" /></div>
          <div>
            <label className={lbl}>Poste</label>
            <div className="flex flex-wrap gap-2">{EXPENSE_CATEGORIES.map((c) => <button key={c.id} type="button" onClick={() => set("category", c.id)} className={chip(f.category === c.id)}>{c.label}</button>)}</div>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div><label className={lbl}>Contact</label><input className={inp} value={String(f.contact ?? "")} onChange={(e) => set("contact", e.target.value)} placeholder="Prénom Nom" /></div>
            <div><label className={lbl}>Téléphone</label><input type="tel" className={inp} value={String(f.phone ?? "")} onChange={(e) => set("phone", e.target.value)} /></div>
            <div><label className={lbl}>Email</label><input type="email" className={inp} value={String(f.email ?? "")} onChange={(e) => set("email", e.target.value)} /></div>
            <div><label className={lbl}>Site web</label><input className={inp} value={String(f.website ?? "")} onChange={(e) => set("website", e.target.value)} /></div>
            <div><label className={lbl}>SIRET</label><input inputMode="numeric" className={inp} value={String(f.siret ?? "")} onChange={(e) => set("siret", e.target.value)} /></div>
            <div><label className={lbl}>Adresse</label><input className={inp} value={String(f.address ?? "")} onChange={(e) => set("address", e.target.value)} /></div>
          </div>
        </>
      )}

      {kind === "envois" && (
        <>
          <div>
            <label className={lbl}>Commande liée</label>
            <select className={inp} value={String(f.orderId ?? "")} onChange={(e) => { const o = orders.find((x) => x.id === e.target.value); setF((s) => ({ ...s, orderId: e.target.value, ...(o ? { recipient: o.name, address: o.address, content: o.items } : {}) })); }}>
              <option value="" className="bg-black">Aucune (envoi libre)</option>
              {orders.map((o) => <option key={o.id} value={o.id} className="bg-black">{o.id} · {o.name}</option>)}
            </select>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div><label className={lbl}>Destinataire</label><input className={inp} value={String(f.recipient ?? "")} onChange={(e) => set("recipient", e.target.value)} /></div>
            <div><label className={lbl}>Date</label><input type="date" className={inp} value={String(f.date ?? "")} onChange={(e) => set("date", e.target.value)} /></div>
          </div>
          <div><label className={lbl}>Adresse</label><input className={inp} value={String(f.address ?? "")} onChange={(e) => set("address", e.target.value)} /></div>
          <div><label className={lbl}>Contenu</label><input className={inp} value={String(f.content ?? "")} onChange={(e) => set("content", e.target.value)} placeholder="Ex. 2 tees Groovers M + 1 bob" /></div>
          <div>
            <label className={lbl}>Transporteur</label>
            <div className="flex flex-wrap gap-2">{Object.entries(CARRIERS).map(([k, c]) => <button key={k} type="button" onClick={() => set("carrier", k)} className={chip(f.carrier === k)}>{c.label}</button>)}</div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={lbl}>N° de suivi</label><input className={cn(inp, "t-dot")} value={String(f.tracking ?? "")} onChange={(e) => set("tracking", e.target.value)} /></div>
            <div><label className={lbl}>Coût (€)</label><input inputMode="decimal" className={inp} value={euro("cost")} onChange={(e) => setEuro("cost", e.target.value)} /></div>
          </div>
          <div className="flex flex-wrap gap-2">{Object.entries(SHIP_STATUS).map(([k, v]) => <button key={k} type="button" onClick={() => set("status", k)} className={cn("h-10 px-4 rounded-full text-sm font-semibold border", f.status === k ? "border-white bg-white/10" : "border-white/15 text-white/65")}>{v.label}</button>)}</div>
        </>
      )}

      <div><label className={lbl}>Notes</label><textarea rows={3} className={inp} value={String(f.notes ?? "")} onChange={(e) => set("notes", e.target.value)} /></div>
      <div className="flex flex-col-reverse sm:flex-row gap-2 pt-2">
        {existing && <button onClick={del} className="btn btn-ghost !py-3.5 !text-pink !border-pink/40 sm:mr-auto">Supprimer</button>}
        <button onClick={save} disabled={busy || up} className="btn btn-brand !py-3.5 sm:min-w-[200px]">{busy ? "…" : existing ? "Enregistrer" : "Ajouter"}</button>
      </div>
    </div>
  );
}
