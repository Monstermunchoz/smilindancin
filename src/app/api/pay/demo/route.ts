import { NextResponse } from "next/server";
import { commerce } from "@/lib/commerce";
import { getTicketOrder, markTicketOrderPaid, TicketError } from "@/lib/tickets/service";

/** PAIEMENT DE DÉMONSTRATION — aucune transaction réelle, aucune donnée bancaire reçue. */
export async function POST(req: Request) {
  const { kind, id, key } = await req.json();
  try {
    if (kind === "billets") {
      const o = await getTicketOrder(String(id));
      if (!o || o.accessKey !== key) return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });
      await markTicketOrderPaid(o.id, "demo");
      return NextResponse.json({ redirect: `/billets/${o.id}?k=${o.accessKey}&paid=1` });
    }
    if (kind === "commande") {
      const o = await commerce.getOrder(String(id));
      if (!o) return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });
      if (o.paymentStatus !== "paid") await commerce.updateOrder(o.id, { status: "paid", paymentStatus: "paid" }, "system");
      return NextResponse.json({ redirect: `/checkout/confirmation/${o.id}?paid=1` });
    }
    return NextResponse.json({ error: "Type inconnu" }, { status: 400 });
  } catch (e) {
    if (e instanceof TicketError) return NextResponse.json({ error: e.message }, { status: 400 });
    console.error(e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
