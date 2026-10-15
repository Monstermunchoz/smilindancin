import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin/auth";
import { PageTitle } from "@/components/admin/ui";
import { Scanner } from "@/components/admin/Scanner";
/** Cible des QR codes : l'équipe scanne avec l'appareil photo d'un téléphone connecté à l'admin. */
export default async function CheckinCode({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  if (!(await isAdmin())) redirect(`/admin/login?next=/admin/checkin/${code}`);
  return (<div><PageTitle title="Contrôle d'accès" /><Scanner initialCode={code} /></div>);
}
