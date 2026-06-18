import { supabase } from "@/lib/supabase";
import { Component } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AlertesPage() {
  const { data } = await supabase
    .from("components")
    .select("id,sku,name,tenant_id,category_code,color_code,station,stock_actual")
    .lte("stock_actual", 0)
    .order("stock_actual");

  const rows = (data ?? []) as Component[];
  const negatives = rows.filter((c) => c.stock_actual < 0);
  const zeros = rows.filter((c) => c.stock_actual === 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Alertes</h1>
        <p className="text-[var(--muted)] text-sm">Components amb stock negatiu o a zero</p>
      </div>

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
              <td className="px-4 py-2 text-[var(--muted)]">{c.color_code ?? "—"}</td>
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
