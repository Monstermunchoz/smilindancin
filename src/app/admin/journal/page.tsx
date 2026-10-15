import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin/auth";
import { ARTICLES } from "@/lib/data/journal";
import { formatDate } from "@/lib/format";
import { PageTitle } from "@/components/admin/ui";
export default async function JournalAdmin() {
  if (!(await isAdmin())) redirect("/admin/login");
  return (
    <div>
      <PageTitle title="Journal" sub="Articles dans src/lib/data/journal.ts, prêts à migrer vers un CMS (Sanity, Payload, Notion…)." />
      <div className="border border-white/10 rounded-[4px] divide-y divide-white/10">{ARTICLES.map((a) => <div key={a.slug} className="px-4 py-3 flex flex-wrap justify-between gap-2 text-sm"><Link href={`/journal/${a.slug}`} className="font-semibold hover:text-blue-sky">{a.title}</Link><span className="text-xs text-white/50">{a.category} · {formatDate(a.date)} · {a.readingTime}</span></div>)}</div>
    </div>
  );
}
