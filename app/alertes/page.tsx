import { supabase } from "@/lib/supabase";
import { Component, DeliveryNote, InvoiceIn, InvoiceOut } from "@/lib/types";
import AlertsClient from "@/components/AlertsClient";

export const dynamic = "force-dynamic";

export interface EconomicAlert {
  key: string;
  title: string;
  body: string;
  severity: "high" | "medium";
}

export default async function AlertesPage() {
  const [
    { data: compData },
    { data: invoicesInData },
    { data: invoicesOutData },
    { data: dnData },
  ] = await Promise.all([
    supabase.from("components")
      .select("id,sku,name,tenant_id,category_code,station,stock_actual,reorder_noted,reorder_noted_at")
      .lt("stock_actual", 0)
      .order("stock_actual"),
    supabase.from("invoices_in").select("*").order("due_date"),
    supabase.from("invoices_out").select("*").order("due_date"),
    supabase.from("delivery_notes").select("*").eq("status", "pending_invoice").order("created_at"),
  ]);

  const now = Date.now();

  const FIVE_DAYS = 5 * 24 * 60 * 60 * 1000;
  const allComp = (compData ?? []) as (Component & { reorder_noted: boolean; reorder_noted_at: string | null })[];
  // Mostrar si: mai demanat, o demanat fa més de 5 dies
  const negatives = allComp.filter(c =>
    !c.reorder_noted_at || (now - new Date(c.reorder_noted_at).getTime() > FIVE_DAYS)
  );
  const noted = allComp.filter(c =>
    c.reorder_noted_at && (now - new Date(c.reorder_noted_at).getTime() <= FIVE_DAYS)
  );

  const allIn  = (invoicesInData  ?? []) as InvoiceIn[];
  const allOut = (invoicesOutData ?? []) as InvoiceOut[];

  const overdueInvoices = allIn.filter(inv =>
    inv.due_date && new Date(inv.due_date).getTime() < now && inv.status !== "paid"
  );

  const lateNotes = ((dnData ?? []) as DeliveryNote[]).filter(n =>
    (now - new Date(n.created_at).getTime()) >= 3 * 86400000
  );

  // ── Indicadors econòmics automàtics ──────────────────────────────
  const totalCobrat       = allOut.filter(i => i.status === "paid").reduce((s, i) => s + i.total_amount, 0);
  const totalPagat        = allIn.filter(i => i.status === "paid").reduce((s, i) => s + i.total_amount, 0);
  const totalPendentCobrar = allOut.filter(i => i.status !== "paid").reduce((s, i) => s + i.total_amount, 0);
  const totalPendentPagar  = allIn.filter(i => i.status !== "paid").reduce((s, i) => s + i.total_amount, 0);
  const cashflow = totalCobrat - totalPagat;

  // Factures emeses vençudes sense cobrar
  const overdueOut = allOut.filter(i =>
    i.due_date && new Date(i.due_date).getTime() < now && i.status !== "paid"
  );

  function fmt(n: number) {
    return n.toLocaleString("ca-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
  }

  const econAlerts: EconomicAlert[] = [];

  if (cashflow < 0) {
    econAlerts.push({
      key: "cashflow_negative",
      title: "Caixa neta negativa",
      body: `Has pagat ${fmt(totalPagat)} però només has cobrat ${fmt(totalCobrat)}. Diferència: ${fmt(cashflow)}.`,
      severity: "high",
    });
  }

  if (totalPendentPagar > totalPendentCobrar && totalPendentPagar > 1000) {
    econAlerts.push({
      key: "pagar_mes_que_cobrar",
      title: "Pendent de pagar supera pendent de cobrar",
      body: `Pendent pagar: ${fmt(totalPendentPagar)} · Pendent cobrar: ${fmt(totalPendentCobrar)}. Risc de tresoreria a curt termini.`,
      severity: "medium",
    });
  }

  if (overdueOut.length > 0) {
    const total = overdueOut.reduce((s, i) => s + i.total_amount, 0);
    econAlerts.push({
      key: "factures_emeses_vençudes",
      title: `${overdueOut.length} factura${overdueOut.length > 1 ? "es" : ""} emesa${overdueOut.length > 1 ? "es" : ""} vençuda${overdueOut.length > 1 ? "es" : ""} sense cobrar`,
      body: `Total pendent de cobrar vençut: ${fmt(total)}. Clients: ${[...new Set(overdueOut.map(i => i.client))].join(", ")}.`,
      severity: "high",
    });
  }

  if (overdueInvoices.length >= 3) {
    econAlerts.push({
      key: "moltes_factures_vençudes",
      title: "Acumulació de factures de compra vençudes",
      body: `Tens ${overdueInvoices.length} factures de proveïdors vençudes sense pagar. Risc de tensió amb proveïdors.`,
      severity: "medium",
    });
  }

  return (
    <AlertsClient
      negatives={negatives}
      noted={noted}
      overdueInvoices={overdueInvoices}
      lateNotes={lateNotes}
      econAlerts={econAlerts}
    />
  );
}
