import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin/auth";
import { readTable } from "@/lib/db";
import { PageTitle, Card } from "@/components/admin/ui";
import { Scanner } from "@/components/admin/Scanner";
import { formatDate } from "@/lib/format";
export default async function CheckinPage() {
  if (!(await isAdmin())) redirect("/admin/login");
  const tickets = await readTable("tickets");
  const used = tickets.filter((t) => t.status === "used").sort((a, b) => (b.checkedInAt ?? "").localeCompare(a.checkedInAt ?? ""));
  return (
    <div>
      <PageTitle title="Contrôle d'accès" sub={`${used.length} / ${tickets.filter((t) => t.status !== "cancelled").length} entrées validées`} />
      <div className="grid lg:grid-cols-[minmax(0,420px)_1fr] gap-6 items-start">
        <Scanner />
        <Card title="Dernières entrées">
          {used.length === 0 ? <p className="text-sm text-white/45">Aucune entrée scannée.</p> : (
            <ul className="divide-y divide-white/10 text-sm">{used.slice(0, 30).map((t) => <li key={t.id} className="py-2 flex justify-between gap-3"><span>{t.holderName} <span className="text-white/45">· {t.tierName}</span></span><span className="t-dot text-xs text-white/50">{formatDate(t.checkedInAt!, { hour: "2-digit", minute: "2-digit" })}</span></li>)}</ul>
          )}
        </Card>
      </div>
    </div>
  );
}
