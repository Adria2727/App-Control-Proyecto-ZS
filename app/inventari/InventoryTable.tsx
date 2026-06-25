"use client";

import { useMemo, useState } from "react";
import { Component } from "@/lib/types";

export default function InventoryTable({ components }: { components: Component[] }) {
  const [tenant, setTenant] = useState<string>("ALL");
  const [category, setCategory] = useState<string>("ALL");
  const [query, setQuery] = useState("");
  const [onlyIssues, setOnlyIssues] = useState(false);

  const categories = useMemo(
    () => Array.from(new Set(components.map((c) => c.category_code))).sort(),
    [components]
  );

  const rows = useMemo(() => {
    return components
      .filter((c) => (tenant === "ALL" ? true : c.tenant_id === tenant))
      .filter((c) => (category === "ALL" ? true : c.category_code === category))
      .filter((c) => (onlyIssues ? c.stock_actual <= 0 : true))
      .filter((c) =>
        query.trim()
          ? `${c.name} ${c.sku}`.toLowerCase().includes(query.toLowerCase())
          : true
      )
      .sort((a, b) => a.stock_actual - b.stock_actual);
  }, [components, tenant, category, query, onlyIssues]);

  const totalValor = useMemo(
    () => rows.reduce((acc, c) => acc + (c.cost_unitari ?? 0) * c.stock_actual, 0),
    [rows]
  );

  function fmtEur(n: number) {
    return n.toLocaleString("ca-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
  }

  return (
    <div className="space-y-4">
      {/* KPI */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-[var(--muted)] uppercase tracking-wide font-medium">Valor total stock (filtrat)</p>
          <p className="text-2xl font-bold tabular-nums mt-0.5">{fmtEur(totalValor)}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-[var(--muted)] uppercase tracking-wide font-medium">Components</p>
          <p className="text-2xl font-bold tabular-nums mt-0.5">{rows.length}</p>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap gap-2 items-center">
        <select value={tenant} onChange={(e) => setTenant(e.target.value)} className="select">
          <option value="ALL">Totes les marques</option>
          <option value="BUMBBA">Bumbba</option>
          <option value="SUNBBA">Sunbba</option>
        </select>
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="select">
          <option value="ALL">Totes les categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cerca per nom o SKU…"
          className="select flex-1 min-w-[180px]"
        />
        <label className="flex items-center gap-2 text-sm text-[var(--muted)] cursor-pointer">
          <input type="checkbox" checked={onlyIssues} onChange={(e) => setOnlyIssues(e.target.checked)} />
          Només ≤ 0
        </label>
      </div>

      {/* Taula */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[var(--muted)] border-b border-[var(--border)] bg-[var(--background)]">
              <th className="px-3 py-2 font-medium">Marca</th>
              <th className="px-3 py-2 font-medium">Component</th>
              <th className="px-3 py-2 font-medium">Categoria</th>
              <th className="px-3 py-2 font-medium">Estació</th>
              <th className="px-3 py-2 font-medium text-right">Stock</th>
              <th className="px-3 py-2 font-medium text-right">Cost unit.</th>
              <th className="px-3 py-2 font-medium text-right">Valor</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => {
              const valor = c.cost_unitari != null ? c.cost_unitari * c.stock_actual : null;
              return (
                <tr key={c.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--background)]">
                  <td className="px-3 py-2">
                    <span style={{ color: c.tenant_id === "BUMBBA" ? "var(--bumbba)" : "var(--sunbba)" }}>
                      {c.tenant_id === "BUMBBA" ? "Bumbba" : "Sunbba"}
                    </span>
                  </td>
                  <td className="px-3 py-2 font-medium">{c.name}</td>
                  <td className="px-3 py-2 text-[var(--muted)]">{c.category_code}</td>
                  <td className="px-3 py-2 text-[var(--muted)]">{c.station ?? "—"}</td>
                  <td className="px-3 py-2 text-right font-semibold tabular-nums"
                      style={{ color: c.stock_actual < 0 ? "var(--negative)" : undefined }}>
                    {c.stock_actual}
                  </td>
                  <td className="px-3 py-2 text-right text-[var(--muted)] tabular-nums">
                    {c.cost_unitari != null ? fmtEur(c.cost_unitari) : "—"}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums font-medium"
                      style={{ color: valor != null && valor < 0 ? "var(--negative)" : undefined }}>
                    {valor != null ? fmtEur(valor) : "—"}
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr><td colSpan={7} className="px-3 py-6 text-center text-[var(--muted)]">Cap component amb aquests filtres</td></tr>
            )}
          </tbody>
          {rows.length > 0 && (
            <tfoot>
              <tr className="border-t border-[var(--border)] bg-[var(--background)] font-semibold">
                <td colSpan={6} className="px-3 py-2 text-right text-[var(--muted)] text-xs uppercase tracking-wide">Total</td>
                <td className="px-3 py-2 text-right tabular-nums">{fmtEur(totalValor)}</td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}
