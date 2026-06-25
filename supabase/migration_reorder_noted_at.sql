ALTER TABLE components ADD COLUMN IF NOT EXISTS reorder_noted_at TIMESTAMPTZ DEFAULT NULL;
-- Migrar dades existents
UPDATE components SET reorder_noted_at = NOW() WHERE reorder_noted = true;
