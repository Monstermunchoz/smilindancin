import { Suspense } from "react";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin/auth";
import { readTable } from "@/lib/db";
import { commerce } from "@/lib/commerce";
import { EVENTS } from "@/lib/data/events";
import { PageTitle } from "@/components/admin/ui";
import { FinanceBoard } from "@/components/admin/FinanceBoard";

export default async function Factures() {
  if (!(await isAdmin())) redirect("/admin/login");
  const [invoices, suppliers, shipments, orders] = await Promise.all([readTable("invoices"), readTable("suppliers"), readTable("shipments"), commerce.listOrders()]);
  const lite = orders.map((o) => ({
    id: o.id,
    name: `${o.customer.firstName} ${o.customer.lastName}`.trim(),
    address: [o.shippingAddress.line1, o.shippingAddress.line2, `${o.shippingAddress.postalCode} ${o.shippingAddress.city}`].filter(Boolean).join(", "),
    status: o.status,
    items: o.lines.map((l) => `${l.quantity}× ${l.productTitle} (${l.variantTitle})`).join(", "),
    total: o.total.amount,
    createdAt: o.createdAt,
  }));
  return (
    <div>
      <PageTitle title="Factures" sub="Dépenses par poste, fournisseurs et envois, au même endroit." />
      <Suspense>
        <FinanceBoard invoices={invoices} suppliers={suppliers} shipments={shipments} orders={lite} events={EVENTS.map((e) => ({ slug: e.slug, title: e.title }))} />
      </Suspense>
    </div>
  );
}
