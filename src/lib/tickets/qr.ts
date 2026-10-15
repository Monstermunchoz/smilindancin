import "server-only";
import QRCode from "qrcode";
import { SITE } from "@/lib/site";
/** QR → URL de contrôle d'accès (l'équipe scanne avec un téléphone connecté à l'admin). */
export async function ticketQrSvg(code: string) {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? SITE.url;
  return QRCode.toString(`${base}/admin/checkin/${code}`, { type: "svg", margin: 1, errorCorrectionLevel: "M", color: { dark: "#0a0a0c", light: "#ffffff" } });
}
