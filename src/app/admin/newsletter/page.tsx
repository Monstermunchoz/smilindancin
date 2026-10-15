import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin/auth";
import { readTable } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { PageTitle, Empty } from "@/components/admin/ui";
export default async function NewsletterAdmin() {
  if (!(await isAdmin())) redirect("/admin/login");
  const list = await readTable("newsletter");
  return (
    <div>
      <PageTitle title="Newsletter" sub={`${list.length} inscrit·e·s`} action={list.length > 0 ? <a href={`data:text/csv;charset=utf-8,${encodeURIComponent("email,date,source\n" + list.map((x) => `${x.email},${x.at},${x.source}`).join("\n"))}`} download="newsletter.csv" className="btn btn-ghost !py-2.5">Exporter CSV</a> : undefined} />
      {list.length === 0 ? <Empty text="Aucun inscrit. Les inscriptions du site (footer, accueil, fiches « à venir ») apparaîtront ici." /> : (
        <div className="border border-white/10 rounded-[4px] divide-y divide-white/10">{list.map((x) => <div key={x.email} className="px-4 py-2.5 flex justify-between text-sm"><span>{x.email}</span><span className="text-white/50 text-xs">{x.source} · {formatDate(x.at)}</span></div>)}</div>
      )}
    </div>
  );
}
