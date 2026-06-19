import { supabase } from "@/lib/supabase";
import { normalizeInvoices } from "@/lib/invoice-utils";
import Link from "next/link";

export const dynamic = "force-dynamic";

const TODAY = new Date("2026-06-19");

function fmt(n: number, decimals = 0) {
  return n.toLocaleString("ca-ES", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + " €";
}
function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("ca-ES", { day: "2-digit", month: "2-digit" });
}
function daysTo(d: string) {
  return Math.round((new Date(d).getTime() - TODAY.getTime()) / 86_400_000);
}

async function getData() {
  const [{ data: outData }, { data: inData }, { data: comps }] = await Promise.all([
    supabase.from("invoices_out").select("base_amount,total_amount,status,due_date,paid_date,invoice_date"),
    supabase.from("invoices_in").select("base_amount,total_amount,status,due_date,supplier,invoice_number,category"),
    supabase.from("components").select("stock_actual,cost_unitari,tenant_id,name,color_code"),
  ]);
  return {
    out: normalizeInvoices(outData ?? []),
    inn: normalizeInvoices(inData ?? []),
    comps: comps ?? [],
  };
}

export default async function Dashboard() {
  const { out, inn, comps } = await getData();

  // ── INGRESSOS ──────────────────────────────────────────────
  const vendesBase    = out.reduce((s: number, i: any) => s + i.base_amount, 0);
  const cobrat        = out.filter((i: any) => i.status === "paid").reduce((s: number, i: any) => s + i.total_amount, 0);
  const pendentCobrar = out.filter((i: any) => i.status !== "paid").reduce((s: number, i: any) => s + i.total_amount, 0);

  // ── DESPESES ───────────────────────────────────────────────
  const compresBase   = inn.reduce((s: number, i: any) => s + i.base_amount, 0);
  const pagat         = inn.filter((i: any) => i.status === "paid").reduce((s: number, i: any) => s + i.total_amount, 0);
  const pendentPagar  = inn.filter((i: any) => i.status !== "paid").reduce((s: number, i: any) => s + i.total_amount, 0);

  // ── MARGE BRUT (sobre base imposable) ─────────────────────
  const margeBase    = vendesBase - compresBase;
  const margePct     = vendesBase > 0 ? (margeBase / vendesBase) * 100 : 0;

  // ── TRESORERIA NETA (diners reals) ─────────────────────────
  const tresoreriaNet = cobrat - pagat;

  // ── VALOR INVENTARI (stock × cost_unitari) ─────────────────
  const valorInventari = comps.reduce((s: number, c: any) => {
    const stock = c.stock_actual ?? 0;
    const cost  = c.cost_unitari ?? 0;
    return s + (stock > 0 && cost > 0 ? stock * cost : 0);
  }, 0);
  const valorBumbba = comps.filter((c: any) => c.tenant_id === "BUMBBA").reduce((s: number, c: any) => {
    return s + (c.stock_actual > 0 && c.cost_unitari > 0 ? c.stock_actual * c.cost_unitari : 0);
  }, 0);
  const valorSunbba = comps.filter((c: any) => c.tenant_id === "SUNBBA").reduce((s: number, c: any) => {
    return s + (c.stock_actual > 0 && c.cost_unitari > 0 ? c.stock_actual * c.cost_unitari : 0);
  }, 0);
  const compsSenseCost = comps.filter((c: any) => (c.cost_unitari ?? 0) === 0 && (c.stock_actual ?? 0) > 0).length;

  // ── VENCIMENTS PROPERS (pagar) ─────────────────────────────
  const proxims = inn
    .filter((i: any) => i.status !== "paid" && i.due_date)
    .map((i: any) => ({ ...i, days: daysTo(i.due_date) }))
    .filter((i: any) => i.days >= -90 && i.days <= 45)
    .sort((a: any, b: any) => a.days - b.days)
    .slice(0, 6);

  const negatives = comps.filter((c: any) => c.stock_actual < 0);

  const margeColor = margePct >= 30 ? "#16a34a" : margePct >= 15 ? "#b45309" : "#dc2626";
  const tresoreriaColor = tresoreriaNet >= 0 ? "#16a34a" : "#dc2626";

  return (
    <div className="space-y-6">
      {/* CAPÇALERA */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-[var(--muted)] text-sm">Visió financera · Projecte Zero Stock</p>
        </div>
        <span className="text-xs text-[var(--muted)]">{TODAY.toLocaleDateString("ca-ES", { day: "2-digit", month: "long", year: "numeric" })}</span>
      </div>

      {/* ── FILA 1: els 4 grans indicadors ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Vendes */}
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4">
          <p className="text-xs text-[var(--muted)] uppercase tracking-wide">Vendes (base)</p>
          <p className="text-2xl font-bold tabular-nums mt-1" style={{ color: "var(--bumbba)" }}>
            {fmt(vendesBase, 0)}
          </p>
          <p className="text-xs text-[var(--muted)] mt-1">
            Cobrat: <span className="text-green-600 font-medium">{fmt(cobrat, 0)}</span>
            {pendentCobrar > 0 && <> · pendent: <span className="text-amber-600 font-medium">{fmt(pendentCobrar, 0)}</span></>}
          </p>
        </div>

        {/* Compres */}
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4">
          <p className="text-xs text-[var(--muted)] uppercase tracking-wide">Compres (base)</p>
          <p className="text-2xl font-bold tabular-nums mt-1" style={{ color: "var(--sunbba)" }}>
            {fmt(compresBase, 0)}
          </p>
          <p className="text-xs text-[var(--muted)] mt-1">
            Pagat: <span className="text-green-600 font-medium">{fmt(pagat, 0)}</span>
            {pendentPagar > 0 && <> · pendent: <span className="text-red-600 font-medium">{fmt(pendentPagar, 0)}</span></>}
          </p>
        </div>

        {/* Marge brut */}
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4">
          <p className="text-xs text-[var(--muted)] uppercase tracking-wide">Marge brut</p>
          <p className="text-2xl font-bold tabular-nums mt-1" style={{ color: margeColor }}>
            {fmt(margeBase, 0)}
          </p>
          <p className="text-xs mt-1 font-semibold" style={{ color: margeColor }}>
            {margePct.toFixed(1)}% sobre vendes
          </p>
        </div>

        {/* Tresoreria neta */}
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4">
          <p className="text-xs text-[var(--muted)] uppercase tracking-wide">Caixa neta</p>
          <p className="text-2xl font-bold tabular-nums mt-1" style={{ color: tresoreriaColor }}>
            {tresoreriaNet >= 0 ? "+" : ""}{fmt(tresoreriaNet, 0)}
          </p>
          <p className="text-xs text-[var(--muted)] mt-1">Cobrat − pagat efectivament</p>
        </div>
      </div>

      {/* ── FILA 2: Valor inventari + Salut financera ── */}
      <div className="grid md:grid-cols-2 gap-3">

        {/* Valor inventari */}
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Valor inventari actual</h2>
            <Link href="/inventari" className="text-xs text-[var(--bumbba)] hover:underline">Veure →</Link>
          </div>
          <p className="text-3xl font-bold tabular-nums">
            {fmt(valorInventari, 0)}
          </p>
          <p className="text-xs text-[var(--muted)] mt-1 mb-4">
            Preu de cost × unitats en estoc (components amb cost &gt; 0)
          </p>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span style={{ color: "var(--bumbba)" }}>BUMBBA</span>
              <span className="font-semibold tabular-nums">{fmt(valorBumbba, 0)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span style={{ color: "var(--sunbba)" }}>SUNBBA</span>
              <span className="font-semibold tabular-nums">{fmt(valorSunbba, 0)}</span>
            </div>
            {compsSenseCost > 0 && (
              <p className="text-xs text-amber-600 mt-2">
                ⚠ {compsSenseCost} components amb stock però sense cost configurat (no inclosos)
              </p>
            )}
          </div>
        </div>

        {/* Salut financera */}
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
          <h2 className="font-semibold mb-3">Diagnòstic ràpid</h2>
          <div className="space-y-3">
            <Indicador
              label="Marge brut"
              ok={margePct >= 20}
              warn={margePct >= 10 && margePct < 20}
              text={`${margePct.toFixed(1)}% — ${margePct >= 30 ? "molt bo" : margePct >= 20 ? "acceptable" : margePct >= 10 ? "baix" : "crític"}`}
            />
            <Indicador
              label="Tresoreria"
              ok={tresoreriaNet >= 0}
              warn={tresoreriaNet < 0 && tresoreriaNet > -10000}
              text={tresoreriaNet >= 0 ? `+${fmt(tresoreriaNet, 0)} positiva` : `${fmt(tresoreriaNet, 0)} negativa`}
            />
            <Indicador
              label="Pendent cobrar"
              ok={pendentCobrar === 0}
              warn={pendentCobrar > 0 && pendentCobrar < 30000}
              text={pendentCobrar === 0 ? "Tot cobrat" : `${fmt(pendentCobrar, 0)} pendents`}
            />
            <Indicador
              label="Pendent pagar"
              ok={pendentPagar < 20000}
              warn={pendentPagar >= 20000 && pendentPagar < 60000}
              text={`${fmt(pendentPagar, 0)} a proveïdors`}
            />
            <Indicador
              label="Stock negatiu"
              ok={negatives.length === 0}
              warn={negatives.length <= 5}
              text={negatives.length === 0 ? "Cap descuadre" : `${negatives.length} descuadres`}
            />
          </div>
        </div>
      </div>

      {/* ── FILA 3: Venciments propers ── */}
      {proxims.length > 0 && (
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-[var(--border)] flex items-center justify-between">
            <h2 className="font-semibold">Propers pagaments a proveïdors</h2>
            <Link href="/finances" className="text-xs text-[var(--bumbba)] hover:underline">Finances completes →</Link>
          </div>
          <div className="divide-y divide-[var(--border)]">
            {proxims.map((inv: any) => {
              const isOverdue = inv.days < 0;
              const isUrgent  = inv.days >= 0 && inv.days <= 7;
              return (
                <div key={inv.invoice_number + inv.supplier} className={`flex items-center justify-between px-4 py-2.5 text-sm ${isOverdue ? "bg-red-50/40" : ""}`}>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2 py-0.5 rounded font-medium min-w-[70px] text-center ${
                      isOverdue ? "bg-red-100 text-red-700" :
                      isUrgent  ? "bg-amber-100 text-amber-700" :
                                  "bg-slate-100 text-slate-600"
                    }`}>
                      {isOverdue ? `${Math.abs(inv.days)}d tard` : inv.days === 0 ? "avui" : `${inv.days}d`}
                    </span>
                    <div>
                      <span className="font-medium">{inv.supplier}</span>
                      <span className="text-[var(--muted)] ml-2 text-xs capitalize">{inv.category}</span>
                    </div>
                  </div>
                  <span className="font-semibold tabular-nums">{fmt(inv.total_amount, 2)}</span>
                </div>
              );
            })}
          </div>
          <div className="px-4 py-2.5 border-t border-[var(--border)] bg-[var(--background)] flex justify-between text-sm">
            <span className="text-[var(--muted)]">Total proper a pagar</span>
            <span className="font-bold tabular-nums">{fmt(proxims.reduce((s: number, i: any) => s + i.total_amount, 0), 2)}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function Indicador({ label, ok, warn, text }: { label: string; ok: boolean; warn: boolean; text: string }) {
  const color = ok ? "#16a34a" : warn ? "#b45309" : "#dc2626";
  const dot   = ok ? "●" : warn ? "●" : "●";
  return (
    <div className="flex items-center justify-between text-sm">
      <div className="flex items-center gap-2">
        <span style={{ color, fontSize: "10px" }}>{dot}</span>
        <span className="text-[var(--muted)]">{label}</span>
      </div>
      <span className="font-medium" style={{ color }}>{text}</span>
    </div>
  );
}
