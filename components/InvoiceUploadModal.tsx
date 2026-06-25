"use client";

import { useState, useRef, useEffect } from "react";
import { supabase } from "@/lib/supabase";

type Step = "idle" | "parsing" | "review" | "lines" | "saving" | "done" | "error";

// ── Tipus ──────────────────────────────────────────────────────────────────

interface ComponentOption {
  id: number;
  sku: string;
  name: string;
  tenant_id: string;
  stock_actual: number;
}

interface ProductOption {
  id: number;
  code: string;
  name: string;
  tenant_id: string;
}

interface ParsedLineItem {
  supplier_code: string;
  description: string;
  quantity: number;
  unit: string;
  unit_price: number;
  amount: number;
  to_inventory: boolean;
  suggested_sku: string | null;
}

interface InLine {
  component: ComponentOption;
  quantity: number;
}

interface OutLine {
  product: ProductOption;
  quantity: number;
}

// ── Helpers ────────────────────────────────────────────────────────────────

function fmt2(n: number | null) {
  if (n == null) return "—";
  return n.toLocaleString("ca-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
}

function Row({ label, value, bold }: { label: string; value: string | null | undefined; bold?: boolean }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-[var(--muted)]">{label}</span>
      <span className={bold ? "font-bold" : "font-medium text-right"}>{value ?? "—"}</span>
    </div>
  );
}

// ── Component principal ────────────────────────────────────────────────────

