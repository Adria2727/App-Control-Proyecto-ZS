"use client";

import { useState, useRef } from "react";
import { supabase } from "@/lib/supabase";

type Step = "idle" | "parsing" | "review" | "saving" | "done" | "error";

function fmt2(n: number | null) {
  if (n == null) return "—";
  return n.toLocaleString("ca-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
}

export default function InvoiceUploadModal() {
  const [open, setOpen]       = useState(false);
  const [type, setType]       = useState<"in" | "out">("in");
  const [step, setStep]       = useState<Step>("idle");
  const [parsed, setParsed]   = useState<any>(null);
  const [error, setError]     = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const fileRef = useRef<HTMLInputElement>(null);

  function reset() {
    setStep("idle");
    setParsed(null);
    setError(null);
    setFileName("");
    if (fileRef.current) fileRef.current.value = "";
  }

  function close() { setOpen(false); reset(); }

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

  async function handleSave() {
    if (!parsed) return;
    setStep("saving");
    setError(null);

    if (type === "in") {
      const { error: dbErr } = await supabase.from("invoices_in").insert({
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
      });
      if (dbErr) { setError(dbErr.message); setStep("error"); return; }
    } else {
      const { error: dbErr } = await supabase.from("invoices_out").insert({
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
      });
      if (dbErr) { setError(dbErr.message); setStep("error"); return; }
    }
    setStep("done");
  }

  const labelIn  = "Factura de compra (proveïdor → nosaltres)";
  const labelOut = "Factura de venda (nosaltres → Nubba/client)";

  return (
    <>
      {/* Botó d'obertura */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white"
        style={{ background: "var(--bumbba)" }}
      >
        <span>＋</span> Afegir factura PDF
      </button>

      {/* Overlay */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl w-full max-w-lg shadow-xl">

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
              <h2 className="font-semibold text-lg">Afegir factura</h2>
              <button onClick={close} className="text-[var(--muted)] hover:text-[var(--foreground)] text-xl leading-none">×</button>
            </div>

            <div className="p-6 space-y-5">

              {/* Pas 1: selecció tipus + fitxer */}
              {(step === "idle" || step === "parsing") && (
                <>
                  <div>
                    <p className="text-sm font-medium mb-2">Tipus de factura</p>
                    <div className="grid grid-cols-2 gap-2">
                      {(["in", "out"] as const).map(t => (
                        <button
                          key={t}
                          onClick={() => setType(t)}
                          className={`text-sm px-3 py-2.5 rounded-lg border text-left transition-colors ${
                            type === t
                              ? "border-[var(--bumbba)] bg-[var(--bumbba)]/10 font-medium"
                              : "border-[var(--border)] text-[var(--muted)]"
                          }`}
                        >
                          {t === "in" ? "🛒 Compra" : "📤 Venda"}
                          <span className="block text-xs mt-0.5 text-[var(--muted)]">
                            {t === "in" ? "Proveïdors" : "Nubba / clients"}
                          </span>
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-[var(--muted)] mt-2">
                      {type === "in" ? labelIn : labelOut}
                    </p>
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
                      <input
                        ref={fileRef}
                        type="file"
                        accept="application/pdf"
                        className="hidden"
                        disabled={step === "parsing"}
                        onChange={handleFile}
                      />
                    </label>
                  </div>
                </>
              )}

              {/* Pas 2: revisió */}
              {step === "review" && parsed && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
                    <span>✓</span> Factura llegida correctament — revisa i confirma
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
                      <div className="pt-1 border-t border-[var(--border)] text-xs text-[var(--muted)]">
                        {parsed.notes}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={reset}
                      className="flex-1 px-4 py-2 rounded-lg border border-[var(--border)] text-sm text-[var(--muted)] hover:text-[var(--foreground)]"
                    >
                      Tornar
                    </button>
                    <button
                      onClick={handleSave}
                      className="flex-1 px-4 py-2 rounded-lg text-sm font-medium text-white"
                      style={{ background: "var(--bumbba)" }}
                    >
                      Guardar a Supabase
                    </button>
                  </div>
                </div>
              )}

              {/* Saving */}
              {step === "saving" && (
                <div className="text-center py-6">
                  <div className="animate-spin text-3xl mb-2">⟳</div>
                  <p className="text-sm text-[var(--muted)]">Guardant a la base de dades…</p>
                </div>
              )}

              {/* Done */}
              {step === "done" && (
                <div className="text-center py-6 space-y-3">
                  <div className="text-4xl">✅</div>
                  <p className="font-medium">Factura guardada correctament</p>
                  <p className="text-xs text-[var(--muted)]">Ja apareix a l'apartat de Finances</p>
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

function Row({ label, value, bold }: { label: string; value: string | null | undefined; bold?: boolean }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-[var(--muted)]">{label}</span>
      <span className={bold ? "font-bold" : "font-medium text-right"}>{value ?? "—"}</span>
    </div>
  );
}
