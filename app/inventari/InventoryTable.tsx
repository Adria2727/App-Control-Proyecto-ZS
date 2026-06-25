"use client";

import { useMemo, useState, useRef } from "react";
import { Component } from "@/lib/types";

export default function InventoryTable({ components: initialComponents }: { components: Component[] }) {
  const [components, setComponents] = useState<Component[]>(initialComponents);
  const [tenant, setTenant] = useState<string>("ALL");
  const [category, setCategory] = useState<string>("ALL");
  const [query, setQuery] = useState("");
  const [onlyIssues, setOnlyIssues] = useState(false);
  const [editingCostId, setEditingCostId] = useState<number | null>(null);
  const [editingStockId, setEditingStockId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function saveCost(id: number) {
    const parsed = parseFloat(editValue.replace(",", "."));
    if (isNaN(parsed) || parsed < 0) { setEditingCostId(null); return; }
    await fetch("/api/update-cost", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ component_id: id, cost_unitari: parsed }),
    });
    setComponents((prev) => prev.map((c) => (c.id === id ? { ...c, cost_unitari: parsed } : c)));
    setEditingCostId(null);
  }

  async function saveStock(id: number) {
    const parsed = parseInt(editValue, 10);
    if (isNaN(parsed)) { setEditingStockId(null); return; }
    await fetch("/api/update-stock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ component_id: id, stock_actual: parsed }),
    });
    setComponents((prev) => prev.map((c) => (c.id === id ? { ...c, stock_actual: parsed } : c)));
    setEditingStockId(null);
  }

  function startEditCost(c: Component) {
    setEditingCostId(c.id); setEditingStockId(null);
    setEditValue(c.cost_unitari != null ? String(c.cost_unitari) : "");
    setTimeout(() => inputRef.current?.select(), 0);
  }

  function startEditStock(c: Component) {
    setEditingStockId(c.id); setEditingCostId(null);
    setEditValue(String(c.stock_actual));
    setTimeout(() => inputRef.current?.select(), 0);
  }

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
          <option value="SHARED">Compartit</option>
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
                    <span style={{ color: c.tenant_id === "BUMBBA" ? "var(--bumbba)" : c.tenant_id === "SUNBBA" ? "var(--sunbba)" : "var(--muted)" }}>
                      {c.tenant_id === "BUMBBA" ? "Bumbba" : c.tenant_id === "SUNBBA" ? "Sunbba" : "Compartit"}
                    </span>
                  </td>
                  <td className="px-3 py-2 font-medium">{c.name}</td>
                  <td className="px-3 py-2 text-[var(--muted)]">{c.category_code}</td>
                  <td className="px-3 py-2 text-[var(--muted)]">{c.station ?? "—"}</td>
                  <td
                    className="px-3 py-2 text-right font-semibold tabular-nums cursor-pointer hover:bg-[var(--border)] transition-colors"
                    title="Clic per editar stock"
                    onClick={() => startEditStock(c)}
                    style={{ color: c.stock_actual < 0 ? "var(--negative)" : undefined }}
                  >
                    {editingStockId === c.id ? (
                      <input
                        ref={inputRef}
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={() => saveStock(c.id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveStock(c.id);
                          if (e.key === "Escape") setEditingStockId(null);
                        }}
                        className="w-16 text-right bg-[var(--background)] border border-[var(--border)] rounded px-1 py-0.5 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--bumbba)]"
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      c.stock_actual
                    )}
                  </td>
                  <td
                    className="px-3 py-2 text-right tabular-nums cursor-pointer hover:bg-[var(--border)] transition-colors"
                    title="Clic per editar"
                    onClick={() => startEditCost(c)}
                  >
                    {editingCostId === c.id ? (
                      <input
                        ref={inputRef}
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={() => saveCost(c.id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveCost(c.id);
                          if (e.key === "Escape") setEditingCostId(null);
                        }}
                        className="w-20 text-right bg-[var(--background)] border border-[var(--border)] rounded px-1 py-0.5 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--bumbba)]"
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <span className="text-[var(--muted)]">
                        {c.cost_unitari != null ? fmtEur(c.cost_unitari) : "—"}
                      </span>
                    )}
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
