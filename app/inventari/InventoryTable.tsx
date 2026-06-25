"use client";

import { useMemo, useState } from "react";
import { Component } from "@/lib/types";

const COLOR_NAMES: Record<string, string> = {
  PVC: "Light Green", PGC: "Arctic Sand", PGO: "Shadow Grey",
  GR: "Dark Grey", BG: "Beige",
  PC04: "Light Ivory", PC37: "Green Olive", PC82: "Grey Stone", PC99: "Graphite Grey",
  VC: "Light Green", GC: "Arctic Sand", GO: "Shadow Grey",
};

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
          ? `${c.name} ${c.sku} ${c.color_code ?? ""}`.toLowerCase().includes(query.toLowerCase())
          : true
      )
      .sort((a, b) => a.stock_actual - b.stock_actual);
  }, [components, tenant, category, query, onlyIssues]);

  return (
    <div className="space-y-4">
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
          placeholder="Cerca per nom, SKU o color…"
          className="select flex-1 min-w-[180px]"
        />
        <label className="flex items-center gap-2 text-sm text-[var(--muted)] cursor-pointer">
          <input type="checkbox" checked={onlyIssues} onChange={(e) => setOnlyIssues(e.target.checked)} />
          Només ≤ 0
        </label>
      </div>

      <div className="text-xs text-[var(--muted)]">{rows.length} components</div>

      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[var(--muted)] border-b border-[var(--border)] bg-[var(--background)]">
              <th className="px-3 py-2 font-medium">Marca</th>
              <th className="px-3 py-2 font-medium">Component</th>
              <th className="px-3 py-2 font-medium">Categoria</th>
              <th className="px-3 py-2 font-medium">Color</th>
              <th className="px-3 py-2 font-medium">Estació</th>
              <th className="px-3 py-2 font-medium text-right">Stock</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => (
              <tr key={c.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--background)]">
                <td className="px-3 py-2">
                  <span style={{ color: c.tenant_id === "BUMBBA" ? "var(--bumbba)" : "var(--sunbba)" }}>
                    {c.tenant_id === "BUMBBA" ? "Bumbba" : "Sunbba"}
                  </span>
                </td>
                <td className="px-3 py-2 font-medium">
                  {c.color_code ? `${c.name} ${COLOR_NAMES[c.color_code] ?? c.color_code}` : c.name}
                </td>
                <td className="px-3 py-2 text-[var(--muted)]">{c.category_code}</td>
                <td className="px-3 py-2 text-[var(--muted)]">{c.color_code ?? "—"}</td>
                <td className="px-3 py-2 text-[var(--muted)]">{c.station ?? "—"}</td>
                <td className="px-3 py-2 text-right font-semibold tabular-nums"
                    style={{ color: c.stock_actual < 0 ? "var(--negative)" : undefined }}>
                  {c.stock_actual}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={6} className="px-3 py-6 text-center text-[var(--muted)]">Cap component amb aquests filtres</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
