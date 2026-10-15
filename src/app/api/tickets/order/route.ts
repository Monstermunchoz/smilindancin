import { NextResponse } from "next/server";
import { createTicketOrder, TicketError } from "@/lib/tickets/service";
export async function POST(req: Request) {
  try {
    const order = await createTicketOrder(await req.json());
    return NextResponse.json({ order: { id: order.id, accessKey: order.accessKey } });
  } catch (e) {
    if (e instanceof TicketError) return NextResponse.json({ error: e.message }, { status: 400 });
    console.error(e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
