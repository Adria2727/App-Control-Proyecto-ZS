"use client";

import { useState } from "react";

// ── Tipus ──────────────────────────────────────────────────────────────────

interface ComponentRow {
  id: number;
  sku: string;
  name: string;
  category_code: string;
  color_code: string | null;
  station: string | null;
}

interface BomLine {
  id: number;
  quantity: number;
  station: string | null;
  color_varies: boolean;
  component: ComponentRow;
}

interface Price {
  id: number;
  price_type: string;
  size: string | null;
  amount: number;
  vat_included: boolean;
}

interface ProductFull {
  id: number;
  code: string;
  name: string;
  tenant_id: string;
  family: string | null;
  bom_active: boolean;
  sold_on_web: boolean;
  bom: BomLine[];
  prices: Price[];
}

// ── Helpers ────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return n.toLocaleString("ca-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
}

const STATION_LABEL: Record<string, string> = {
  E0: "E0 · Accessoris",
  E1: "E1 · Muntatge",
  E2: "E2 · Buit",
  E3: "E3 · Coixins",
  KANBAN: "KANBAN",
  COSTE: "COSTE",
};

const FAMILY_LABEL: Record<string, string> = {
  SOFA: "Sofàs",
  INDIVIDUAL: "Individuals",
  COMPONENT: "Components",
};

const COLOR_NAMES: Record<string, string> = {
  PVC: "Light Green",
  PGC: "Arctic Sand",
  PGO: "Shadow Grey",
  GR: "Dark Grey",
  BG: "Beige",
  PC04: "Light Ivory",
  PC37: "Green Olive",
  PC82: "Grey Stone",
  PC99: "Graphite Grey",
};

const COLOR_HEX: Record<string, string> = {
  PVC: "#86efac",
  PGC: "#d2b48c",
  PGO: "#9ca3af",
  GR: "#6b7280",
  BG: "#e8d5b7",
  PC04: "#f5f0e8",
  PC37: "#6b7c5a",
  PC82: "#9e9e9e",
  PC99: "#4a4a4a",
};

// ── Subcomponents ──────────────────────────────────────────────────────────

function ColorChip({ code }: { code: string }) {
  return (
    <span
      className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border border-black/10"
      style={{ background: COLOR_HEX[code] ?? "#e5e7eb", color: ["GR", "PC37", "PC82", "PC99"].includes(code) ? "#fff" : "#111" }}
      title={COLOR_NAMES[code]}
    >
      {code}
    </span>
  );
}

