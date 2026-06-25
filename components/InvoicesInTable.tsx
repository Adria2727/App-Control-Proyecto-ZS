"use client";

import { useState, useMemo } from "react";
import { InvoiceIn } from "@/lib/types";

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
  const [supplierFilter, setSupplierFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const todayDate = new Date(today);

  const filtered = useMemo(() => {
    return invoicesIn.filter((inv) => {
      if (supplierFilter && !inv.supplier.toLowerCase().includes(supplierFilter.toLowerCase())) return false;
      if (dateFrom && inv.invoice_date < dateFrom) return false;
      if (dateTo && inv.invoice_date > dateTo) return false;
      return true;
    });
  }, [invoicesIn, supplierFilter, dateFrom, dateTo]);

  const filteredTotal = filtered.reduce((s, i) => s + i.total_amount, 0);
  const filteredBase  = filtered.reduce((s, i) => s + i.base_amount, 0);

  const hasFilter = supplierFilter || dateFrom || dateTo;

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
        {hasFilter && (
          <button
            onClick={() => { setSupplierFilter(""); setDateFrom(""); setDateTo(""); }}
            className="text-xs text-[var(--muted)] hover:text-[var(--foreground)] underline pb-1.5"
          >
            Netejar filtres
          </button>
        )}
        {hasFilter && (
          <span className="text-xs text-[var(--muted)] pb-1.5 ml-auto">
            {filtered.length} de {invoicesIn.length} factures
          </span>
        )}
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-[var(--muted)] border-b border-[var(--border)] bg-[var(--background)]">
            <th className="px-3 py-2">Data</th>
            <th className="px-3 py-2">Proveïdor</th>
            <th className="px-3 py-2">Categoria</th>
            <th className="px-3 py-2 text-right">Base</th>
            <th className="px-3 py-2 text-right">Total (IVA)</th>
            <th className="px-3 py-2">Venciment</th>
            <th className="px-3 py-2">Estat</th>
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-3 py-8 text-center text-[var(--muted)] text-sm">
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
                  <td className="px-3 py-2 capitalize text-[var(--muted)]">{inv.category}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{fmt(inv.base_amount)}</td>
                  <td className="px-3 py-2 text-right tabular-nums font-semibold">{fmt(inv.total_amount)}</td>
                  <td className={`px-3 py-2 ${isOverdue ? "text-[var(--negative)] font-medium" : "text-[var(--muted)]"}`}>
                    {inv.due_date ? fmtDate(inv.due_date) : "—"}
                  </td>
                  <td className="px-3 py-2">
                    <StatusBadge status={isOverdue ? "overdue" : inv.status} />
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
        <tfoot>
          <tr className="bg-[var(--background)] border-t-2 border-[var(--border)]">
            <td colSpan={3} className="px-3 py-2 font-semibold text-[var(--muted)]">
              {hasFilter ? `TOTAL FILTRAT` : "TOTAL"}
            </td>
            <td className="px-3 py-2 text-right tabular-nums font-semibold">{fmt(filteredBase)}</td>
            <td className="px-3 py-2 text-right tabular-nums font-bold">{fmt(filteredTotal)}</td>
            <td colSpan={2} />
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
