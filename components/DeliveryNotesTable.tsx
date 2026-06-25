"use client";

import { useState } from "react";
import { DeliveryNote } from "@/lib/types";
import { supabase } from "@/lib/supabase";

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("ca-ES", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function daysSince(dateStr: string) {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86_400_000);
}

export default function DeliveryNotesTable({ notes: initialNotes }: { notes: DeliveryNote[] }) {
  const [notes, setNotes] = useState<DeliveryNote[]>(initialNotes);
  const [loadingId, setLoadingId] = useState<number | null>(null);

  async function markInvoiced(id: number) {
    setLoadingId(id);
    await supabase.from("delivery_notes").update({ status: "invoiced" }).eq("id", id);
    setNotes(prev => prev.map(n => n.id === id ? { ...n, status: "invoiced" } : n));
    setLoadingId(null);
  }

  const pending = notes.filter(n => n.status === "pending_invoice");
  const invoiced = notes.filter(n => n.status === "invoiced");

  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-[var(--border)] flex items-center justify-between">
        <div>
          <h2 className="font-semibold">Albarans de compra</h2>
          <p className="text-xs text-[var(--muted)] mt-0.5">{pending.length} pendents de factura · {invoiced.length} facturats</p>
        </div>
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-[var(--muted)] border-b border-[var(--border)] bg-[var(--background)]">
            <th className="px-3 py-2">Nº Albarà</th>
            <th className="px-3 py-2">Data</th>
            <th className="px-3 py-2">Proveïdor</th>
            <th className="px-3 py-2 text-right">Import</th>
            <th className="px-3 py-2">Estat</th>
            <th className="px-3 py-2">Antiguitat</th>
            <th className="px-3 py-2"></th>
          </tr>
        </thead>
        <tbody>
          {notes.length === 0 && (
            <tr><td colSpan={7} className="px-3 py-8 text-center text-[var(--muted)]">Cap albarà registrat</td></tr>
          )}
          {notes.map(note => {
            const days = daysSince(note.created_at);
            const isLate = note.status === "pending_invoice" && days >= 3;
            return (
              <tr key={note.id} className={`border-b border-[var(--border)] last:border-0 hover:bg-[var(--background)] ${isLate ? "bg-amber-50/30" : ""}`}>
                <td className="px-3 py-2 font-mono text-xs font-medium">{note.number}</td>
                <td className="px-3 py-2 text-[var(--muted)]">{fmtDate(note.note_date)}</td>
                <td className="px-3 py-2 font-medium">{note.supplier}</td>
                <td className="px-3 py-2 text-right tabular-nums text-[var(--muted)]">
                  {note.base_amount != null ? note.base_amount.toFixed(2) + " €" : "—"}
                </td>
                <td className="px-3 py-2">
                  {note.status === "invoiced" ? (
                    <span className="text-xs px-2 py-0.5 rounded-md font-medium" style={{ color: "#16a34a", background: "#dcfce7" }}>facturat</span>
                  ) : (
                    <span className="text-xs px-2 py-0.5 rounded-md font-medium" style={{ color: "#b45309", background: "#fef3c7" }}>pendent</span>
                  )}
                </td>
                <td className="px-3 py-2">
                  {note.status === "pending_invoice" && (
                    <span className={`text-xs ${isLate ? "text-amber-600 font-semibold" : "text-[var(--muted)]"}`}>
                      {days === 0 ? "avui" : `${days} dies`}{isLate ? " ⚠" : ""}
                    </span>
                  )}
                </td>
                <td className="px-3 py-2 text-right">
                  {note.status === "pending_invoice" && (
                    <button
                      onClick={() => markInvoiced(note.id)}
                      disabled={loadingId === note.id}
                      className="text-xs px-2 py-1 rounded-md border border-[var(--border)] hover:bg-[var(--background)] disabled:opacity-50"
                    >
                      {loadingId === note.id ? "…" : "Facturat"}
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
