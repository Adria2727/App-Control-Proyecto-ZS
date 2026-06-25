import { supabase } from "@/lib/supabase";
import { InvoiceOut, InvoiceIn, DeliveryNote } from "@/lib/types";
import { normalizeInvoices } from "@/lib/invoice-utils";
import InvoiceUploadModal from "@/components/InvoiceUploadModal";
import InvoicesInTable from "@/components/InvoicesInTable";
import DeliveryNoteModal from "@/components/DeliveryNoteModal";
import DeliveryNotesTable from "@/components/DeliveryNotesTable";

export const dynamic = "force-dynamic";

const TODAY = new Date("2026-06-18");

function fmt(n: number) {
  return n.toLocaleString("ca-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
}

function daysTo(dateStr: string) {
  return Math.round((new Date(dateStr).getTime() - TODAY.getTime()) / 86_400_000);
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("ca-ES", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, [string, string, string]> = {
    paid:    ["#16a34a", "#dcfce7", "pagat"],
    pending: ["#b45309", "#fef3c7", "pendent"],
    overdue: ["#dc2626", "#fee2e2", "vençut"],
    partial: ["#7c3aed", "#ede9fe", "parcial"],
  };
  const [color, bg, label] = map[status] ?? map.pending;
  return (
    <span className="text-xs px-2 py-0.5 rounded-md font-medium" style={{ color, background: bg }}>
      {label}
    </span>
  );
}

function KpiCard({ label, value, sub, color }: { label: string; value: number; sub?: string; color?: string }) {
  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4">
      <p className="text-sm text-[var(--muted)]">{label}</p>
      <p className="text-xl font-bold tabular-nums mt-1" style={{ color: color ?? "var(--foreground)" }}>
        {fmt(value)}
      </p>
      {sub && <p className="text-xs text-[var(--muted)] mt-0.5">{sub}</p>}
    </div>
  );
}

export default async function FinancesPage() {
  const [{ data: outData }, { data: inData }, { data: dnData }, { data: compData }] = await Promise.all([
    supabase.from("invoices_out").select("*").order("invoice_date"),
    supabase.from("invoices_in").select("*").order("due_date"),
    supabase.from("delivery_notes").select("*").order("note_date", { ascending: false }),
    supabase.from("components").select("id,sku,name,tenant_id"),
  ]);

  const deliveryNotes = (dnData ?? []) as DeliveryNote[];
  const components = (compData ?? []) as { id: number; sku: string; name: string; tenant_id: string }[];

  const invoicesOut = normalizeInvoices((outData ?? []) as InvoiceOut[]);
  const invoicesIn  = normalizeInvoices((inData  ?? []) as InvoiceIn[]);

  // ── Càlculs ingressos ──────────────────────────────────────────────
  const totalFacturat     = invoicesOut.reduce((s, i) => s + i.total_amount, 0);
  const totalCobrat       = invoicesOut.filter(i => i.status === "paid").reduce((s, i) => s + i.total_amount, 0);
  const totalPendentCobrar = invoicesOut.filter(i => i.status !== "paid").reduce((s, i) => s + i.total_amount, 0);

  // ── Càlculs despeses ───────────────────────────────────────────────
  const totalCompres      = invoicesIn.reduce((s, i) => s + i.total_amount, 0);
  const totalPagat        = invoicesIn.filter(i => i.status === "paid").reduce((s, i) => s + i.total_amount, 0);
  const totalPendentPagar = invoicesIn.filter(i => i.status !== "paid").reduce((s, i) => s + i.total_amount, 0);

  // ── Tresoreria ─────────────────────────────────────────────────────
  const cashflowNet = totalCobrat - totalPagat; // efectiu real entrat - efectiu real sortit

  // ── Venciments propers (≤30 dies) ─────────────────────────────────
  const upcoming = invoicesIn
    .filter(i => i.status !== "paid" && i.due_date)
    .map(i => ({ ...i, days: daysTo(i.due_date!) }))
    .filter(i => i.days >= -3 && i.days <= 30)
    .sort((a, b) => a.days - b.days);

  // ── Vencits no pagats (>3 dies endarrerit) ─────────────────────────
  const overdue = invoicesIn
    .filter(i => i.status !== "paid" && i.due_date)
    .map(i => ({ ...i, days: daysTo(i.due_date!) }))
    .filter(i => i.days < -3)
    .sort((a, b) => a.days - b.days);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Finances</h1>
          <p className="text-[var(--muted)] text-sm">Control de tresoreria i facturació — Projecte Zero Stock</p>
        </div>
        <div className="flex gap-2">
          <DeliveryNoteModal components={components} />
          <InvoiceUploadModal />
        </div>
      </div>

      {/* ── KPIs ingressos / despeses ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <KpiCard label="Total facturat (IVA inc.)" value={totalFacturat} sub={`Base: ${fmt(invoicesOut.reduce((s,i)=>s+i.base_amount,0))}`} color="var(--bumbba)" />
        <KpiCard label="Cobrat" value={totalCobrat} color="#16a34a" />
        <KpiCard label="Pendent cobrar" value={totalPendentCobrar} color="var(--negative)" />
        <KpiCard label="Total compres (IVA inc.)" value={totalCompres} sub={`Base: ${fmt(invoicesIn.reduce((s,i)=>s+i.base_amount,0))}`} color="var(--sunbba)" />
        <KpiCard label="Pagat" value={totalPagat} color="#16a34a" />
        <KpiCard label="Pendent pagar" value={totalPendentPagar} color="var(--negative)" />
      </div>

      {/* ── Indicadors de tresoreria ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
          <p className="text-sm text-[var(--muted)]">Caixa neta (cobrat − pagat)</p>
          <p className={`text-3xl font-bold tabular-nums mt-1 ${cashflowNet >= 0 ? "text-green-600" : "text-[var(--negative)]"}`}>
            {cashflowNet >= 0 ? "+" : ""}{fmt(cashflowNet)}
          </p>
          <p className="text-xs text-[var(--muted)] mt-2">Diners realment entrats menys diners realment sortits</p>
        </div>
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
          <p className="text-sm text-[var(--muted)]">Posició neta (facturat − compres)</p>
          <p className={`text-3xl font-bold tabular-nums mt-1 ${(totalFacturat - totalCompres) >= 0 ? "text-green-600" : "text-[var(--negative)]"}`}>
            {(totalFacturat - totalCompres) >= 0 ? "+" : ""}{fmt(totalFacturat - totalCompres)}
          </p>
          <p className="text-xs text-[var(--muted)] mt-2">Acumulat total facturat vs. tot el stock comprat</p>
        </div>
      </div>

      {/* ── Alertes venciments ── */}
      {overdue.length > 0 && (
        <div className="bg-[var(--card)] border border-red-200 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-red-100 bg-red-50">
            <h2 className="font-semibold text-red-700">Factures vençudes sense pagar ({overdue.length})</h2>
          </div>
          <table className="w-full text-sm">
            <tbody>
              {overdue.map(inv => (
                <tr key={inv.id} className="border-b border-[var(--border)] last:border-0">
                  <td className="px-4 py-2 text-[var(--muted)]">{fmtDate(inv.due_date!)}</td>
                  <td className="px-4 py-2 font-medium">{inv.supplier}</td>
                  <td className="px-4 py-2 font-mono text-xs text-[var(--muted)]">{inv.invoice_number}</td>
                  <td className="px-4 py-2 text-right font-semibold tabular-nums">{fmt(inv.total_amount)}</td>
                  <td className="px-4 py-2 text-right">
                    <span className="text-xs px-2 py-0.5 rounded-md bg-red-50 text-red-700">
                      {Math.abs(inv.days)} dies endarrerit
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {upcoming.length > 0 && (
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-[var(--border)]">
            <h2 className="font-semibold">Venciments propers — 30 dies</h2>
          </div>
          <table className="w-full text-sm">
            <tbody>
              {upcoming.map(inv => (
                <tr key={inv.id} className="border-b border-[var(--border)] last:border-0">
                  <td className="px-4 py-2 text-[var(--muted)]">{fmtDate(inv.due_date!)}</td>
                  <td className="px-4 py-2 font-medium">{inv.supplier}</td>
                  <td className="px-4 py-2 capitalize text-[var(--muted)]">{inv.category}</td>
                  <td className="px-4 py-2 text-right font-semibold tabular-nums">{fmt(inv.total_amount)}</td>
                  <td className="px-4 py-2 text-right">
                    <span className={`text-xs px-2 py-0.5 rounded-md ${inv.days <= 3 ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"}`}>
                      {inv.days === 0 ? "avui" : inv.days < 0 ? `${Math.abs(inv.days)}d endarrerit` : `${inv.days} dies`}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Factures emeses ── */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-[var(--border)] flex items-center justify-between">
          <div>
            <h2 className="font-semibold">Factures emeses — vendes a Bumbba</h2>
            <p className="text-xs text-[var(--muted)] mt-0.5">El que Estelle Parquet cobra a Nubba Spaces</p>
          </div>
          <span className="text-sm font-semibold tabular-nums">{fmt(totalFacturat)}</span>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[var(--muted)] border-b border-[var(--border)] bg-[var(--background)]">
              <th className="px-3 py-2">Data</th>
              <th className="px-3 py-2">Nº Factura</th>
              <th className="px-3 py-2">Client</th>
              <th className="px-3 py-2 text-right">Base</th>
              <th className="px-3 py-2 text-right">Total (IVA)</th>
              <th className="px-3 py-2">Venciment</th>
              <th className="px-3 py-2">Estat</th>
            </tr>
          </thead>
          <tbody>
            {invoicesOut.map(inv => (
              <tr key={inv.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--background)]">
                <td className="px-3 py-2 text-[var(--muted)]">{fmtDate(inv.invoice_date)}</td>
                <td className="px-3 py-2 font-mono text-xs">{inv.invoice_number}</td>
                <td className="px-3 py-2">{inv.client}</td>
                <td className="px-3 py-2 text-right tabular-nums">{fmt(inv.base_amount)}</td>
                <td className="px-3 py-2 text-right tabular-nums font-semibold">{fmt(inv.total_amount)}</td>
                <td className="px-3 py-2 text-[var(--muted)]">{inv.due_date ? fmtDate(inv.due_date) : "—"}</td>
                <td className="px-3 py-2"><StatusBadge status={inv.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
        {invoicesOut[0]?.notes && (
          <div className="px-4 py-2 border-t border-[var(--border)] text-xs text-[var(--muted)]">
            {invoicesOut[0].notes}
          </div>
        )}
      </div>

      {/* ── Albarans ── */}
      <DeliveryNotesTable notes={deliveryNotes} />

      {/* ── Factures rebudes ── */}
      <InvoicesInTable
        invoicesIn={invoicesIn}
        totalCompres={totalCompres}
        today="2026-06-18"
      />

    </div>
  );
}