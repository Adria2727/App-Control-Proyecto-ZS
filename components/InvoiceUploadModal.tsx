"use client";

import { useState, useRef, useEffect } from "react";
import { supabase } from "@/lib/supabase";

type Step = "idle" | "parsing" | "review" | "lines" | "saving" | "done" | "error";

// ── Tipus ──────────────────────────────────────────────────────────────────

interface ComponentOption {
  id: number;
  sku: string;
  name: string;
  color_code: string | null;
  tenant_id: string;
  stock_actual: number;
}

interface ProductOption {
  id: number;
  code: string;
  name: string;
  tenant_id: string;
}

interface ColorOption {
  code: string;
  name: string;
  tenant_id: string;
}

interface InLine {
  component: ComponentOption;
  quantity: number;
}

interface OutLine {
  product: ProductOption;
  color_code: string;
  quantity: number;
}

const COLOR_NAMES: Record<string, string> = {
  PVC: "Light Green", PGC: "Arctic Sand", PGO: "Shadow Grey",
  GR: "Dark Grey", BG: "Beige",
  PC04: "Light Ivory", PC37: "Green Olive", PC82: "Grey Stone", PC99: "Graphite Grey",
};

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

  // Línies d'inventari
  const [inLines, setInLines]   = useState<InLine[]>([]);
  const [outLines, setOutLines] = useState<OutLine[]>([]);

  // Dades per al selector de línies
  const [allComponents, setAllComponents] = useState<ComponentOption[]>([]);
  const [allProducts, setAllProducts]     = useState<ProductOption[]>([]);
  const [allColors, setAllColors]         = useState<ColorOption[]>([]);

  // Inputs del formulari de línies
  const [lineCompSearch, setLineCompSearch] = useState("");
  const [lineComp, setLineComp]   = useState<ComponentOption | null>(null);
  const [lineQty, setLineQty]     = useState(1);
  const [lineProd, setLineProd]   = useState<ProductOption | null>(null);
  const [lineColor, setLineColor] = useState("");

  function reset() {
    setStep("idle"); setParsed(null); setError(null); setFileName("");
    setInLines([]); setOutLines([]);
    setLineCompSearch(""); setLineComp(null); setLineQty(1);
    setLineProd(null); setLineColor("");
    if (fileRef.current) fileRef.current.value = "";
  }
  function close() { setOpen(false); reset(); }

  // Carrega components/productes quan s'obre el pas "lines"
  useEffect(() => {
    if (step !== "lines") return;
    if (type === "in" && allComponents.length === 0) {
      supabase.from("components")
        .select("id, sku, name, color_code, tenant_id, stock_actual")
        .order("tenant_id").order("name")
        .then(({ data }) => setAllComponents((data ?? []) as ComponentOption[]));
    }
    if (type === "out" && allProducts.length === 0) {
      supabase.from("products")
        .select("id, code, name, tenant_id")
        .eq("bom_active", true)
        .order("tenant_id").order("code")
        .then(({ data }) => setAllProducts((data ?? []) as ProductOption[]));
      supabase.from("colors")
        .select("code, name, tenant_id")
        .eq("is_active", true)
        .order("tenant_id").order("code")
        .then(({ data }) => setAllColors((data ?? []) as ColorOption[]));
    }
  }, [step, type]);

  // Quan es canvia el producte OUT, establir color per defecte
  useEffect(() => {
    if (!lineProd) return;
    const colors = allColors.filter(c => c.tenant_id === lineProd.tenant_id);
    if (colors.length > 0 && !lineColor) setLineColor(colors[0].code);
  }, [lineProd, allColors]);

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

  function addInLine() {
    if (!lineComp || lineQty <= 0) return;
    setInLines(prev => [...prev, { component: lineComp!, quantity: lineQty }]);
    setLineComp(null); setLineCompSearch(""); setLineQty(1);
  }

  function addOutLine() {
    if (!lineProd || !lineColor || lineQty <= 0) return;
    setOutLines(prev => [...prev, { product: lineProd!, color_code: lineColor, quantity: lineQty }]);
    setLineProd(null); setLineColor(""); setLineQty(1);
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

        if (withInventory && inLines.length > 0) {
          for (const line of inLines) {
            await supabase.from("invoice_in_lines").insert({
              invoice_id: inv!.id, component_id: line.component.id, quantity: line.quantity,
            });
            await supabase.rpc("adjust_stock", { comp_id: line.component.id, delta: line.quantity });
            await supabase.from("stock_movements").insert({
              component_id: line.component.id,
              movement_type: "IN",
              quantity: line.quantity,
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

        if (withInventory && outLines.length > 0) {
          for (const line of outLines) {
            await supabase.from("invoice_out_lines").insert({
              invoice_id: inv!.id, product_id: line.product.id,
              color_code: line.color_code, quantity: line.quantity,
            });

            // Expandim el BOM i restem cada component
            const { data: bomLines } = await supabase
              .from("bom")
              .select("quantity, color_varies, component:components(id, sku, tenant_id)")
              .eq("product_id", line.product.id);

            for (const bom of bomLines ?? []) {
              const comp = bom.component as { id: number; sku: string; tenant_id: string };
              let compId = comp.id;

              if (bom.color_varies && line.color_code) {
                const { data: colorComp } = await supabase
                  .from("components")
                  .select("id")
                  .eq("tenant_id", comp.tenant_id)
                  .eq("sku", comp.sku)
                  .eq("color_code", line.color_code)
                  .single();
                if (colorComp) compId = colorComp.id;
              }

              const delta = Math.round(Number(bom.quantity) * line.quantity);
              await supabase.rpc("adjust_stock", { comp_id: compId, delta: -delta });
              await supabase.from("stock_movements").insert({
                component_id: compId,
                movement_type: "OUT",
                quantity: delta,
                reason: `Factura venda ${parsed.invoice_number} — ${line.product.code} ×${line.quantity} ${line.color_code}`,
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

  // ── Filtres del selector de components ──────────────────────────────────
  const filteredComponents = lineCompSearch.trim().length >= 2
    ? allComponents.filter(c =>
        `${c.name} ${c.sku} ${c.color_code ?? ""}`.toLowerCase().includes(lineCompSearch.toLowerCase())
      ).slice(0, 20)
    : [];

  const colorsForProduct = lineProd
    ? allColors.filter(c => c.tenant_id === lineProd.tenant_id)
    : [];

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

                  {/* Formulari afegir línia IN */}
                  {type === "in" && (
                    <div className="space-y-2">
                      <div className="relative">
                        <input
                          value={lineCompSearch}
                          onChange={e => { setLineCompSearch(e.target.value); setLineComp(null); }}
                          placeholder="Cerca component (nom, SKU, color)…"
                          className="select w-full text-sm"
                        />
                        {filteredComponents.length > 0 && !lineComp && (
                          <div className="absolute top-full left-0 right-0 z-10 bg-[var(--card)] border border-[var(--border)] rounded-lg shadow-lg max-h-48 overflow-y-auto mt-1">
                            {filteredComponents.map(c => (
                              <button key={c.id} onClick={() => { setLineComp(c); setLineCompSearch(`${c.name}${c.color_code ? ` ${COLOR_NAMES[c.color_code] ?? c.color_code}` : ""} (${c.sku})`); }}
                                className="w-full text-left px-3 py-2 text-sm hover:bg-[var(--background)] flex justify-between">
                                <span>{c.name}{c.color_code ? ` — ${COLOR_NAMES[c.color_code] ?? c.color_code}` : ""}</span>
                                <span className="text-xs text-[var(--muted)]">stock: {c.stock_actual}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <input type="number" min={1} value={lineQty} onChange={e => setLineQty(Number(e.target.value))}
                          className="select w-24 text-sm" placeholder="Qty" />
                        <button onClick={addInLine} disabled={!lineComp || lineQty <= 0}
                          className="flex-1 px-3 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-40"
                          style={{ background: "var(--bumbba)" }}>
                          + Afegir
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Formulari afegir línia OUT */}
                  {type === "out" && (
                    <div className="space-y-2">
                      <select value={lineProd?.id ?? ""} onChange={e => {
                          const p = allProducts.find(x => x.id === Number(e.target.value)) ?? null;
                          setLineProd(p); setLineColor("");
                        }}
                        className="select w-full text-sm">
                        <option value="">— Selecciona producte —</option>
                        {["BUMBBA","SUNBBA"].map(t => (
                          <optgroup key={t} label={t}>
                            {allProducts.filter(p => p.tenant_id === t).map(p => (
                              <option key={p.id} value={p.id}>{p.code} — {p.name}</option>
                            ))}
                          </optgroup>
                        ))}
                      </select>
                      <div className="flex gap-2">
                        <select value={lineColor} onChange={e => setLineColor(e.target.value)}
                          className="select flex-1 text-sm" disabled={!lineProd}>
                          <option value="">— Color —</option>
                          {colorsForProduct.map(c => (
                            <option key={c.code} value={c.code}>{c.code} · {c.name}</option>
                          ))}
                        </select>
                        <input type="number" min={1} value={lineQty} onChange={e => setLineQty(Number(e.target.value))}
                          className="select w-20 text-sm" placeholder="Qty" />
                        <button onClick={addOutLine} disabled={!lineProd || !lineColor || lineQty <= 0}
                          className="px-3 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-40"
                          style={{ background: "var(--bumbba)" }}>
                          +
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Llistat de línies afegides */}
                  {(type === "in" ? inLines : outLines).length > 0 && (
                    <div className="bg-[var(--background)] rounded-xl border border-[var(--border)] overflow-hidden">
                      <div className="text-xs font-medium text-[var(--muted)] px-3 py-2 border-b border-[var(--border)]">
                        Línies afegides
                      </div>
                      {type === "in" && inLines.map((l, i) => (
                        <div key={i} className="flex items-center justify-between px-3 py-2 text-sm border-b border-[var(--border)] last:border-0">
                          <span>{l.component.name}{l.component.color_code ? ` ${COLOR_NAMES[l.component.color_code] ?? l.component.color_code}` : ""}</span>
                          <div className="flex items-center gap-3">
                            <span className="font-semibold text-green-600">+{l.quantity}</span>
                            <button onClick={() => setInLines(prev => prev.filter((_, j) => j !== i))}
                              className="text-[var(--muted)] hover:text-red-500 text-xs">✕</button>
                          </div>
                        </div>
                      ))}
                      {type === "out" && outLines.map((l, i) => (
                        <div key={i} className="flex items-center justify-between px-3 py-2 text-sm border-b border-[var(--border)] last:border-0">
                          <span>{l.product.code} — {l.product.name} <span className="text-[var(--muted)]">({COLOR_NAMES[l.color_code] ?? l.color_code})</span></span>
                          <div className="flex items-center gap-3">
                            <span className="font-semibold text-red-500">−{l.quantity} u.</span>
                            <button onClick={() => setOutLines(prev => prev.filter((_, j) => j !== i))}
                              className="text-[var(--muted)] hover:text-red-500 text-xs">✕</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2 pt-1">
                    <button onClick={() => handleSave(false)}
                      className="flex-1 px-4 py-2 rounded-lg border border-[var(--border)] text-sm text-[var(--muted)] hover:text-[var(--foreground)]">
                      Guardar sense inventari
                    </button>
                    <button
                      onClick={() => handleSave(true)}
                      disabled={(type === "in" ? inLines : outLines).length === 0}
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
                    {(type === "in" ? inLines : outLines).length > 0
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