export default function InvoiceUploadModal() {
  const [open, setOpen]       = useState(false);
  const [type, setType]       = useState<"in" | "out">("in");
  const [step, setStep]       = useState<Step>("idle");
  const [parsed, setParsed]   = useState<any>(null);
  const [error, setError]     = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const fileRef = useRef<HTMLInputElement>(null);

  // Línies d'inventari (OUT manual)
  const [outLines, setOutLines] = useState<OutLine[]>([]);

  // Línies parsejades del PDF (IN)
  const [parsedLines, setParsedLines]       = useState<ParsedLineItem[]>([]);
  const [lineChecked, setLineChecked]       = useState<boolean[]>([]);
  const [lineMappedSku, setLineMappedSku]   = useState<string[]>([]);
  const [lineMappedSku2, setLineMappedSku2] = useState<string[]>([]);
  const [lineHasSecond, setLineHasSecond]   = useState<boolean[]>([]);

  // Dades per al selector de línies
  const [allComponents, setAllComponents] = useState<ComponentOption[]>([]);
  const [allProducts, setAllProducts]     = useState<ProductOption[]>([]);

  // Inputs del formulari OUT manual
  const [lineQty, setLineQty]     = useState(1);
  const [lineProd, setLineProd]   = useState<ProductOption | null>(null);

  function reset() {
    setStep("idle"); setParsed(null); setError(null); setFileName("");
    setOutLines([]); setParsedLines([]); setLineChecked([]); setLineMappedSku([]);
    setLineMappedSku2([]); setLineHasSecond([]);
    setLineQty(1); setLineProd(null);
    if (fileRef.current) fileRef.current.value = "";
  }
  function close() { setOpen(false); reset(); }

  // Carrega components/productes quan s'obre el pas "lines"
  useEffect(() => {
    if (step !== "lines") return;
    if (type === "in") {
      // Inicialitza les línies parsejades del PDF
      if (parsed?.line_items && parsedLines.length === 0) {
        const lines: ParsedLineItem[] = parsed.line_items;
        setParsedLines(lines);
        setLineChecked(lines.map((l: ParsedLineItem) => l.to_inventory));
        setLineMappedSku(lines.map((l: ParsedLineItem) => l.suggested_sku ?? ""));
        setLineMappedSku2(lines.map(() => ""));
        setLineHasSecond(lines.map(() => false));
      }
      if (allComponents.length === 0) {
        supabase.from("components")
          .select("id, sku, name, tenant_id, stock_actual")
          .order("tenant_id").order("name")
          .then(({ data }) => setAllComponents((data ?? []) as ComponentOption[]));
      }
    }
    if (type === "out") {
      if (parsed?.line_items && parsedLines.length === 0) {
        const lines: ParsedLineItem[] = parsed.line_items;
        setParsedLines(lines);
        setLineChecked(lines.map(() => true));
        setLineMappedSku(lines.map((l: any) => l.suggested_code ?? ""));
        setLineMappedSku2(lines.map(() => ""));
        setLineHasSecond(lines.map(() => false));
      }
      if (allProducts.length === 0) {
        supabase.from("products")
          .select("id, code, name, tenant_id")
          .order("tenant_id").order("code")
          .then(({ data }) => setAllProducts((data ?? []) as ProductOption[]));
      }
    }
  }, [step, type]);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setStep("parsing");
    setError(null);
    setParsed(null);

    const fd = new FormData();
    fd.append("file", file);
    fd.append("type", type);

    try {
      const res = await fetch("/api/parse-invoice", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok || json.error) throw new Error(json.error ?? "Error al parsejar");
      setParsed(json.data);
      setStep("review");
    } catch (err: any) {
      setError(err.message);
      setStep("error");
    }
  }

  function addOutLine() {
    if (!lineProd || lineQty <= 0) return;
    setOutLines(prev => [...prev, { product: lineProd!, quantity: lineQty }]);
    setLineProd(null); setLineQty(1);
  }

  async function handleSave(withInventory: boolean) {
    if (!parsed) return;
    setStep("saving");
    setError(null);

    try {
      if (type === "in") {
        const { data: inv, error: dbErr } = await supabase.from("invoices_in").insert({
          invoice_number: parsed.invoice_number,
          invoice_date:   parsed.invoice_date,
          supplier:       parsed.supplier,
          category:       parsed.category,
          base_amount:    parsed.base_amount,
          vat_pct:        parsed.vat_pct ?? 21,
          vat_amount:     parsed.vat_amount,
          total_amount:   parsed.total_amount,
          due_date:       parsed.due_date ?? null,
          status:         "pending",
          notes:          parsed.notes ?? null,
        }).select("id").single();
        if (dbErr) throw new Error(dbErr.message);

        if (withInventory) {
          // Agrupar línies marcades per SKU → sumar quantitats (suporta 2 SKUs per línia)
          const grouped: Record<string, number> = {};
          parsedLines.forEach((l, i) => {
            if (!lineChecked[i]) return;
            const qty = Math.round(l.quantity);
            if (lineMappedSku[i])  grouped[lineMappedSku[i]]  = (grouped[lineMappedSku[i]]  ?? 0) + qty;
            if (lineMappedSku2[i]) grouped[lineMappedSku2[i]] = (grouped[lineMappedSku2[i]] ?? 0) + qty;
          });

          for (const [sku, qty] of Object.entries(grouped)) {
            const comp = allComponents.find(c => c.sku === sku);
            if (!comp) continue;
            await supabase.from("invoice_in_lines").insert({
              invoice_id: inv!.id, component_id: comp.id, quantity: qty,
            });
            await supabase.rpc("adjust_stock", { comp_id: comp.id, delta: qty });
            await supabase.from("stock_movements").insert({
              component_id: comp.id,
              movement_type: "IN",
              quantity: qty,
              reason: `Factura compra ${parsed.invoice_number} — ${parsed.supplier}`,
            });
          }
        }

      } else {
        const { data: inv, error: dbErr } = await supabase.from("invoices_out").insert({
          invoice_number: parsed.invoice_number,
          invoice_date:   parsed.invoice_date,
          client:         parsed.client,
          base_amount:    parsed.base_amount,
          vat_pct:        parsed.vat_pct ?? 21,
          vat_amount:     parsed.vat_amount,
          total_amount:   parsed.total_amount,
          due_date:       parsed.due_date ?? null,
          status:         "pending",
          notes:          parsed.notes ?? null,
        }).select("id").single();
        if (dbErr) throw new Error(dbErr.message);

        if (withInventory) {
          for (let i = 0; i < parsedLines.length; i++) {
            if (!lineChecked[i] || !lineMappedSku[i]) continue;
            const prod = allProducts.find(p => p.code === lineMappedSku[i]);
            if (!prod) continue;
            const qty = Math.round(parsedLines[i].quantity);

            await supabase.from("invoice_out_lines").insert({
              invoice_id: inv!.id, product_id: prod.id, quantity: qty,
            });

            const { data: bomLines } = await supabase
              .from("bom")
              .select("quantity, component:components(id)")
              .eq("product_id", prod.id);

            for (const bom of bomLines ?? []) {
              const comp = bom.component as unknown as { id: number };
              const delta = Math.round(Number(bom.quantity) * qty);
              await supabase.rpc("adjust_stock", { comp_id: comp.id, delta: -delta });
              await supabase.from("stock_movements").insert({
                component_id: comp.id,
                movement_type: "OUT",
                quantity: delta,
                reason: `Factura venda ${parsed.invoice_number} — ${prod.code} ×${qty}`,
              });
            }
          }
        }
      }

      setStep("done");
    } catch (err: any) {
      setError(err.message);
      setStep("error");
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white"
        style={{ background: "var(--bumbba)" }}
      >
        <span>＋</span> Afegir factura PDF
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">

            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
              <h2 className="font-semibold text-lg">Afegir factura</h2>
              <button onClick={close} className="text-[var(--muted)] hover:text-[var(--foreground)] text-xl leading-none">×</button>
            </div>

            <div className="p-6 space-y-5">

              {/* Pas 1: tipus + fitxer */}
              {(step === "idle" || step === "parsing") && (
                <>
                  <div>
                    <p className="text-sm font-medium mb-2">Tipus de factura</p>
                    <div className="grid grid-cols-2 gap-2">
                      {(["in", "out"] as const).map(t => (
                        <button key={t} onClick={() => setType(t)}
                          className={`text-sm px-3 py-2.5 rounded-lg border text-left transition-colors ${
                            type === t ? "border-[var(--bumbba)] bg-[var(--bumbba)]/10 font-medium" : "border-[var(--border)] text-[var(--muted)]"
                          }`}
                        >
                          {t === "in" ? "🛒 Compra" : "📤 Venda"}
                          <span className="block text-xs mt-0.5 text-[var(--muted)]">
                            {t === "in" ? "Proveïdors" : "Nubba / clients"}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-2">Arxiu PDF</p>
                    <label className={`flex flex-col items-center justify-center w-full h-28 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
                      step === "parsing" ? "border-[var(--bumbba)] bg-[var(--bumbba)]/5" : "border-[var(--border)] hover:border-[var(--bumbba)]"
                    }`}>
                      {step === "parsing" ? (
                        <div className="text-center">
                          <div className="animate-spin text-2xl mb-1">⟳</div>
                          <p className="text-sm text-[var(--muted)]">Analitzant amb IA…</p>
                          <p className="text-xs text-[var(--muted)]">{fileName}</p>
                        </div>
                      ) : (
                        <div className="text-center">
                          <p className="text-2xl mb-1">📄</p>
                          <p className="text-sm text-[var(--muted)]">Fes clic o arrossega el PDF</p>
                        </div>
                      )}
                      <input ref={fileRef} type="file" accept="application/pdf"
                        className="hidden" disabled={step === "parsing"} onChange={handleFile} />
                    </label>
                  </div>
                </>
              )}

              {/* Pas 2: revisió */}
              {step === "review" && parsed && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
                    <span>✓</span> Factura llegida — revisa i continua
                  </div>
                  <div className="bg-[var(--background)] rounded-xl p-4 space-y-2 text-sm">
                    {type === "in" ? (
                      <>
                        <Row label="Proveïdor" value={parsed.supplier} />
                        <Row label="Nº Factura" value={parsed.invoice_number} />
                        <Row label="Data" value={parsed.invoice_date} />
                        <Row label="Categoria" value={parsed.category} />
                        <Row label="Base imposable" value={fmt2(parsed.base_amount)} />
                        <Row label="IVA" value={`${parsed.vat_pct ?? 21}% → ${fmt2(parsed.vat_amount)}`} />
                        <Row label="Total" value={fmt2(parsed.total_amount)} bold />
                        <Row label="Venciment" value={parsed.due_date ?? "—"} />
                      </>
                    ) : (
                      <>
                        <Row label="Client" value={parsed.client} />
                        <Row label="Nº Factura" value={parsed.invoice_number} />
                        <Row label="Data" value={parsed.invoice_date} />
                        <Row label="Base imposable" value={fmt2(parsed.base_amount)} />
                        <Row label="IVA" value={`${parsed.vat_pct ?? 21}% → ${fmt2(parsed.vat_amount)}`} />
                        <Row label="Total" value={fmt2(parsed.total_amount)} bold />
                        <Row label="Venciment" value={parsed.due_date ?? "—"} />
                      </>
                    )}
                    {parsed.notes && (
                      <div className="pt-1 border-t border-[var(--border)] text-xs text-[var(--muted)]">{parsed.notes}</div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={reset}
                      className="flex-1 px-4 py-2 rounded-lg border border-[var(--border)] text-sm text-[var(--muted)] hover:text-[var(--foreground)]">
                      Tornar
                    </button>
                    <button onClick={() => setStep("lines")}
                      className="flex-1 px-4 py-2 rounded-lg text-sm font-medium text-white"
                      style={{ background: "var(--bumbba)" }}>
                      Continuar → Inventari
                    </button>
                  </div>
                </div>
              )}

              {/* Pas 3: línies d'inventari */}
              {step === "lines" && (
                <div className="space-y-4">
                  <div>
                    <p className="font-medium text-sm">
                      {type === "in" ? "Quins components han entrat?" : "Quins productes s'han venut?"}
                    </p>
                    <p className="text-xs text-[var(--muted)] mt-0.5">
                      {type === "in"
                        ? "Afegeix cada component rebut per actualitzar l'stock."
                        : "Afegeix cada producte venut; el sistema restarà tots els materials del BOM."}
                    </p>
                  </div>

                  {/* Línies parsejades del PDF — IN */}
                  {type === "in" && parsedLines.length > 0 && (
                    <div className="space-y-1">
                      {parsedLines.map((l, i) => (
                        <div key={i} className={`rounded-lg border px-3 py-2 text-xs ${lineChecked[i] ? "border-[var(--bumbba)]/40 bg-[var(--bumbba)]/5" : "border-[var(--border)] opacity-50"}`}>
                          <div className="flex items-start gap-2">
                            <input type="checkbox" checked={lineChecked[i]}
                              onChange={e => setLineChecked(prev => prev.map((v, j) => j === i ? e.target.checked : v))}
                              className="mt-0.5 shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between gap-2">
                                <span className="font-medium truncate">{l.description}</span>
                                <span className="shrink-0 tabular-nums text-[var(--muted)]">
                                  {l.quantity} {l.unit}
                                </span>
                              </div>
                              {lineChecked[i] && (
                                <div className="mt-1.5 space-y-1">
                                  {/* SKU 1 */}
                                  <div className="flex gap-1">
                                    <select
                                      value={lineMappedSku[i]}
                                      onChange={e => setLineMappedSku(prev => prev.map((v, j) => j === i ? e.target.value : v))}
                                      className="flex-1 text-xs rounded-md border border-[var(--border)] bg-[var(--background)] px-2 py-1"
                                    >
                                      <option value="">— Component 1 —</option>
                                      {["BUMBBA","SUNBBA"].map(t => (
                                        <optgroup key={t} label={t}>
                                          {allComponents.filter(c => c.tenant_id === t).map(c => (
                                            <option key={c.id} value={c.sku}>{c.sku} — {c.name}</option>
                                          ))}
                                        </optgroup>
                                      ))}
                                    </select>
                                    {!lineHasSecond[i] && (
                                      <button
                                        title="Afegir segon component (ex: matalàs + funda junts)"
                                        onClick={() => setLineHasSecond(prev => prev.map((v, j) => j === i ? true : v))}
                                        className="shrink-0 w-6 h-6 flex items-center justify-center rounded border border-[var(--border)] text-[var(--muted)] hover:border-[var(--bumbba)] hover:text-[var(--bumbba)] text-xs"
                                      >+</button>
                                    )}
                                  </div>
                                  {/* SKU 2 (opcional) */}
                                  {lineHasSecond[i] && (
                                    <div className="flex gap-1">
                                      <select
                                        value={lineMappedSku2[i]}
                                        onChange={e => setLineMappedSku2(prev => prev.map((v, j) => j === i ? e.target.value : v))}
                                        className="flex-1 text-xs rounded-md border border-[var(--bumbba)]/50 bg-[var(--bumbba)]/5 px-2 py-1"
                                      >
                                        <option value="">— Component 2 —</option>
                                        {["BUMBBA","SUNBBA"].map(t => (
                                          <optgroup key={t} label={t}>
                                            {allComponents.filter(c => c.tenant_id === t).map(c => (
                                              <option key={c.id} value={c.sku}>{c.sku} — {c.name}</option>
                                            ))}
                                          </optgroup>
                                        ))}
                                      </select>
                                      <button
                                        title="Eliminar segon component"
                                        onClick={() => {
                                          setLineHasSecond(prev => prev.map((v, j) => j === i ? false : v));
                                          setLineMappedSku2(prev => prev.map((v, j) => j === i ? "" : v));
                                        }}
                                        className="shrink-0 w-6 h-6 flex items-center justify-center rounded border border-[var(--border)] text-[var(--muted)] hover:border-red-400 hover:text-red-400 text-xs"
                                      >×</button>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Resum agrupat */}
                  {type === "in" && parsedLines.length > 0 && (() => {
                    const grouped: Record<string, number> = {};
                    parsedLines.forEach((l, i) => {
                      if (!lineChecked[i]) return;
                      const qty = Math.round(l.quantity);
                      if (lineMappedSku[i])  grouped[lineMappedSku[i]]  = (grouped[lineMappedSku[i]]  ?? 0) + qty;
                      if (lineMappedSku2[i]) grouped[lineMappedSku2[i]] = (grouped[lineMappedSku2[i]] ?? 0) + qty;
                    });
                    const entries = Object.entries(grouped);
                    if (entries.length === 0) return null;
                    return (
                      <div className="bg-[var(--background)] rounded-lg border border-[var(--border)] p-3">
                        <p className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wide mb-2">Resum — entrarà a stock</p>
                        <div className="space-y-1">
                          {entries.map(([sku, qty]) => (
                            <div key={sku} className="flex justify-between text-xs">
                              <span className="font-mono text-[var(--muted)]">{sku}</span>
                              <span className="font-semibold text-green-600">+{qty} u.</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Línies parsejades del PDF — OUT */}
                  {type === "out" && parsedLines.length > 0 && (
                    <div className="space-y-1">
                      {parsedLines.map((l, i) => (
                        <div key={i} className={`rounded-lg border px-3 py-2 text-xs ${lineChecked[i] ? "border-[var(--bumbba)]/40 bg-[var(--bumbba)]/5" : "border-[var(--border)] opacity-50"}`}>
                          <div className="flex items-start gap-2">
                            <input type="checkbox" checked={lineChecked[i]}
                              onChange={e => setLineChecked(prev => prev.map((v, j) => j === i ? e.target.checked : v))}
                              className="mt-0.5 shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between gap-2">
                                <span className="font-medium truncate">{l.description}</span>
                                <span className="shrink-0 tabular-nums text-[var(--muted)]">× {l.quantity} u.</span>
                              </div>
                              {lineChecked[i] && (
                                <div className="mt-1.5">
                                  <select
                                    value={lineMappedSku[i]}
                                    onChange={e => setLineMappedSku(prev => prev.map((v, j) => j === i ? e.target.value : v))}
                                    className="w-full text-xs rounded-md border border-[var(--border)] bg-[var(--background)] px-2 py-1"
                                  >
                                    <option value="">— Selecciona producte —</option>
                                    {["BUMBBA","SUNBBA"].map(t => (
                                      <optgroup key={t} label={t}>
                                        {allProducts.filter(p => p.tenant_id === t).map(p => (
                                          <option key={p.id} value={p.code}>{p.code} — {p.name}</option>
                                        ))}
                                      </optgroup>
                                    ))}
                                  </select>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Resum agrupat OUT */}
                  {type === "out" && parsedLines.length > 0 && (() => {
                    const grouped: Record<string, number> = {};
                    parsedLines.forEach((l, i) => {
                      const code = lineMappedSku[i];
                      if (lineChecked[i] && code) grouped[code] = (grouped[code] ?? 0) + Math.round(l.quantity);
                    });
                    const entries = Object.entries(grouped);
                    if (entries.length === 0) return null;
                    return (
                      <div className="bg-[var(--background)] rounded-lg border border-[var(--border)] p-3">
                        <p className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wide mb-2">Resum — sortirà de stock (via BOM)</p>
                        <div className="space-y-1">
                          {entries.map(([code, qty]) => (
                            <div key={code} className="flex justify-between text-xs">
                              <span className="font-mono text-[var(--muted)]">{code}</span>
                              <span className="font-semibold text-red-500">−{qty} u.</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}

                  <div className="flex gap-2 pt-1">
                    <button onClick={() => handleSave(false)}
                      className="flex-1 px-4 py-2 rounded-lg border border-[var(--border)] text-sm text-[var(--muted)] hover:text-[var(--foreground)]">
                      Guardar sense inventari
                    </button>
                    <button
                      onClick={() => handleSave(true)}
                      disabled={!lineChecked.some((v, i) => v && lineMappedSku[i])}
                      className="flex-1 px-4 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-40"
                      style={{ background: "var(--bumbba)" }}>
                      Guardar i actualitzar stock
                    </button>
                  </div>
                </div>
              )}

              {/* Guardant */}
              {step === "saving" && (
                <div className="text-center py-6">
                  <div className="animate-spin text-3xl mb-2">⟳</div>
                  <p className="text-sm text-[var(--muted)]">Guardant a la base de dades…</p>
                </div>
              )}

              {/* Fet */}
              {step === "done" && (
                <div className="text-center py-6 space-y-3">
                  <div className="text-4xl">✅</div>
                  <p className="font-medium">Factura guardada correctament</p>
                  <p className="text-xs text-[var(--muted)]">
                    {lineChecked.some((v, i) => v && lineMappedSku[i])
                      ? "Finances i inventari actualitzats."
                      : "Guardada a Finances. Inventari no modificat."}
                  </p>
                  <div className="flex gap-2 justify-center">
                    <button onClick={reset} className="px-4 py-2 rounded-lg border border-[var(--border)] text-sm">
                      Afegir una altra
                    </button>
                    <button onClick={close} className="px-4 py-2 rounded-lg text-sm font-medium text-white" style={{ background: "var(--bumbba)" }}>
                      Tancar
                    </button>
                  </div>
                </div>
              )}

              {/* Error */}
              {step === "error" && (
                <div className="space-y-3">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
                    <p className="font-medium mb-1">Error</p>
                    <p>{error}</p>
                  </div>
                  <button onClick={reset} className="w-full px-4 py-2 rounded-lg border border-[var(--border)] text-sm">
                    Tornar
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </>
  );
}
