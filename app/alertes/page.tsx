import { supabase } from "@/lib/supabase";
import { Component, DeliveryNote, InvoiceIn } from "@/lib/types";
import AlertsClient from "@/components/AlertsClient";

export const dynamic = "force-dynamic";

export interface EconomicAlert {
  id: number;
  title: string;
  body: string | null;
  created_at: string;
  read_at: string | null;
}

export default async function AlertesPage() {
  const [
    { data: compData },
    { data: invoiceData },
    { data: dnData },
    { data: econData },
  ] = await Promise.all([
    supabase.from("components")
      .select("id,sku,name,tenant_id,category_code,station,stock_actual,reorder_noted")
      .lt("stock_actual", 0)
      .order("stock_actual"),
    supabase.from("invoices_in")
      .select("*")
      .in("status", ["overdue", "pending"])
      .order("due_date"),
    supabase.from("delivery_notes")
      .select("*")
      .eq("status", "pending_invoice")
      .order("created_at"),
    supabase.from("economic_alerts")
      .select("*")
      .order("created_at", { ascending: false }),
  ]);

  const now = Date.now();
  const negatives = ((compData ?? []) as (Component & { reorder_noted: boolean })[])
    .filter(c => !c.reorder_noted);
  const noted     = ((compData ?? []) as (Component & { reorder_noted: boolean })[])
    .filter(c => c.reorder_noted);

  const overdueInvoices = ((invoiceData ?? []) as InvoiceIn[]).filter(inv => {
    if (!inv.due_date) return false;
    return new Date(inv.due_date).getTime() < now && inv.status !== "paid";
  });

  const lateNotes = ((dnData ?? []) as DeliveryNote[]).filter(n =>
    (now - new Date(n.created_at).getTime()) >= 3 * 86400000
  );

  const econAlerts = (econData ?? []) as EconomicAlert[];
  const unreadEcon = econAlerts.filter(a => !a.read_at);
  const readEcon   = econAlerts.filter(a => a.read_at);

  return (
    <AlertsClient
      negatives={negatives}
      noted={noted}
      overdueInvoices={overdueInvoices}
      lateNotes={lateNotes}
      unreadEcon={unreadEcon}
      readEcon={readEcon}
    />
  );
}
