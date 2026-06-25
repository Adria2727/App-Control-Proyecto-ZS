-- ============================================================================
-- Migració: Taula albarans (delivery_notes)
-- ============================================================================

CREATE TABLE IF NOT EXISTS delivery_notes (
  id              SERIAL PRIMARY KEY,
  number          TEXT NOT NULL,
  supplier        TEXT NOT NULL,
  note_date       DATE NOT NULL,
  status          TEXT DEFAULT 'pending_invoice'
                  CHECK (status IN ('pending_invoice', 'invoiced')),
  invoice_in_id   INTEGER REFERENCES invoices_in(id) ON DELETE SET NULL,
  base_amount     NUMERIC(12,2),
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Afegir FK a invoices_in per vincular factura → albarà
ALTER TABLE invoices_in
  ADD COLUMN IF NOT EXISTS delivery_note_id INTEGER REFERENCES delivery_notes(id) ON DELETE SET NULL;

-- RLS
ALTER TABLE delivery_notes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "app_full_access" ON delivery_notes;
CREATE POLICY "app_full_access" ON delivery_notes FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Índex per cerques ràpides
CREATE INDEX IF NOT EXISTS idx_delivery_notes_supplier ON delivery_notes(supplier);
CREATE INDEX IF NOT EXISTS idx_delivery_notes_status   ON delivery_notes(status);
CREATE INDEX IF NOT EXISTS idx_delivery_notes_number   ON delivery_notes(number);
