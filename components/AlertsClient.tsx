"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Component, DeliveryNote, InvoiceIn } from "@/lib/types";
import { EconomicAlert } from "@/app/alertes/page";

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("ca-ES", { day: "2-digit", month: "2-digit", year: "numeric" });
}
function daysSince(d: string) {
  return Math.floor((Date.now() - new Date(d).getTime()) / 86400000);
}
function fmt(n: number) {
  return n.toLocaleString("ca-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
}

type ComponentWithNoted = Component & { reorder_noted: boolean; reorder_noted_at: string | null };

const ECON_STORAGE_KEY = "econ_dismissed_v1";

function loadDismissed(): Record<string, number> {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(localStorage.getItem(ECON_STORAGE_KEY) ?? "{}"); } catch { return {}; }
}
function saveDismissed(d: Record<string, number>) {
  localStorage.setItem(ECON_STORAGE_KEY, JSON.stringify(d));
}

export default function AlertsClient({
  negatives: initNeg,
  noted: initNoted,
  overdueInvoices: initInvoices,
  lateNotes: initNotes,
  econAlerts,
}: {
  negatives: ComponentWithNoted[];
  noted: ComponentWithNoted[];
  overdueInvoices: InvoiceIn[];
  lateNotes: DeliveryNote[];
  econAlerts: EconomicAlert[];
}) {
  const [negatives, setNegatives] = useState(initNeg);
  const [noted, setNoted]         = useState(initNoted);
  const [invoices, setInvoices]   = useState(initInvoices);
  const [notes, setNotes]         = useState(initNotes);

  // Alertes econòmiques: filtrar les descartades fa menys de 5 dies
  const FIVE_DAYS = 5 * 24 * 60 * 60 * 1000;
  const [dismissed, setDismissed] = useState<Record<string, number>>(() => {
    const d = loadDismissed();
    const now = Date.now();
    // Netejar les que fa més de 5 dies
    return Object.fromEntries(Object.entries(d).filter(([, t]) => now - t < FIVE_DAYS));
  });

  const visibleEcon = econAlerts.filter(a => !dismissed[a.key]);
  const totalActive = negatives.length + invoices.length + notes.length + visibleEcon.length;

  function dismissEcon(key: string) {
    const updated = { ...dismissed, [key]: Date.now() };
    setDismissed(updated);
    saveDismissed(updated);
  }

  async function markReordered(c: ComponentWithNoted) {
    const now = new Date().toISOString();
    await supabase.from("components").update({ reorder_noted: true, reorder_noted_at: now }).eq("id", c.id);
    setNegatives(prev => prev.filter(x => x.id !== c.id));
    setNoted(prev => [...prev, { ...c, reorder_noted: true, reorder_noted_at: now }]);
  }

  async function markPaid(inv: InvoiceIn) {
    await supabase.from("invoices_in").update({ status: "paid", paid_date: new Date().toISOString().split("T")[0] }).eq("id", inv.id);
    setInvoices(prev => prev.filter(x => x.id !== inv.id));
  }

  async function markInvoiced(n: DeliveryNote) {
    await supabase.from("delivery_notes").update({ status: "invoiced" }).eq("id", n.id);
    setNotes(prev => prev.filter(x => x.id !== n.id));
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          Alertes
          {totalActive > 0 && (
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold text-white"
              style={{ background: "var(--negative)" }}>
              {totalActive}
            </span>
          )}
        </h1>
        <p className="text-[var(--muted)] text-sm">Stock crític, factures vençudes, albarans pendents i indicadors econòmics</p>
      </div>

      {/* ── Indicadors econòmics ── */}
      <Section title={`Indicadors econòmics (${visibleEcon.length})`} color="#7c3aed" active={visibleEcon.length > 0}>
        {visibleEcon.length === 0
          ? <Empty text="Tots els indicadors econòmics estan bé" />
          : visibleEcon.map(a => (
            <Row key={a.key}>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full shrink-0"
                    style={{ background: a.severity === "high" ? "var(--negative)" : "#d97706" }} />
                  <span className="font-medium">{a.title}</span>
                </div>
                <p className="text-xs text-[var(--muted)] mt-0.5 ml-4">{a.body}</p>
              </div>
              <Btn onClick={() => dismissEcon(a.key)} color="#7c3aed">Llegit</Btn>
            </Row>
          ))
        }
      </Section>

      {/* ── Stock negatiu ── */}
      <Section title={`Stock negatiu (${negatives.length})`} color="#dc2626" active={negatives.length > 0}>
        {negatives.length === 0
          ? <Empty text="Cap stock negatiu actiu" />
          : negatives.map(c => (
            <Row key={c.id}>
              <div className="flex-1">
                <span style={{ color: c.tenant_id === "BUMBBA" ? "var(--bumbba)" : c.tenant_id === "SUNBBA" ? "var(--sunbba)" : "var(--muted)" }} className="text-xs mr-2">
                  {c.tenant_id === "SHARED" ? "Compartit" : c.tenant_id}
                </span>
                <span className="font-medium">{c.name}</span>
                <span className="ml-2 text-xs text-[var(--muted)]">{c.category_code}</span>
              </div>
              <span className="tabular-nums font-bold mr-3" style={{ color: "var(--negative)" }}>{c.stock_actual}</span>
              <Btn onClick={() => markReordered(c)} color="#dc2626">Demanat</Btn>
            </Row>
          ))
        }
        {noted.length > 0 && (
          <div className="px-4 py-2 border-t border-[var(--border)]">
            <p className="text-xs text-[var(--muted)] mb-1">Ja demanats ({noted.length})</p>
            {noted.map(c => (
              <div key={c.id} className="text-xs text-[var(--muted)] py-0.5 flex justify-between">
                <span>{c.name}</span><span>{c.stock_actual}</span>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* ── Factures vençudes ── */}
      <Section title={`Factures vençudes (${invoices.length})`} color="#b45309" active={invoices.length > 0}>
        {invoices.length === 0
          ? <Empty text="Cap factura vençuda pendent" />
          : invoices.map(inv => (
            <Row key={inv.id}>
              <div className="flex-1">
                <span className="font-medium">{inv.supplier}</span>
                <span className="font-mono text-xs text-[var(--muted)] ml-2">{inv.invoice_number}</span>
                {inv.due_date && (
                  <span className="ml-2 text-xs" style={{ color: "var(--negative)" }}>venc. {fmtDate(inv.due_date)}</span>
                )}
              </div>
              <span className="tabular-nums font-semibold mr-3">{fmt(inv.total_amount)}</span>
              <Btn onClick={() => markPaid(inv)} color="#16a34a">Pagat</Btn>
            </Row>
          ))
        }
      </Section>

      {/* ── Albarans per facturar ── */}
      <Section title={`Albarans sense factura +3 dies (${notes.length})`} color="#d97706" active={notes.length > 0}>
        {notes.length === 0
          ? <Empty text="Cap albarà pendent de factura" />
          : notes.map(n => (
            <Row key={n.id}>
              <div className="flex-1">
                <span className="font-mono font-medium text-xs">{n.number}</span>
                <span className="font-medium ml-2">{n.supplier}</span>
                <span className="ml-2 text-xs text-[var(--muted)]">{fmtDate(n.note_date)}</span>
              </div>
              <span className="text-xs font-semibold mr-3" style={{ color: "#d97706" }}>{daysSince(n.created_at)} dies</span>
              <Btn onClick={() => markInvoiced(n)} color="#b45309">Facturat</Btn>
            </Row>
          ))
        }
      </Section>
    </div>
  );
}

function Section({ title, color, active, children }: { title: string; color: string; active: boolean; children: React.ReactNode }) {
  return (
    <div className="bg-[var(--card)] border rounded-xl overflow-hidden" style={{ borderColor: active ? color : "var(--border)" }}>
      <div className="px-4 py-3 border-b border-[var(--border)] flex items-center gap-2"
        style={{ background: active ? `${color}15` : undefined }}>
        {active && <span className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />}
        <h2 className="font-semibold" style={{ color: active ? color : "var(--foreground)" }}>{title}</h2>
      </div>
      <div className="divide-y divide-[var(--border)]">{children}</div>
    </div>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="px-4 py-2.5 flex items-center gap-2 hover:bg-[var(--background)]">{children}</div>;
}

function Empty({ text }: { text: string }) {
  return <div className="px-4 py-4 text-sm text-[var(--muted)] italic">{text}</div>;
}

function Btn({ onClick, color, children }: { onClick: () => void; color: string; children: React.ReactNode }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="shrink-0 text-xs px-2.5 py-1 rounded-md font-medium border transition-colors"
      style={{
        borderColor: color,
        color: hovered ? "white" : color,
        background: hovered ? color : "transparent",
      }}
    >
      {children}
    </button>
  );
}
