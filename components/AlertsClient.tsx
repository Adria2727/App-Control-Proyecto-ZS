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

type ComponentWithNoted = Component & { reorder_noted: boolean };

export default function AlertsClient({
  negatives: initNeg,
  noted: initNoted,
  overdueInvoices: initInvoices,
  lateNotes: initNotes,
  unreadEcon: initUnread,
  readEcon: initRead,
}: {
  negatives: ComponentWithNoted[];
  noted: ComponentWithNoted[];
  overdueInvoices: InvoiceIn[];
  lateNotes: DeliveryNote[];
  unreadEcon: EconomicAlert[];
  readEcon: EconomicAlert[];
}) {
  const [negatives, setNegatives] = useState(initNeg);
  const [noted, setNoted]         = useState(initNoted);
  const [invoices, setInvoices]   = useState(initInvoices);
  const [notes, setNotes]         = useState(initNotes);
  const [unread, setUnread]       = useState(initUnread);
  const [read, setRead]           = useState(initRead);

  // Nova alerta econòmica
  const [newTitle, setNewTitle] = useState("");
  const [newBody, setNewBody]   = useState("");
  const [saving, setSaving]     = useState(false);

  async function markReordered(c: ComponentWithNoted) {
    await supabase.from("components").update({ reorder_noted: true }).eq("id", c.id);
    setNegatives(prev => prev.filter(x => x.id !== c.id));
    setNoted(prev => [...prev, { ...c, reorder_noted: true }]);
  }

  async function markPaid(inv: InvoiceIn) {
    await supabase.from("invoices_in").update({ status: "paid", paid_date: new Date().toISOString().split("T")[0] }).eq("id", inv.id);
    setInvoices(prev => prev.filter(x => x.id !== inv.id));
  }

  async function markInvoiced(n: DeliveryNote) {
    await supabase.from("delivery_notes").update({ status: "invoiced" }).eq("id", n.id);
    setNotes(prev => prev.filter(x => x.id !== n.id));
  }

  async function markRead(a: EconomicAlert) {
    await supabase.from("economic_alerts").update({ read_at: new Date().toISOString() }).eq("id", a.id);
    setUnread(prev => prev.filter(x => x.id !== a.id));
    setRead(prev => [{ ...a, read_at: new Date().toISOString() }, ...prev]);
  }

  async function createAlert() {
    if (!newTitle.trim()) return;
    setSaving(true);
    const { data } = await supabase.from("economic_alerts").insert({ title: newTitle, body: newBody || null }).select().single();
    if (data) setUnread(prev => [data as EconomicAlert, ...prev]);
    setNewTitle(""); setNewBody(""); setSaving(false);
  }

  const totalActive = negatives.length + invoices.length + notes.length + unread.length;

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
        <p className="text-[var(--muted)] text-sm">Stock crític, factures vençudes, albarans pendents i avisos econòmics</p>
      </div>

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
              <span className="tabular-nums font-bold text-[var(--negative)] mr-3">{c.stock_actual}</span>
              <Btn onClick={() => markReordered(c)} color="#dc2626">Demanat</Btn>
            </Row>
          ))
        }
        {noted.length > 0 && (
          <div className="px-4 py-2 border-t border-[var(--border)]">
            <p className="text-xs text-[var(--muted)] mb-1">Ja demanats ({noted.length})</p>
            {noted.map(c => (
              <div key={c.id} className="text-xs text-[var(--muted)] py-0.5 flex justify-between">
                <span>{c.name}</span>
                <span>{c.stock_actual}</span>
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
                  <span className="ml-2 text-xs text-[var(--negative)]">venc. {fmtDate(inv.due_date)}</span>
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
              <span className="text-xs text-amber-600 font-semibold mr-3">{daysSince(n.created_at)} dies</span>
              <Btn onClick={() => markInvoiced(n)} color="#b45309">Facturat</Btn>
            </Row>
          ))
        }
      </Section>

      {/* ── Alertes econòmiques ── */}
      <Section title={`Avisos econòmics (${unread.length})`} color="#7c3aed" active={unread.length > 0}>
        {/* Crear nova alerta */}
        <div className="px-4 py-3 border-b border-[var(--border)] bg-[var(--background)] space-y-2">
          <p className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wide">Nou avís</p>
          <input
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            placeholder="Títol de l'avís…"
            className="select w-full text-sm"
          />
          <textarea
            value={newBody}
            onChange={e => setNewBody(e.target.value)}
            placeholder="Descripció (opcional)…"
            rows={2}
            className="select w-full text-sm resize-none"
          />
          <button
            onClick={createAlert}
            disabled={!newTitle.trim() || saving}
            className="px-3 py-1.5 text-xs font-semibold text-white rounded-lg disabled:opacity-50"
            style={{ background: "#7c3aed" }}
          >
            {saving ? "Desant…" : "Afegir avís"}
          </button>
        </div>

        {unread.length === 0
          ? <Empty text="Cap avís econòmic pendent" />
          : unread.map(a => (
            <Row key={a.id}>
              <div className="flex-1">
                <span className="font-medium">{a.title}</span>
                {a.body && <p className="text-xs text-[var(--muted)] mt-0.5">{a.body}</p>}
                <span className="text-xs text-[var(--muted)] block mt-0.5">{fmtDate(a.created_at)}</span>
              </div>
              <Btn onClick={() => markRead(a)} color="#7c3aed">Llegit</Btn>
            </Row>
          ))
        }

        {read.length > 0 && (
          <div className="px-4 py-2 border-t border-[var(--border)]">
            <p className="text-xs text-[var(--muted)] mb-1">Llegits ({read.length})</p>
            {read.map(a => (
              <div key={a.id} className="text-xs text-[var(--muted)] py-0.5">{a.title}</div>
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}

function Section({ title, color, active, children }: { title: string; color: string; active: boolean; children: React.ReactNode }) {
  return (
    <div className="bg-[var(--card)] border rounded-xl overflow-hidden" style={{ borderColor: active ? color : "var(--border)" }}>
      <div className="px-4 py-3 border-b border-[var(--border)] flex items-center gap-2"
        style={{ background: active ? `${color}10` : undefined }}>
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
  return (
    <button
      onClick={onClick}
      className="shrink-0 text-xs px-2.5 py-1 rounded-md font-medium border transition-colors hover:text-white"
      style={{ borderColor: color, color }}
      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = color; (e.currentTarget as HTMLButtonElement).style.color = "white"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = ""; (e.currentTarget as HTMLButtonElement).style.color = color; }}
    >
      {children}
    </button>
  );
}
