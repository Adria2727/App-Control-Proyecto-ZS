import { supabase } from "@/lib/supabase";
import { Product } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ProductesPage() {
  const { data } = await supabase
    .from("products")
    .select("id,code,name,tenant_id,family,bom_active,sold_on_web")
    .order("tenant_id")
    .order("family")
    .order("code");

  const rows = (data ?? []) as Product[];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Productes</h1>
        <p className="text-[var(--muted)] text-sm">Catàleg de productes acabats amb escandall (BOM)</p>
      </div>

      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[var(--muted)] border-b border-[var(--border)] bg-[var(--background)]">
              <th className="px-3 py-2 font-medium">Marca</th>
              <th className="px-3 py-2 font-medium">Codi</th>
              <th className="px-3 py-2 font-medium">Nom</th>
              <th className="px-3 py-2 font-medium">Família</th>
              <th className="px-3 py-2 font-medium">BOM</th>
              <th className="px-3 py-2 font-medium">Web</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--background)]">
                <td className="px-3 py-2">
                  <span style={{ color: p.tenant_id === "BUMBBA" ? "var(--bumbba)" : "var(--sunbba)" }}>
                    {p.tenant_id === "BUMBBA" ? "Bumbba" : "Sunbba"}
                  </span>
                </td>
                <td className="px-3 py-2 font-mono text-xs">{p.code}</td>
                <td className="px-3 py-2 font-medium">{p.name}</td>
                <td className="px-3 py-2 text-[var(--muted)]">{p.family ?? "—"}</td>
                <td className="px-3 py-2">
                  {p.bom_active
                    ? <Badge color="#16a34a" bg="#dcfce7">actiu</Badge>
                    : <Badge color="#b45309" bg="#fef3c7">inactiu</Badge>}
                </td>
                <td className="px-3 py-2">
                  {p.sold_on_web ? <span className="text-[var(--muted)]">sí</span> : <span className="text-[var(--muted)]">no</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Badge({ children, color, bg }: { children: React.ReactNode; color: string; bg: string }) {
  return (
    <span className="text-xs px-2 py-0.5 rounded-md font-medium" style={{ color, background: bg }}>
      {children}
    </span>
  );
}
