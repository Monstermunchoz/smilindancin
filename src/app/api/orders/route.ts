import { NextResponse } from "next/server";
import { commerce, CommerceError } from "@/lib/commerce";
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const order = await commerce.createOrder(body);
    return NextResponse.json({ order });
  } catch (e) {
    if (e instanceof CommerceError) return NextResponse.json({ error: e.message, code: e.code, details: e.details }, { status: 400 });
    console.error(e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