function BomTable({ lines }: { lines: BomLine[] }) {
  if (lines.length === 0) return <p className="text-xs text-[var(--muted)] italic">Sense línies BOM registrades.</p>;

  const byStation: Record<string, BomLine[]> = {};
  for (const l of lines) {
    const key = l.station ?? "—";
    if (!byStation[key]) byStation[key] = [];
    byStation[key].push(l);
  }

  const stationOrder = ["E0", "E1", "E2", "E3", "KANBAN", "COSTE", "—"];
  const stations = stationOrder.filter((s) => byStation[s]);

  return (
    <table className="w-full text-xs">
      <thead>
        <tr className="text-left text-[var(--muted)] border-b border-[var(--border)]">
          <th className="py-1 pr-3 font-medium">Estació</th>
          <th className="py-1 pr-3 font-medium">Component</th>
          <th className="py-1 pr-3 font-medium">Categoria</th>
          <th className="py-1 pr-3 text-right font-medium">Qty</th>
          <th className="py-1 font-medium">Color</th>
        </tr>
      </thead>
      <tbody>
        {stations.flatMap((st) =>
          byStation[st].map((l, i) => (
            <tr key={l.id} className="border-b border-[var(--border)] last:border-0">
              <td className="py-1 pr-3 text-[var(--muted)]">
                {i === 0 ? (STATION_LABEL[st] ?? st) : ""}
              </td>
              <td className="py-1 pr-3 font-medium">{l.component.name}</td>
              <td className="py-1 pr-3 capitalize text-[var(--muted)]">{l.component.category_code.toLowerCase()}</td>
              <td className="py-1 pr-3 text-right tabular-nums">{l.quantity}</td>
              <td className="py-1">
                {l.color_varies ? (
                  <span className="text-[var(--muted)] italic">segons color</span>
                ) : l.component.color_code ? (
                  <ColorChip code={l.component.color_code} />
                ) : (
                  <span className="text-[var(--muted)]">—</span>
                )}
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}

function PricesSection({ prices, tenant }: { prices: Price[]; tenant: string }) {
  if (prices.length === 0) return null;

  const retail = prices.filter((p) => p.price_type === "RETAIL").sort((a, b) => (a.amount - b.amount));
  const proposta = prices.filter((p) => p.price_type === "PROPOSTA").sort((a, b) => ((a.size ?? "") < (b.size ?? "") ? -1 : 1));

  return (
    <div className="flex flex-wrap gap-6 text-xs">
      {retail.length > 0 && (
        <div>
          <p className="font-semibold text-[var(--muted)] mb-1 uppercase tracking-wide">Retail (IVA inc.)</p>
          <div className="flex flex-wrap gap-2">
            {retail.map((p) => (
              <span key={p.id} className="px-2 py-1 rounded-md bg-[var(--background)] border border-[var(--border)] tabular-nums">
                {p.size ? <span className="text-[var(--muted)] mr-1">{p.size}</span> : null}
                <strong>{fmt(p.amount)}</strong>
              </span>
            ))}
          </div>
        </div>
      )}
      {proposta.length > 0 && tenant === "BUMBBA" && (
        <div>
          <p className="font-semibold text-[var(--muted)] mb-1 uppercase tracking-wide">Proposta / Majorista</p>
          <div className="flex flex-wrap gap-2">
            {proposta.map((p) => (
              <span key={p.id} className="px-2 py-1 rounded-md bg-[var(--background)] border border-[var(--border)] tabular-nums">
                {p.size ? <span className="text-[var(--muted)] mr-1">T{p.size}</span> : null}
                <strong>{fmt(p.amount)}</strong>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ProductCard({ product }: { product: ProductFull }) {
  const [open, setOpen] = useState(false);

  const colorVariantCodes = Array.from(
    new Set(product.bom.filter((l) => l.color_varies && l.component.color_code).map((l) => l.component.color_code!))
  );

  const tenantColor = product.tenant_id === "BUMBBA" ? "var(--bumbba)" : "var(--sunbba)";

  return (
    <div className={`border border-[var(--border)] rounded-xl overflow-hidden ${!product.bom_active ? "opacity-60" : ""}`}>
      {/* Header */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[var(--background)] transition-colors text-left"
      >
        <span className="font-mono text-xs px-2 py-0.5 rounded-md border border-[var(--border)] text-[var(--muted)]">
          {product.code}
        </span>
        <span className="font-semibold flex-1">{product.name}</span>

        <div className="flex items-center gap-2 shrink-0">
          {colorVariantCodes.length > 0 && (
            <div className="flex gap-1">
              {colorVariantCodes.map((c) => <ColorChip key={c} code={c} />)}
            </div>
          )}

          {!product.bom_active && (
            <span className="text-xs px-2 py-0.5 rounded-md font-medium" style={{ color: "#b45309", background: "#fef3c7" }}>
              BOM inactiu
            </span>
          )}
          {product.sold_on_web && (
            <span className="text-xs px-2 py-0.5 rounded-md font-medium" style={{ color: "#1d4ed8", background: "#dbeafe" }}>
              web
            </span>
          )}

          <span className="text-[var(--muted)] text-sm">{open ? "▲" : "▼"}</span>
        </div>
      </button>

      {/* Expanded */}
      {open && (
        <div className="border-t border-[var(--border)] bg-[var(--background)] px-4 py-4 space-y-4">
          {/* Preus */}
          <PricesSection prices={product.prices} tenant={product.tenant_id} />

          {/* BOM */}
          <div>
            <p className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wide mb-2">
              Escandall (BOM)
              {!product.bom_active && <span className="ml-2 normal-case italic font-normal">— inactiu, sistema antic</span>}
            </p>
            <BomTable lines={product.bom} />
          </div>
        </div>
      )}
    </div>
  );
}

function TenantSection({ tenant, products }: { tenant: string; products: ProductFull[] }) {
  const families = ["SOFA", "INDIVIDUAL", "COMPONENT"];
  const byFamily: Record<string, ProductFull[]> = {};
  for (const p of products) {
    const key = p.family ?? "COMPONENT";
    if (!byFamily[key]) byFamily[key] = [];
    byFamily[key].push(p);
  }

  const tenantColor = tenant === "BUMBBA" ? "var(--bumbba)" : "var(--sunbba)";

  return (
    <div className="space-y-4">
      {families.filter((f) => byFamily[f]?.length).map((family) => (
        <div key={family}>
          <h3 className="text-xs font-semibold uppercase tracking-widest text-[var(--muted)] mb-2 px-1">
            {FAMILY_LABEL[family] ?? family} ({byFamily[family].length})
          </h3>
          <div className="space-y-2">
            {byFamily[family].map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Component principal ────────────────────────────────────────────────────

export default function ProductesClient({ products }: { products: ProductFull[] }) {
  const [tab, setTab] = useState<"TOTS" | "BUMBBA" | "SUNBBA">("TOTS");

  const bumbba = products.filter((p) => p.tenant_id === "BUMBBA");
  const sunbba = products.filter((p) => p.tenant_id === "SUNBBA");

  const tabs: { key: "TOTS" | "BUMBBA" | "SUNBBA"; label: string; count: number }[] = [
    { key: "TOTS", label: "Tots", count: products.length },
    { key: "BUMBBA", label: "Bumbba", count: bumbba.length },
    { key: "SUNBBA", label: "Sunbba", count: sunbba.length },
  ];

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-[var(--background)] rounded-xl border border-[var(--border)] w-fit">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              tab === t.key
                ? "bg-[var(--card)] shadow-sm text-[var(--foreground)]"
                : "text-[var(--muted)] hover:text-[var(--foreground)]"
            }`}
          >
            {t.label}
            <span className="ml-1.5 text-xs opacity-60">({t.count})</span>
          </button>
        ))}
      </div>

      {/* Contingut */}
      {tab === "TOTS" ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h2 className="text-base font-bold mb-3" style={{ color: "var(--bumbba)" }}>Bumbba</h2>
            <TenantSection tenant="BUMBBA" products={bumbba} />
          </div>
          <div>
            <h2 className="text-base font-bold mb-3" style={{ color: "var(--sunbba)" }}>Sunbba</h2>
            <TenantSection tenant="SUNBBA" products={sunbba} />
          </div>
        </div>
      ) : tab === "BUMBBA" ? (
        <TenantSection tenant="BUMBBA" products={bumbba} />
      ) : (
        <TenantSection tenant="SUNBBA" products={sunbba} />
      )}
    </div>
  );
}
