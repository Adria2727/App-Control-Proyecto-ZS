import { supabase } from "@/lib/supabase";
import { Component, DeliveryNote } from "@/lib/types";

export const dynamic = "force-dynamic";

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("ca-ES", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function daysSince(dateStr: string) {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86_400_000);
}

export default async function AlertesPage() {
  const [{ data: compData }, { data: dnData }] = await Promise.all([
    supabase.from("components").select("id,sku,name,tenant_id,category_code,station,stock_actual").lte("stock_actual", 0).order("stock_actual"),
    supabase.from("delivery_notes").select("*").eq("status", "pending_invoice").order("created_at"),
  ]);

  const rows = (compData ?? []) as Component[];
  const negatives = rows.filter((c) => c.stock_actual < 0);
  const zeros = rows.filter((c) => c.stock_actual === 0);

  const lateNotes = ((dnData ?? []) as DeliveryNote[]).filter(n => daysSince(n.created_at) >= 3);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Alertes</h1>
        <p className="text-[var(--muted)] text-sm">Stock crític i albarans pendents de factura</p>
      </div>

      {/* ── Albarans sense factura ≥ 3 dies ── */}
      {lateNotes.length > 0 && (
        <div className="bg-[var(--card)] border border-amber-300 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-amber-200 bg-amber-50">
            <h2 className="font-semibold text-amber-800">Albarans sense factura +3 dies ({lateNotes.length})</h2>
            <p className="text-xs text-amber-600 mt-0.5">Revisar si cal reclamar la factura al proveïdor</p>
          </div>
          <table className="w-full text-sm">
            <tbody>
              {lateNotes.map(n => (
                <tr key={n.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--background)]">
                  <td className="px-4 py-2 font-mono text-xs font-medium">{n.number}</td>
                  <td className="px-4 py-2 font-medium">{n.supplier}</td>
                  <td className="px-4 py-2 text-[var(--muted)]">{fmtDate(n.note_date)}</td>
                  <td className="px-4 py-2 text-right tabular-nums text-[var(--muted)]">
                    {n.base_amount != null ? n.base_amount.toFixed(2) + " €" : "—"}
                  </td>
                  <td className="px-4 py-2 text-right">
                    <span className="text-xs px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 font-semibold">
                      {daysSince(n.created_at)} dies
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Section
        title={`Stock negatiu (${negatives.length})`}
        subtitle="Descuadres coneguts de comptabilitat de magatzem — revisar, no necessàriament falta real."
        rows={negatives}
      />
      <Section
        title={`A zero (${zeros.length})`}
        subtitle="Sense estoc. A Sunbba són sovint buits de model (marca en relançament)."
        rows={zeros}
      />
    </div>
  );
}

function Section({ title, subtitle, rows }: { title: string; subtitle: string; rows: Component[] }) {
  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-[var(--border)]">
        <h2 className="font-semibold">{title}</h2>
        <p className="text-xs text-[var(--muted)] mt-0.5">{subtitle}</p>
      </div>
      <table className="w-full text-sm">
        <tbody>
          {rows.map((c) => (
            <tr key={c.id} className="border-b border-[var(--border)] last:border-0">
              <td className="px-4 py-2">
                <span style={{ color: c.tenant_id === "BUMBBA" ? "var(--bumbba)" : "var(--sunbba)" }}>
                  {c.tenant_id === "BUMBBA" ? "Bumbba" : "Sunbba"}
                </span>
              </td>
              <td className="px-4 py-2 font-medium">{c.name}</td>

              <td className="px-4 py-2 text-[var(--muted)]">{c.category_code}</td>
              <td className="px-4 py-2 text-right font-semibold tabular-nums"
                  style={{ color: c.stock_actual < 0 ? "var(--negative)" : undefined }}>
                {c.stock_actual}
              </td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr><td className="px-4 py-4 text-center text-[var(--muted)]">Cap</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
