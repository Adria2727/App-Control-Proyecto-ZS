"use client";

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="ca">
      <body style={{ fontFamily: "system-ui, sans-serif", padding: 40 }}>
        <h2>Alguna cosa ha fallat</h2>
        <p>Hi ha hagut un error inesperat carregant la pàgina.</p>
        <button
          onClick={() => reset()}
          style={{ marginTop: 12, padding: "8px 16px", borderRadius: 8, border: "1px solid #ccc", cursor: "pointer" }}
        >
          Tornar a provar
        </button>
      </body>
    </html>
  );
}
