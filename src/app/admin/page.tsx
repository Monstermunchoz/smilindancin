import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin/auth";
import { commerce } from "@/lib/commerce";
import { readTable, dbMode } from "@/lib/db";
import { ticketedEvents, tierViews } from "@/lib/tickets/service";
import { formatPrice, formatDate, cn } from "@/lib/format";
import { DualBars } from "@/components/admin/DualBars";
import { stripeConfigured } from "@/lib/stripe";

function Arrow() {
  return <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M9 6l6 6-6 6" /></svg>;
}

function Panel({ title, href, cta = "Détail", children, className }: { title: string; href?: string; cta?: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-[20px] border border-white/10 bg-white/[.025] p-5", className)}>
      <div className="flex items-center justify-between gap-3 mb-4">
        <h2 className="t-label text-white/55">{title}</h2>
        {href && <Link href={href} className="inline-flex items-center gap-1 text-xs font-semibold text-white/70 hover:text-white">{cta}<Arrow /></Link>}
      </div>
      {children}
    </section>
  );
}

export default async function Dashboard() {
  if (!(await isAdmin())) redirect("/admin/login");
  const [orders, products, messages, tOrders, tickets, sales, users, invoices] = await Promise.all([
    commerce.listOrders(), commerce.listProducts({ includeDrafts: true }), readTable("contact"), readTable("ticketOrders"), readTable("tickets"), readTable("tierSales"), readTable("users"), readTable("invoices"),
  ]);
  const shopPaid = orders.filter((o) => o.paymentStatus === "paid");
  const shopRevenue = shopPaid.reduce((s, o) => s + o.total.amount, 0);
  const tPaid = tOrders.filter((o) => o.status === "paid");
  const tRevenue = tPaid.reduce((s, o) => s + o.total, 0);
  const spend = invoices.reduce((s, i) => s + i.amountTTC, 0);
  const dueInvoices = invoices.filter((i) => i.status === "a_payer");
  const toShip = orders.filter((o) => o.status === "paid" || o.status === "preparing");
  const pendingTickets = tOrders.filter((o) => o.status === "pending_payment");
  const unread = messages.filter((m) => !m.read);
  const lowStock = products.flatMap((p) => p.variants.filter((v) => v.stock !== null && v.stock <= 2));
  const validTickets = tickets.filter((t) => t.status !== "cancelled");
  const checked = tickets.filter((t) => t.status === "used").length;

  // Places vendues, par événement et par tarif
  const events = ticketedEvents().map((e) => {
    const v = tierViews(e, sales);
    return { e, v, sold: v.reduce((n, t) => n + t.sold, 0), quota: v.reduce((n, t) => n + t.quota, 0) };
  });
  const seatsSold = events.reduce((n, x) => n + x.sold, 0);
  const seatsQuota = events.reduce((n, x) => n + x.quota, 0);

  // Merch vendu, par produit
  const merch = Object.values(
    shopPaid.flatMap((o) => o.lines).reduce<Record<string, { handle: string; title: string; image: string; qty: number; total: number }>>((acc, l) => {
      const r = (acc[l.productHandle] ??= { handle: l.productHandle, title: l.productTitle, image: l.image, qty: 0, total: 0 });
      r.qty += l.quantity;
      r.total += l.lineTotal.amount;
      return acc;
    }, {}),
  ).sort((a, b) => b.qty - a.qty);
  const pieces = merch.reduce((n, m) => n + m.qty, 0);
  const maxQty = Math.max(1, ...merch.map((m) => m.qty));

  const days = Array.from({ length: 14 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - (13 - i)); return d; });
  const chart = days.map((d) => {
    const k = d.toISOString().slice(0, 10);
    return { label: d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" }), shop: shopPaid.filter((o) => o.createdAt.slice(0, 10) === k).reduce((s, o) => s + o.total.amount, 0), tickets: tPaid.filter((o) => (o.paidAt ?? o.createdAt).slice(0, 10) === k).reduce((s, o) => s + o.total, 0) };
  });
  const feed = [
    ...orders.map((o) => ({ at: o.createdAt, kind: "Merch" as const, id: o.id, who: `${o.customer.firstName} ${o.customer.lastName}`, amount: o.total.amount, paid: o.paymentStatus === "paid", href: `/admin/orders/${o.id}` })),
    ...tOrders.map((o) => ({ at: o.createdAt, kind: "Billets" as const, id: o.id, who: `${o.firstName} ${o.lastName}`, amount: o.total, paid: o.status === "paid", href: `/admin/billetterie?order=${o.id}` })),
  ].sort((a, b) => b.at.localeCompare(a.at)).slice(0, 8);

  const todo = [
    { n: toShip.length, label: "commande(s) à expédier", href: "/admin/orders?status=paid", tone: "pink" },
    { n: dueInvoices.length, label: `facture(s) à payer · ${formatPrice(dueInvoices.reduce((s, i) => s + i.amountTTC, 0))}`, href: "/admin/factures?tab=factures", tone: "pink" },
    { n: pendingTickets.length, label: "paiement(s) de billets en attente", href: "/admin/billetterie", tone: "yellow" },
    { n: unread.length, label: "message(s) non lu(s)", href: "/admin/messages", tone: "blue" },
    { n: lowStock.length, label: "variante(s) en stock faible", href: "/admin/stock", tone: "yellow" },
  ].filter((t) => t.n > 0);

  const h = new Date().getHours();
  const hello = h < 6 ? "Bonne nuit" : h < 18 ? "Bonjour" : "Bonsoir";

  return (
    <div className="max-w-[1400px]">
      {/* En-tête */}
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <p className="text-sm text-white/50">{formatDate(new Date().toISOString(), { weekday: "long", day: "numeric", month: "long" })}</p>
          <h1 className="t-display text-3xl md:text-4xl mt-1">{hello} 👋</h1>
        </div>
        <div className="flex gap-2 overflow-x-auto hide-scroll -mx-5 px-5 md:mx-0 md:px-0 w-[calc(100%+2.5rem)] md:w-auto">
          <Link href="/admin/checkin" className="btn btn-brand !py-2.5 !px-4 shrink-0">Scanner</Link>
          <Link href="/admin/products/new" className="btn btn-ghost !py-2.5 !px-4 shrink-0">+ Produit</Link>
          <Link href="/admin/factures?tab=factures" className="btn btn-ghost !py-2.5 !px-4 shrink-0">+ Facture</Link>
        </div>
      </div>

      {/* Chiffres clés */}
      <section className="relative overflow-hidden rounded-[24px] g-brand grain p-6 md:p-8 mb-4">
        <div className="relative grid lg:grid-cols-[1.2fr_2fr] gap-6 items-end">
          <div>
            <p className="t-label text-white/80">Chiffre d'affaires encaissé</p>
            <p className="t-dot text-5xl md:text-6xl mt-2 tabular-nums">{formatPrice(shopRevenue + tRevenue)}</p>
            <p className="text-sm text-white/85 mt-2">Résultat après dépenses : <b className="tabular-nums">{formatPrice(shopRevenue + tRevenue - spend)}</b></p>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { l: "Billetterie", v: formatPrice(tRevenue), h: "/admin/billetterie" },
              { l: "Merch", v: formatPrice(shopRevenue), h: "/admin/ventes" },
              { l: "Dépenses", v: formatPrice(spend), h: "/admin/factures" },
            ].map((x) => (
              <Link key={x.l} href={x.h} className="rounded-[16px] bg-black/25 hover:bg-black/35 backdrop-blur px-3.5 py-3 transition-colors">
                <span className="flex items-center justify-between text-[11px] text-white/80">{x.l}<Arrow /></span>
                <span className="block t-dot text-lg md:text-2xl tabular-nums mt-1 truncate">{x.v}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* À faire */}
      {todo.length > 0 && (
        <section className="rounded-[20px] border border-white/10 bg-white/[.025] p-2 mb-4">
          <p className="t-label text-white/55 px-3 pt-2 pb-1">À faire</p>
          <ul>
            {todo.map((t) => (
              <li key={t.href + t.label}>
                <Link href={t.href} className="flex items-center gap-3 rounded-[14px] px-3 py-3 hover:bg-white/[.05] transition-colors">
                  <span className={cn("min-w-8 h-8 px-2 rounded-full grid place-items-center text-sm font-bold tabular-nums", t.tone === "pink" ? "bg-pink/20 text-pink" : t.tone === "yellow" ? "bg-yellow-400/15 text-yellow-300" : "bg-blue-sky/15 text-blue-sky")}>{t.n}</span>
                  <span className="flex-1 text-sm">{t.label}</span>
                  <span className="text-white/40"><Arrow /></span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Places vendues */}
        <Panel title="Places vendues" href="/admin/billetterie" cta="Billetterie">
          <div className="flex items-end justify-between gap-4 mb-5">
            <p><span className="t-dot text-4xl md:text-5xl tabular-nums">{seatsSold}</span><span className="text-white/45 text-lg"> / {seatsQuota}</span></p>
            <Link href="/admin/checkin" className="text-right">
              <span className="block text-xs text-white/50">Entrées validées</span>
              <span className="block t-dot text-xl tabular-nums">{checked}<span className="text-white/40 text-sm"> / {validTickets.length}</span></span>
            </Link>
          </div>
          <div className="space-y-5">
            {events.map(({ e, v, sold, quota }) => (
              <div key={e.slug}>
                <Link href={`/admin/billetterie?event=${e.slug}#${e.slug}`} className="flex items-center justify-between gap-3 mb-2 group">
                  <span className="font-semibold text-sm group-hover:text-blue-sky">{e.title}{e.ticketing?.demo ? <span className="text-white/40 font-normal"> · démo</span> : null}</span>
                  <span className="text-xs text-white/55 tabular-nums">{Math.round((sold / Math.max(1, quota)) * 100)} %</span>
                </Link>
                <div className="space-y-1">
                  {v.map((t) => (
                    <Link key={t.id} href={`/admin/billetterie?event=${e.slug}&tier=${t.id}#${e.slug}`} className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-3 gap-y-1.5 rounded-[12px] px-3 py-2.5 hover:bg-white/[.05] transition-colors">
                      <span className="text-sm truncate">{t.name} <span className="text-white/40">{formatPrice(t.price)}</span></span>
                      <span className="text-xs tabular-nums text-white/70 flex items-center gap-1.5">{t.sold}/{t.quota}{t.status === "sold_out" && <span className="text-pink font-semibold">complet</span>}<span className="text-white/35"><Arrow /></span></span>
                      <span className="col-span-2 h-1.5 bg-white/10 rounded-full overflow-hidden"><span className="block h-full g-brand" style={{ width: `${t.progress * 100}%` }} /></span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Panel>

        {/* Merch vendu */}
        <Panel title="Merch vendu" href="/admin/ventes" cta="Tout le détail">
          <div className="flex items-end justify-between gap-4 mb-5">
            <p><span className="t-dot text-4xl md:text-5xl tabular-nums">{pieces}</span><span className="text-white/45 text-lg"> pièce{pieces > 1 ? "s" : ""}</span></p>
            <Link href="/admin/orders" className="text-right">
              <span className="block text-xs text-white/50">Commandes payées</span>
              <span className="block t-dot text-xl tabular-nums">{shopPaid.length}</span>
            </Link>
          </div>
          {merch.length === 0 ? (
            <div className="text-center py-8 text-sm text-white/45">Aucune pièce vendue pour l'instant.<br /><Link href="/admin/products" className="u-line text-white/70">Gérer le shop</Link></div>
          ) : (
            <ul className="space-y-1">
              {merch.slice(0, 6).map((m) => (
                <li key={m.handle}>
                  <Link href={`/admin/orders?q=${encodeURIComponent(m.handle)}`} className="flex items-center gap-3 rounded-[12px] px-2 py-2 hover:bg-white/[.05] transition-colors">
                    <span className="relative w-10 aspect-[4/5] rounded-[8px] overflow-hidden bg-ink-2 shrink-0">{m.image && <Image src={m.image} alt="" fill sizes="40px" className="object-cover" />}</span>
                    <span className="flex-1 min-w-0">
                      <span className="block text-sm truncate">{m.title}</span>
                      <span className="block h-1.5 bg-white/10 rounded-full overflow-hidden mt-1.5"><span className="block h-full g-brand" style={{ width: `${(m.qty / maxQty) * 100}%` }} /></span>
                    </span>
                    <span className="text-right shrink-0">
                      <span className="block text-sm font-semibold tabular-nums">{m.qty}</span>
                      <span className="block text-[11px] text-white/50 tabular-nums">{formatPrice(m.total)}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-4 mt-4">
        <Panel title="Ventes, 14 derniers jours"><DualBars data={chart} format={(v) => formatPrice(v)} /></Panel>
        <Panel title="Activité récente">
          {feed.length === 0 ? <p className="text-sm text-white/45 py-6 text-center">Aucune vente pour l'instant.</p> : (
            <ul className="space-y-1 -mx-2">
              {feed.map((f) => (
                <li key={f.id}>
                  <Link href={f.href} className="flex items-center gap-3 rounded-[12px] px-2 py-2.5 hover:bg-white/[.05] transition-colors">
                    <span className={cn("w-9 h-9 rounded-full grid place-items-center text-xs font-bold shrink-0", f.kind === "Merch" ? "bg-blue/40 text-blue-sky" : "bg-pink/25 text-pink")}>{f.kind === "Merch" ? "M" : "B"}</span>
                    <span className="flex-1 min-w-0">
                      <span className="block text-sm truncate">{f.who}</span>
                      <span className="block text-[11px] text-white/45">{f.kind} · {formatDate(f.at, { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                    </span>
                    <span className="text-right shrink-0">
                      <span className="block text-sm tabular-nums font-semibold">{formatPrice(f.amount)}</span>
                      <span className={cn("block text-[11px]", f.paid ? "text-emerald-300" : "text-yellow-300")}>{f.paid ? "Payé" : "En attente"}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
        {[
          { l: "Produits en vente", v: products.filter((p) => p.status === "active").length, h: "/admin/products" },
          { l: "Clients inscrits", v: users.length, h: "/admin/customers" },
          { l: "Fournisseurs", v: (await readTable("suppliers")).length, h: "/admin/factures?tab=fournisseurs" },
          { l: "Envois", v: (await readTable("shipments")).length, h: "/admin/factures?tab=envois" },
        ].map((x) => (
          <Link key={x.l} href={x.h} className="rounded-[20px] border border-white/10 bg-white/[.025] hover:border-white/25 p-4 transition-colors">
            <span className="flex items-center justify-between text-xs text-white/55">{x.l}<Arrow /></span>
            <span className="block t-dot text-3xl tabular-nums mt-2">{x.v}</span>
          </Link>
        ))}
      </div>

      <p className="text-[11px] text-white/35 mt-6">Paiement {stripeConfigured ? "Stripe" : "démo"} · données {dbMode === "postgres" ? "Supabase" : dbMode === "redis" ? "Upstash Redis" : dbMode === "file" ? "locales" : "éphémères (connecter Supabase)"}</p>
    </div>
  );
}
