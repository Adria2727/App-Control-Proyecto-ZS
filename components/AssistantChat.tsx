"use client";

import { useState, useRef, useEffect } from "react";

type Msg = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "Quantes fundes grans de BUMBBA tenim en estoc?",
  "Quan vença la propera factura a pagar?",
  "Quines factures estan vençudes sense pagar?",
  "Quin és el cost aproximat de fabricar un sofà?",
  "Quin marge tenim sobre les vendes?",
  "Hi ha components amb stock negatiu?",
];

export default function AssistantChat() {
  const [open, setOpen]       = useState(false);
  const [msgs, setMsgs]       = useState<Msg[]>([]);
  const [input, setInput]     = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, loading]);

  async function send(text?: string) {
    const question = (text ?? input).trim();
    if (!question || loading) return;
    setInput("");
    setError(null);

    const newMsgs: Msg[] = [...msgs, { role: "user", content: question }];
    setMsgs(newMsgs);
    setLoading(true);

    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMsgs }),
      });
      const json = await res.json();
      if (!res.ok || json.error) throw new Error(json.error ?? "Error");
      setMsgs([...newMsgs, { role: "assistant", content: json.reply }]);
    } catch (e: any) {
      setError(e.message);
      setMsgs(newMsgs); // keep user message
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  }

  return (
    <>
      {/* Botó flotant */}
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-5 right-5 z-50 w-13 h-13 rounded-full shadow-lg flex items-center justify-center text-white text-xl transition-transform hover:scale-105"
        style={{ width: 52, height: 52, background: "var(--bumbba)" }}
        title="Assistent ZeroStock"
      >
        {open ? "✕" : "✦"}
      </button>

      {/* Panell del xat */}
      {open && (
        <div
          className="fixed bottom-20 right-5 z-50 flex flex-col rounded-2xl shadow-2xl border border-[var(--border)] overflow-hidden"
          style={{ width: 360, height: 520, background: "var(--card)" }}
        >
          {/* Header */}
          <div className="px-4 py-3 border-b border-[var(--border)] flex items-center gap-2.5" style={{ background: "var(--bumbba)" }}>
            <span className="text-white text-lg">✦</span>
            <div>
              <p className="text-white font-semibold text-sm leading-tight">Assistent ZeroStock</p>
              <p className="text-white/70 text-xs">Pregunta sobre stock, factures o marges</p>
            </div>
          </div>

          {/* Missatges */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">

            {/* Estat buit: suggeriments */}
            {msgs.length === 0 && (
              <div className="space-y-2">
                <p className="text-xs text-[var(--muted)] text-center mt-2">Exemples de preguntes:</p>
                {SUGGESTIONS.map(s => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="w-full text-left text-xs px-3 py-2 rounded-lg border border-[var(--border)] hover:border-[var(--bumbba)] hover:bg-[var(--bumbba)]/5 text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Missatges */}
            {msgs.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] text-sm px-3 py-2 rounded-xl whitespace-pre-wrap leading-relaxed ${
                    m.role === "user"
                      ? "text-white rounded-br-sm"
                      : "bg-[var(--background)] text-[var(--foreground)] border border-[var(--border)] rounded-bl-sm"
                  }`}
                  style={m.role === "user" ? { background: "var(--bumbba)" } : {}}
                >
                  {m.content}
                </div>
              </div>
            ))}

            {/* Carregant */}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-[var(--background)] border border-[var(--border)] rounded-xl rounded-bl-sm px-3 py-2">
                  <span className="flex gap-1 items-center h-4">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--muted)] animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--muted)] animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--muted)] animate-bounce" style={{ animationDelay: "300ms" }} />
                  </span>
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                Error: {error}
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="px-3 py-3 border-t border-[var(--border)]">
            {msgs.length > 0 && (
              <button
                onClick={() => { setMsgs([]); setError(null); }}
                className="text-xs text-[var(--muted)] hover:text-[var(--foreground)] mb-2 block"
              >
                ↺ Nova conversa
              </button>
            )}
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                disabled={loading}
                placeholder="Escriu la teva pregunta…"
                className="flex-1 text-sm px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] focus:outline-none focus:border-[var(--bumbba)] placeholder:text-[var(--muted)] disabled:opacity-50"
              />
              <button
                onClick={() => send()}
                disabled={!input.trim() || loading}
                className="px-3 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-40 transition-opacity"
                style={{ background: "var(--bumbba)" }}
              >
                ➤
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
