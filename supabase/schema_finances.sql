-- ============================================================
-- FINANCES & MARGES — ZeroStock
-- Executa aquest fitxer al SQL Editor de Supabase
-- ============================================================

-- 1. Afegir cost_unitari als components (per al càlcul de marges via BOM)
ALTER TABLE components ADD COLUMN IF NOT EXISTS cost_unitari NUMERIC(10,4) DEFAULT 0;

-- 2. Taula de factures emeses (vendes a Bumbba/Nubba)
CREATE TABLE IF NOT EXISTS invoices_out (
  id           SERIAL PRIMARY KEY,
  invoice_number TEXT NOT NULL UNIQUE,
  invoice_date DATE NOT NULL,
  client       TEXT NOT NULL,
  base_amount  NUMERIC(12,2) NOT NULL,
  vat_pct      NUMERIC(5,2)  DEFAULT 21,
  vat_amount   NUMERIC(12,2),
  total_amount NUMERIC(12,2),
  due_date     DATE,
  paid_date    DATE,
  status       TEXT DEFAULT 'pending' CHECK (status IN ('pending','paid','overdue','partial')),
  notes        TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Taula de factures rebudes (compres a proveïdors)
CREATE TABLE IF NOT EXISTS invoices_in (
  id             SERIAL PRIMARY KEY,
  invoice_number TEXT NOT NULL,
  invoice_date   DATE NOT NULL,
  supplier       TEXT NOT NULL,
  category       TEXT, -- fundes | rellens | textils | caixes | potes | assessorament
  base_amount    NUMERIC(12,2) NOT NULL,
  vat_pct        NUMERIC(5,2) DEFAULT 21,
  vat_amount     NUMERIC(12,2),
  total_amount   NUMERIC(12,2),
  due_date       DATE,
  paid_date      DATE,
  status         TEXT DEFAULT 'pending' CHECK (status IN ('pending','paid','overdue','partial')),
  notes          TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (invoice_number, supplier)
);

-- 4. RLS per a les taules noves
ALTER TABLE invoices_out ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices_in  ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "app_full_access" ON invoices_out;
DROP POLICY IF EXISTS "app_full_access" ON invoices_in;
CREATE POLICY "app_full_access" ON invoices_out FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "app_full_access" ON invoices_in  FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- ============================================================
-- 5. Costos unitaris dels components (des de les factures de compra)
--    Adapta els patrons si els noms dels components al DB difereixen.
-- ============================================================

-- BUMBBA — Fundes exteriors (FUNCOTEX ~19,74 €/u per 190x80)
UPDATE components SET cost_unitari = 19.74
WHERE tenant_id = 'BUMBBA' AND (
  name ILIKE '%funda%exterior%190%' OR name ILIKE '%funda%pana%190%' OR
  name ILIKE '%funda%s/a%190%' OR (name ILIKE '%pana%' AND name ILIKE '%190%' AND name NOT ILIKE '%interior%' AND name NOT ILIKE '%brac%')
);

UPDATE components SET cost_unitari = 18.72
WHERE tenant_id = 'BUMBBA' AND (
  name ILIKE '%funda%exterior%160%' OR name ILIKE '%funda%pana%160%' OR
  (name ILIKE '%pana%' AND name ILIKE '%160%' AND name NOT ILIKE '%interior%' AND name NOT ILIKE '%brac%')
);

UPDATE components SET cost_unitari = 16.34
WHERE tenant_id = 'BUMBBA' AND (
  name ILIKE '%funda%exterior%80x80%' OR name ILIKE '%funda%pana%80x80%' OR name ILIKE '%funda%pana%puff%' OR
  (name ILIKE '%pana%' AND name ILIKE '%80x80%' AND name NOT ILIKE '%interior%' AND name NOT ILIKE '%brac%')
);

-- BUMBBA — Fundes braç (FUNCOTEX ~14,59 €/u)
UPDATE components SET cost_unitari = 14.59
WHERE tenant_id = 'BUMBBA' AND (
  name ILIKE '%brac%' OR name ILIKE '%brazo%' OR name ILIKE '%braç%'
) AND (name ILIKE '%funda%' OR name ILIKE '%pana%');

-- BUMBBA — Fundes interiors (FUNCOTEX 2,88 €/u)
UPDATE components SET cost_unitari = 2.88
WHERE tenant_id = 'BUMBBA' AND (
  name ILIKE '%funda%interior%' OR name ILIKE '%interior%punt%' OR name ILIKE '%poliester%'
);

-- BUMBBA — Rellens / colchons (INTERPLASP)
UPDATE components SET cost_unitari = 52.017
WHERE tenant_id = 'BUMBBA' AND (
  name ILIKE '%rellen%190%' OR name ILIKE '%colch%190%' OR
  (name ILIKE '%rellen%' AND name ILIKE '%190%')
);
UPDATE components SET cost_unitari = 52.017
WHERE tenant_id = 'BUMBBA' AND (
  name ILIKE '%rellen%160%' OR name ILIKE '%colch%160%' OR
  (name ILIKE '%rellen%' AND name ILIKE '%160%')
);
UPDATE components SET cost_unitari = 28.859
WHERE tenant_id = 'BUMBBA' AND (
  name ILIKE '%rellen%puff%' OR name ILIKE '%rellen%80x80%' OR
  (name ILIKE '%rellen%' AND name ILIKE '%80%' AND name NOT ILIKE '%190%' AND name NOT ILIKE '%160%')
);

-- BUMBBA — Braços (escuma, INTERPLASP ~16,375 €/u)
UPDATE components SET cost_unitari = 16.375
WHERE tenant_id = 'BUMBBA' AND (
  name ILIKE '%brac%escum%' OR name ILIKE '%brazo%espum%' OR name ILIKE '%braç%rellen%' OR
  (name ILIKE '%brac%' AND (name ILIKE '%rellen%' OR name ILIKE '%espum%' OR name ILIKE '%interplasp%'))
);

-- BUMBBA — Caixes (Tarracó, 3,84 €/u)
UPDATE components SET cost_unitari = 3.84
WHERE tenant_id = 'BUMBBA' AND (
  name ILIKE '%caixa%' OR name ILIKE '%caja%' OR name ILIKE '%box%'
);

-- BUMBBA — Potes (LACATS VF)
UPDATE components SET cost_unitari = 10.00
WHERE tenant_id = 'BUMBBA' AND (
  (name ILIKE '%pot%' OR name ILIKE '%pata%') AND (name ILIKE '%gran%' OR name ILIKE '%large%' OR name ILIKE '%g%')
  AND name NOT ILIKE '%petit%'
);
UPDATE components SET cost_unitari = 8.80
WHERE tenant_id = 'BUMBBA' AND (
  (name ILIKE '%pot%' OR name ILIKE '%pata%') AND (name ILIKE '%petit%' OR name ILIKE '%small%' OR name ILIKE '%p%')
  AND name NOT ILIKE '%gran%'
);

-- SUNBBA — Fundes exteriors (FUNCOTEX)
UPDATE components SET cost_unitari = 35.71
WHERE tenant_id = 'SUNBBA' AND (
  name ILIKE '%funda%190%' OR (name ILIKE '%pico%' AND name ILIKE '%190%' AND name NOT ILIKE '%brac%' AND name NOT ILIKE '%interior%')
);
UPDATE components SET cost_unitari = 32.38
WHERE tenant_id = 'SUNBBA' AND (
  name ILIKE '%funda%160%' OR (name ILIKE '%pico%' AND name ILIKE '%160%' AND name NOT ILIKE '%brac%' AND name NOT ILIKE '%interior%')
);
UPDATE components SET cost_unitari = 26.01
WHERE tenant_id = 'SUNBBA' AND (
  name ILIKE '%funda%90%' OR name ILIKE '%funda%puff%' OR
  (name ILIKE '%pico%' AND name ILIKE '%90%' AND name NOT ILIKE '%190%' AND name NOT ILIKE '%160%' AND name NOT ILIKE '%brac%')
);

-- SUNBBA — Fundes braç (FUNCOTEX 28,01 €/u)
UPDATE components SET cost_unitari = 28.01
WHERE tenant_id = 'SUNBBA' AND (
  name ILIKE '%brac%' OR name ILIKE '%brazo%' OR name ILIKE '%braç%'
) AND (name ILIKE '%funda%' OR name ILIKE '%pico%');

-- SUNBBA — Rellens (INTERPLASP)
UPDATE components SET cost_unitari = 57.807
WHERE tenant_id = 'SUNBBA' AND (
  name ILIKE '%rellen%190%' OR name ILIKE '%colch%190%' OR
  (name ILIKE '%rellen%' AND name ILIKE '%190%')
);
UPDATE components SET cost_unitari = 57.807
WHERE tenant_id = 'SUNBBA' AND (
  name ILIKE '%rellen%160%' OR name ILIKE '%colch%160%' OR
  (name ILIKE '%rellen%' AND name ILIKE '%160%')
);
UPDATE components SET cost_unitari = 31.754
WHERE tenant_id = 'SUNBBA' AND (
  name ILIKE '%rellen%puff%' OR name ILIKE '%rellen%80%' OR
  (name ILIKE '%rellen%' AND name ILIKE '%90%' AND name NOT ILIKE '%190%' AND name NOT ILIKE '%160%')
);

-- SUNBBA — Etiquetes (FUNCOTEX 0,40 €/u)
UPDATE components SET cost_unitari = 0.40
WHERE tenant_id = 'SUNBBA' AND (name ILIKE '%etiquet%' OR name ILIKE '%label%');
