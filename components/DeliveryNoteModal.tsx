"use client";

import { useState, useRef } from "react";
import { supabase } from "@/lib/supabase";

interface ParsedLine {
  supplier_code: string | null;
  description: string;
  quantity: number;
  unit: string;
  unit_price: number | null;
  amount: number | null;
  to_inventory: boolean;
  suggested_sku: string | null;
}

interface ParsedAlbara {
  number: string;
  note_date: string;
  supplier: string;
  base_amount: number | null;
  notes: string | null;
  line_items: ParsedLine[];
}

interface ComponentRow { id: number; sku: string; name: string; tenant_id: string; }

export default function DeliveryNoteModal({ components }: { components: ComponentRow[] }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"upload" | "review" | "saving" | "done">("upload");
  const [parsed, setParsed] = useState<ParsedAlbara | null>(null);
  const [lineChecked, setLineChecked] = useState<boolean[]>([]);
  const [lineMappedSku, setLineMappedSku] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const skuOptions = components.map(c => ({ value: c.sku, label: `${c.sku} — ${c.name} (${c.tenant_id})` }));

  function reset() {
    setStep("upload"); setParsed(null); setLineChecked([]); setLineMappedSku([]);
    setError(""); setLoading(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true); setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("type", "albara");
      const res = await fetch("/api/parse-invoice", { method: "POST", body: fd });
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      const data: ParsedAlbara = json.data;
      setParsed(data);
      const items = data.line_items ?? [];
      setLineChecked(items.map(l => l.to_inventory));
      setLineMappedSku(items.map(l => l.suggested_sku ?? ""));
      setStep("review");
    } catch (err: any) {
      setError(err.message ?? "Error analitzant el PDF");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!parsed) return;
    setStep("saving");
    try {
      // 1. Inserir albarà
      const { data: dn, error: dnErr } = await supabase
        .from("delivery_notes")
        .insert({
          number: parsed.number,
          supplier: parsed.supplier,
          note_date: parsed.note_date,
          base_amount: parsed.base_amount,
          notes: parsed.notes,
          status: "pending_invoice",
        })
        .select("id")
        .single();
      if (dnErr) throw new Error(dnErr.message);

      // 2. Moure stock per cada línia marcada
      const items = parsed.line_items ?? [];
      for (let i = 0; i < items.length; i++) {
        if (!lineChecked[i] || !lineMappedSku[i]) continue;
        const comp = components.find(c => c.sku === lineMappedSku[i]);
        if (!comp) continue;
        const { error: rpcErr } = await supabase.rpc("adjust_stock", {
          comp_id: comp.id,
          delta: items[i].quantity,
        });
        if (rpcErr) throw new Error(rpcErr.message);
        await supabase.from("stock_movements").insert({
          component_id: comp.id,
          delta: items[i].quantity,
          reason: `Albarà ${parsed.number} — ${parsed.supplier}`,
          source: "albara",
        });
      }

      setStep("done");
    } catch (err: any) {
      setError(err.message ?? "Error desant l'albarà");
      setStep("review");
    }
  }

  return (
    <>
      <button
        onClick={() => { setOpen(true); reset(); }}
        className="px-3 py-1.5 rounded-lg text-sm font-medium border border-[var(--border)] hover:bg-[var(--background)] transition-colors"
      >
        + Albarà
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-[var(--card)] rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
              <h2 className="font-bold text-lg">Nou albarà de compra</h2>
              <button onClick={() => setOpen(false)} className="text-[var(--muted)] hover:text-[var(--foreground)] text-xl leading-none">×</button>
            </div>

            <div className="p-5 space-y-4">
              {/* UPLOAD */}
              {step === "upload" && (
                <div className="space-y-3">
                  <p className="text-sm text-[var(--muted)]">Puja el PDF de l'albarà i la IA n'extraurà les línies.</p>
                  <input ref={fileRef} type="file" accept="application/pdf" onChange={handleFile} className="block w-full text-sm" />
                  {loading && <p className="text-sm text-[var(--muted)] animate-pulse">Analitzant PDF…</p>}
                  {error && <p className="text-sm text-red-600">{error}</p>}
                </div>
              )}

              {/* REVIEW */}
              {step === "review" && parsed && (
                <div className="space-y-4">
                  {/* Capçalera */}
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div><span className="text-[var(--muted)]">Número:</span> <strong>{parsed.number}</strong></div>
                    <div><span className="text-[var(--muted)]">Data:</span> <strong>{parsed.note_date}</strong></div>
                    <div><span className="text-[var(--muted)]">Proveïdor:</span> <strong>{parsed.supplier}</strong></div>
                    {parsed.base_amount != null && (
                      <div><span className="text-[var(--muted)]">Import:</span> <strong>{parsed.base_amount.toFixed(2)} €</strong></div>
                    )}
                  </div>

                  {/* Línies */}
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)] mb-2">
                      Línies — marca les que entren a l'stock
                    </p>
                    <div className="space-y-2">
                      {(parsed.line_items ?? []).map((line, i) => (
                        <div key={i} className={`border border-[var(--border)] rounded-lg p-3 text-sm ${lineChecked[i] ? "bg-[var(--background)]" : "opacity-60"}`}>
                          <div className="flex items-start gap-3">
                            <input
                              type="checkbox"
                              checked={lineChecked[i]}
                              onChange={e => setLineChecked(prev => prev.map((v, j) => j === i ? e.target.checked : v))}
                              className="mt-0.5"
                            />
                            <div className="flex-1 space-y-1.5">
                              <div className="flex justify-between">
                                <span className="font-medium">{line.description}</span>
                                <span className="tabular-nums text-[var(--muted)]">×{line.quantity} {line.unit}</span>
                              </div>
                              {lineChecked[i] && (
                                <select
                                  value={lineMappedSku[i]}
                                  onChange={e => setLineMappedSku(prev => prev.map((v, j) => j === i ? e.target.value : v))}
                                  className="select w-full text-xs"
                                >
                                  <option value="">— Selecciona component —</option>
                                  {skuOptions.map(o => (
                                    <option key={o.value} value={o.value}>{o.label}</option>
                                  ))}
                                </select>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {error && <p className="text-sm text-red-600">{error}</p>}

                  <div className="flex gap-2 justify-end pt-2">
                    <button onClick={reset} className="px-4 py-2 text-sm border border-[var(--border)] rounded-lg hover:bg-[var(--background)]">
                      Tornar
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={lineChecked.some((c, i) => c && !lineMappedSku[i])}
                      className="px-4 py-2 text-sm font-semibold text-white rounded-lg disabled:opacity-50"
                      style={{ background: "var(--bumbba)" }}
                    >
                      Confirmar i moure stock
                    </button>
                  </div>
                </div>
              )}

              {step === "saving" && (
                <p className="text-sm text-[var(--muted)] animate-pulse text-center py-6">Desant albarà i actualitzant stock…</p>
              )}

              {step === "done" && (
                <div className="text-center py-6 space-y-3">
                  <p className="text-green-600 font-semibold">Albarà desat i stock actualitzat.</p>
                  <button
                    onClick={() => { setOpen(false); window.location.reload(); }}
                    className="px-4 py-2 text-sm font-semibold text-white rounded-lg"
                    style={{ background: "var(--bumbba)" }}
                  >
                    Tancar
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
