import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

type BomLine = {
  qty: number;
  component: {
    name: string;
    cost_unitari: number;
    category_code: string;
  } | null;
};

type ProductWithBom = {
  id: number;
  code: string;
  name: string;
  tenant_id: string;
  family: string | null;
  bom: BomLine[];
};

function fmt(n: number) {
  return n.toLocaleString("ca-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
}

export default async function MargesPage() {
  const { data, error } = await supabase
    .from("products")
    .select(`id, code, name, tenant_id, family, bom(qty, component:components(name, cost_unitari, category_code))`)
    .eq("bom_active", true)
    .order("tenant_id")
    .order("name");

  const products = (data ?? []) as unknown as ProductWithBom[];

  const tenants = ["BUMBBA", "SUNBBA"];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Marges</h1>
        <p className="text-[var(--muted)] text-sm">Cost de producció per producte (BOM) — sense preu de venda</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
          Error carregant dades: {error.message}
        </div>
      )}

      {tenants.map(tenant => {
        const tenantProducts = products.filter(p => p.tenant_id === tenant);
        if (tenantProducts.length === 0) return null;

        const tenantColor = tenant === "BUMBBA" ? "var(--bumbba)" : "var(--sunbba)";

        return (
          <div key={tenant} className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-[var(--border)]" style={{ borderLeft: `4px solid ${tenantColor}` }}>
              <h2 className="font-bold" style={{ color: tenantColor }}>{tenant}</h2>
              <p className="text-xs text-[var(--muted)] mt-0.5">{tenantProducts.length} productes amb BOM actiu</p>
            </div>

            <div className="divide-y divide-[var(--border)]">
              {tenantProducts.map(product => {
                const lines = product.bom ?? [];
                const missingCost = lines.filter(l => l.component && l.component.cost_unitari === 0);
                const totalCost = lines.reduce((sum, l) => {
                  if (!l.component) return sum;
                  return sum + l.qty * l.component.cost_unitari;
                }, 0);

                return (
                  <div key={product.id} className="p-4">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-[var(--muted)] bg-[var(--background)] px-1.5 py-0.5 rounded">{product.code}</span>
                          <span className="font-semibold">{product.name}</span>
                          {product.family && (
                            <span className="text-xs text-[var(--muted)] bg-[var(--background)] px-1.5 py-0.5 rounded">{product.family}</span>
                          )}
                        </div>
                        {missingCost.length > 0 && (
                          <p className="text-xs text-amber-600 mt-1">
                            ⚠ {missingCost.length} component{missingCost.length > 1 ? "s" : ""} sense cost definit
                          </p>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-lg font-bold tabular-nums">{fmt(totalCost)}</p>
                        <p className="text-xs text-[var(--muted)]">cost/unitat</p>
                        {missingCost.length > 0 && (
                          <p className="text-xs text-amber-600">cost parcial</p>
                        )}
                      </div>
                    </div>

                    {lines.length > 0 && (
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="text-[var(--muted)] text-left">
                            <th className="pb-1 font-normal">Component</th>
                            <th className="pb-1 font-normal text-center w-16">Unitats</th>
                            <th className="pb-1 font-normal text-right w-24">Cost/u</th>
                            <th className="pb-1 font-normal text-right w-24">Subtotal</th>
                          </tr>
                        </thead>
                        <tbody>
                          {lines.map((line, idx) => {
                            if (!line.component) return null;
                            const subtotal = line.qty * line.component.cost_unitari;
                            const missing = line.component.cost_unitari === 0;
                            return (
                              <tr key={idx} className={`border-t border-[var(--border)] ${missing ? "text-amber-600" : ""}`}>
                                <td className="py-1 pr-2">{line.component.name}</td>
                                <td className="py-1 text-center tabular-nums">{line.qty}</td>
                                <td className="py-1 text-right tabular-nums">
                                  {missing ? <span className="italic">pendent</span> : fmt(line.component.cost_unitari)}
                                </td>
                                <td className="py-1 text-right tabular-nums font-medium">
                                  {missing ? "—" : fmt(subtotal)}
                                </td>
                              </tr>
                            );
                          })}
                          <tr className="border-t-2 border-[var(--border)] font-semibold">
                            <td colSpan={3} className="pt-1.5 text-right pr-2">TOTAL BOM</td>
                            <td className="pt-1.5 text-right tabular-nums" style={{ color: missingCost.length > 0 ? "var(--negative)" : tenantColor }}>
                              {fmt(totalCost)}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    )}

                    {lines.length === 0 && (
                      <p className="text-xs text-[var(--muted)] italic">Sense components al BOM</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {products.length === 0 && !error && (
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-8 text-center text-[var(--muted)]">
          <p>No hi ha productes amb BOM actiu.</p>
        </div>
      )}

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
        <strong>Nota sobre els costos:</strong> els costos unitaris s&apos;estimen a partir de les factures de compra rebudes.
        Els components marcats com a &ldquo;pendent&rdquo; (cost = 0) s&apos;han d&apos;assignar manualment executant el SQL de costos
        al Supabase Editor un cop confirmats els noms exactes dels components a la taula.
      </div>
    </div>
  );
}
