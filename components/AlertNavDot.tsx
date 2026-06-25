import { supabase } from "@/lib/supabase";

export default async function AlertNavDot() {
  const [{ count: stockCount }, { count: invoiceCount }, { count: dnCount }, { count: econCount }] =
    await Promise.all([
      supabase.from("components").select("id", { count: "exact", head: true }).lt("stock_actual", 0).eq("reorder_noted", false),
      supabase.from("invoices_in").select("id", { count: "exact", head: true }).eq("status", "overdue"),
      supabase.from("delivery_notes").select("id", { count: "exact", head: true }).eq("status", "pending_invoice").lt("created_at", new Date(Date.now() - 3 * 86400000).toISOString()),
      supabase.from("economic_alerts").select("id", { count: "exact", head: true }).is("read_at", null),
    ]);

  const total = (stockCount ?? 0) + (invoiceCount ?? 0) + (dnCount ?? 0) + (econCount ?? 0);
  if (total === 0) return null;

  return (
    <span className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-bold text-white"
      style={{ background: "var(--negative)" }}>
      {total > 9 ? "9+" : total}
    </span>
  );
}
