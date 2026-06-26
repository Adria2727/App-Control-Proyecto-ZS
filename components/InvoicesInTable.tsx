"use client";

import { useState, useMemo } from "react";
import { InvoiceIn } from "@/lib/types";
import { supabase } from "@/lib/supabase";

function fmt(n: number) {
  return n.toLocaleString("ca-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("ca-ES", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function daysTo(dateStr: string, today: Date) {
  return Math.round((new Date(dateStr).getTime() - today.getTime()) / 86_400_000);
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

export default function InvoicesInTable({
  invoicesIn,
  totalCompres,
  today,
}: {
  invoicesIn: InvoiceIn[];
  totalCompres: number;
  today: string;
}) {
  const [invoices, setInvoices] = useState(invoicesIn);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  async function deleteInvoice(id: number) {
    if (!confirm("Eliminar aquesta factura?")) return;
    setDeletingId(id);
    await supabase.from("invoices_in").delete().eq("id", id);
    setInvoices(prev => prev.filter(i => i.id !== id));
    setDeletingId(null);
  }

  const [supplierFilter, setSupplierFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [amountSearch, setAmountSearch] = useState("");
  const [baseSearch, setBaseSearch] = useState("");

  const todayDate = new Date(today);

  const filtered = useMemo(() => {
    return invoices.filter((inv) => {
      if (supplierFilter && !inv.supplier.toLowerCase().includes(supplierFilter.toLowerCase())) return false;
      if (dateFrom && inv.invoice_date < dateFrom) return false;
      if (dateTo && inv.invoice_date > dateTo) return false;
      if (amountSearch && !String(inv.total_amount).includes(amountSearch.replace(",", "."))) return false;
      if (baseSearch && !String(inv.base_amount).includes(baseSearch.replace(",", "."))) return false;
      return true;
    });
  }, [invoices, supplierFilter, dateFrom, dateTo, amountSearch, baseSearch]);

  const filteredTotal = filtered.reduce((s, i) => s + i.total_amount, 0);
  const filteredBase  = filtered.reduce((s, i) => s + i.base_amount, 0);

  const hasFilter = supplierFilter || dateFrom || dateTo || amountSearch || baseSearch;
  const totalInvoices = invoices.length;

  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-[var(--border)] flex items-center justify-between">
        <div>
          <h2 className="font-semibold">Factures rebudes — compres a proveïdors</h2>
          <p className="text-xs text-[var(--muted)] mt-0.5">Materials i serveis del Projecte Zero Stock</p>
        </div>
        <span className="text-sm font-semibold tabular-nums">{fmt(totalCompres)}</span>
      </div>

      {/* Filtres */}
      <div className="px-4 py-3 border-b border-[var(--border)] bg-[var(--background)] flex flex-wrap gap-3 items-end">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-[var(--muted)] font-medium">Proveïdor</label>
          <input
            type="text"
            placeholder="Cerca per nom..."
            value={supplierFilter}
            onChange={(e) => setSupplierFilter(e.target.value)}
            className="text-sm border border-[var(--border)] rounded-lg px-3 py-1.5 bg-[var(--card)] text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--bumbba)] w-52"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-[var(--muted)] font-medium">Data des de</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="text-sm border border-[var(--border)] rounded-lg px-3 py-1.5 bg-[var(--card)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--bumbba)]"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-[var(--muted)] font-medium">Data fins a</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="text-sm border border-[var(--border)] rounded-lg px-3 py-1.5 bg-[var(--card)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--bumbba)]"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-[var(--muted)] font-medium">Base imponible</label>
          <input
            type="text"
            placeholder="ex: 1644.00"
            value={baseSearch}
            onChange={(e) => setBaseSearch(e.target.value)}
            className="text-sm border border-[var(--border)] rounded-lg px-3 py-1.5 bg-[var(--card)] text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--bumbba)] w-36"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-[var(--muted)] font-medium">Import total</label>
          <input
            type="text"
            placeholder="ex: 4479.50"
            value={amountSearch}
            onChange={(e) => setAmountSearch(e.target.value)}
            className="text-sm border border-[var(--border)] rounded-lg px-3 py-1.5 bg-[var(--card)] text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--bumbba)] w-36"
          />
        </div>
        {hasFilter && (
          <button
            onClick={() => { setSupplierFilter(""); setDateFrom(""); setDateTo(""); setAmountSearch(""); setBaseSearch(""); }}
            className="text-xs text-[var(--muted)] hover:text-[var(--foreground)] underline pb-1.5"
          >
            Netejar filtres
          </button>
        )}
        {hasFilter && (
          <span className="text-xs text-[var(--muted)] pb-1.5 ml-auto">
            {filtered.length} de {totalInvoices} factures
          </span>
        )}
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-[var(--muted)] border-b border-[var(--border)] bg-[var(--background)]">
            <th className="px-3 py-2">Data</th>
            <th className="px-3 py-2">Proveïdor</th>
            <th className="px-3 py-2">Nº Factura</th>
            <th className="px-3 py-2">Categoria</th>
            <th className="px-3 py-2 text-right">Base</th>
            <th className="px-3 py-2 text-right">Total (IVA)</th>
            <th className="px-3 py-2">Venciment</th>
            <th className="px-3 py-2">Estat</th>
            <th className="px-3 py-2 w-8"></th>
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 ? (
            <tr>
              <td colSpan={9} className="px-3 py-8 text-center text-[var(--muted)] text-sm">
                Cap factura coincideix amb els filtres aplicats.
              </td>
            </tr>
          ) : (
            filtered.map((inv) => {
              const isOverdue = inv.status !== "paid" && inv.due_date && daysTo(inv.due_date, todayDate) < 0;
              return (
                <tr
                  key={inv.id}
                  className={`border-b border-[var(--border)] last:border-0 hover:bg-[var(--background)] ${isOverdue ? "bg-red-50/30" : ""}`}
                >
                  <td className="px-3 py-2 text-[var(--muted)]">{fmtDate(inv.invoice_date)}</td>
                  <td className="px-3 py-2 font-medium text-xs">{inv.supplier}</td>
                  <td className="px-3 py-2 font-mono text-xs text-[var(--muted)]">{inv.invoice_number}</td>
                  <td className="px-3 py-2 capitalize text-[var(--muted)]">{inv.category}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{fmt(inv.base_amount)}</td>
                  <td className="px-3 py-2 text-right tabular-nums font-semibold">{fmt(inv.total_amount)}</td>
                  <td className={`px-3 py-2 ${isOverdue ? "text-[var(--negative)] font-medium" : "text-[var(--muted)]"}`}>
                    {inv.due_date ? fmtDate(inv.due_date) : "—"}
                  </td>
                  <td className="px-3 py-2">
                    <StatusBadge status={isOverdue ? "overdue" : inv.status} />
                  </td>
                  <td className="px-3 py-2 text-right">
                    <button
                      onClick={() => deleteInvoice(inv.id)}
                      disabled={deletingId === inv.id}
                      title="Eliminar factura"
                      className="text-[var(--muted)] hover:text-[var(--negative)] transition-colors disabled:opacity-40 text-base leading-none"
                    >
                      {deletingId === inv.id ? "…" : "×"}
                    </button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
        <tfoot>
          <tr className="bg-[var(--background)] border-t-2 border-[var(--border)]">
            <td colSpan={5} className="px-3 py-2 font-semibold text-[var(--muted)]">
              {hasFilter ? `TOTAL FILTRAT` : "TOTAL"}
            </td>
            <td className="px-3 py-2 text-right tabular-nums font-semibold">{fmt(filteredBase)}</td>
            <td className="px-3 py-2 text-right tabular-nums font-bold">{fmt(filteredTotal)}</td>
            <td colSpan={3} />
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
