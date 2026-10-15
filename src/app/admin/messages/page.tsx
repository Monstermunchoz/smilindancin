import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin/auth";
import { readTable } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { PageTitle, Empty } from "@/components/admin/ui";
export default async function Messages() {
  if (!(await isAdmin())) redirect("/admin/login");
  const list = await readTable("contact");
  return (
    <div>
      <PageTitle title="Messages" sub={`${list.length} message${list.length > 1 ? "s" : ""} via le formulaire de contact`} />
      {list.length === 0 ? <Empty text="Aucun message." /> : (
        <div className="space-y-3">{list.map((m) => <article key={m.id} className="border border-white/10 rounded-[4px] p-5"><div className="flex flex-wrap justify-between gap-2 mb-2"><p className="font-semibold">{m.name} <span className="text-white/50 font-normal">· {m.email}</span></p><p className="text-xs text-white/45">{formatDate(m.at, { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p></div><p className="t-label text-blue-sky mb-2">{m.subject}</p><p className="text-sm text-white/80 whitespace-pre-wrap">{m.message}</p><a href={`mailto:${m.email}?subject=Re: ${m.subject}`} className="inline-block mt-3 text-xs u-line">Répondre</a></article>)}</div>
      )}
    </div>
  );
}
