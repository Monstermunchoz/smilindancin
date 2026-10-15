import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin/auth";
import { EVENTS } from "@/lib/data/events";
import { formatDate } from "@/lib/format";
import { PageTitle } from "@/components/admin/ui";
export default async function EventsAdmin() {
  if (!(await isAdmin())) redirect("/admin/login");
  return (
    <div>
      <PageTitle title="Événements" sub="Données dans src/lib/data/events.ts — éditables dans le code (ou via Shotgun pour la billetterie)." />
      <div className="overflow-x-auto border border-white/10 rounded-[4px]"><table className="w-full text-sm min-w-[600px]"><thead><tr className="t-label text-white/45 text-left border-b border-white/10"><th className="px-4 py-3">Événement</th><th className="px-4 py-3">Date</th><th className="px-4 py-3">Lieu</th><th className="px-4 py-3">Statut</th><th className="px-4 py-3">Line-up</th><th className="px-4 py-3">Billetterie</th></tr></thead>
        <tbody className="divide-y divide-white/10">{EVENTS.map((e) => <tr key={e.slug}><td className="px-4 py-2.5"><Link href={`/events/${e.slug}`} className="font-semibold hover:text-blue-sky">{e.title}</Link><p className="text-xs text-white/45">{e.edition}</p></td><td className="px-4 py-2.5 text-white/70">{formatDate(e.date)}</td><td className="px-4 py-2.5 text-white/70">{e.venue.name}</td><td className="px-4 py-2.5"><span className="rounded-full px-2.5 py-1 text-[11px] font-semibold bg-white/10">{e.status === "past" ? "Passé" : "À venir"}</span></td><td className="px-4 py-2.5 tabular-nums">{e.lineup.length}</td><td className="px-4 py-2.5"><a href={e.ticketUrl} target="_blank" rel="noreferrer" className="text-xs u-line">Ouvrir</a></td></tr>)}</tbody></table></div>
      <p className="text-xs text-white/45 mt-4">Prochaine étape : brancher l'API Shotgun (ou un CMS) pour gérer les événements sans toucher au code.</p>
    </div>
  );
}
