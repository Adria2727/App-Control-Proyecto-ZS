-- Columna per marcar stock negatiu com "ja demanat"
ALTER TABLE components ADD COLUMN IF NOT EXISTS reorder_noted BOOLEAN DEFAULT false;

-- Taula alertes econòmiques manuals
CREATE TABLE IF NOT EXISTS economic_alerts (
  id         SERIAL PRIMARY KEY,
  title      TEXT NOT NULL,
  body       TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  read_at    TIMESTAMPTZ DEFAULT NULL
);

ALTER TABLE economic_alerts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "app_full_access" ON economic_alerts;
CREATE POLICY "app_full_access" ON economic_alerts FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
