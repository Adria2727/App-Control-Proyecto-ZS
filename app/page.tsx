import { supabase } from "@/lib/supabase";
import { Component } from "@/lib/types";
import Link from "next/link";

export const dynamic = "force-dynamic";

async function getData() {
  const { data: components } = await supabase
    .from("components")
    .select("id,sku,name,tenant_id,category_code,color_code,station,stock_actual");
  const { count: products } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true });
  return { components: (components ?? []) as Component[], products: products ?? 0 };
}

function Stat({ label, value, accent }: { label: string; value: string | number; accent?: string }) {
  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4">
      <div className="text-sm text-[var(--muted)]">{label}</div>
      <div className="text-2xl font-bold mt-1" style={accent ? { color: accent } : undefined}>
        {value}
      </div>
    </div>
  );
}

export default async function Dashboard() {
  const { components, products } = await getData();

  const byTenant = (t: string) => components.filter((c) => c.tenant_id === t);
  const negatives = components.filter((c) => c.stock_actual < 0);
  const zeros = components.filter((c) => c.stock_actual === 0);
  const totalUnits = components.reduce((s, c) => s + Math.max(0, c.stock_actual), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-[var(--muted)] text-sm">Visió general de l&apos;inventari · Bumbba &amp; Sunbba</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="Components totals" value={components.length} />
        <Stat label="Productes" value={products} />
        <Stat label="Unitats en estoc" value={totalUnits.toLocaleString("ca-ES")} />
        <Stat label="Stock negatiu (descuadres)" value={negatives.length} accent="var(--negative)" />
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold" style={{ color: "var(--bumbba)" }}>Bumbba</h2>
            <span className="text-xs text-[var(--muted)]">marca madura</span>
          </div>
          <div className="mt-3 text-sm space-y-1">
            <Row label="Components" value={byTenant("BUMBBA").length} />
            <Row label="Stock negatiu" value={byTenant("BUMBBA").filter((c) => c.stock_actual < 0).length} />
            <Row label="A zero" value={byTenant("BUMBBA").filter((c) => c.stock_actual === 0).length} />
          </div>
        </div>
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold" style={{ color: "var(--sunbba)" }}>Sunbba</h2>
            <span className="text-xs text-[var(--muted)]">relançament · molts buits</span>
          </div>
          <div className="mt-3 text-sm space-y-1">
            <Row label="Components" value={byTenant("SUNBBA").length} />
            <Row label="Stock negatiu" value={byTenant("SUNBBA").filter((c) => c.stock_actual < 0).length} />
            <Row label="A zero" value={byTenant("SUNBBA").filter((c) => c.stock_actual === 0).length} />
          </div>
        </div>
      </div>

      {negatives.length > 0 && (
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold">Atenció: stock negatiu</h2>
            <Link href="/alertes" className="text-sm text-[var(--bumbba)] hover:underline">Veure totes →</Link>
          </div>
          <p className="text-xs text-[var(--muted)] mb-3">
            Descuadres coneguts de comptabilitat de magatzem (no necessàriament falta real).
          </p>
          <div className="flex flex-wrap gap-2">
            {negatives.slice(0, 12).map((c) => (
              <span key={c.id} className="text-xs px-2 py-1 rounded-md bg-red-50 text-[var(--negative)] border border-red-200">
                {c.tenant_id === "BUMBBA" ? "B" : "S"} · {c.name}
                {c.color_code ? ` (${c.color_code})` : ""}: {c.stock_actual}
              </span>
            ))}
            {zeros.length > 0 && (
              <span className="text-xs px-2 py-1 text-[var(--muted)]">+{zeros.length} a zero</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between">
      <span className="text-[var(--muted)]">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
