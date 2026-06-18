-- ============================================================================
-- ZeroStock — Càrrega de COLORS (Bumbba & Sunbba)
-- Executar a Supabase → SQL Editor → Run, DESPRÉS de schema.sql
-- Idempotent: es pot tornar a executar.
-- ============================================================================

-- ── BUMBBA ──────────────────────────────────────────────────────────────────
-- Colors de pana actuals (fabric_code) + sufix estructura "L"
insert into colors (tenant_id, code, name, l_suffix, is_active) values
  ('BUMBBA', 'PVC', 'Light Green',  'VC', true),
  ('BUMBBA', 'PGC', 'Arctic Sand',  'GC', true),
  ('BUMBBA', 'PGO', 'Shadow Grey',  'GO', true)
on conflict (tenant_id, code) do update
  set name = excluded.name, l_suffix = excluded.l_suffix, is_active = excluded.is_active;

-- Colors només d'estructura "L" (es fan servir, no tenen pana activa)
insert into colors (tenant_id, code, name, l_suffix, is_active) values
  ('BUMBBA', 'GR', 'Dark Grey', 'GR', true),
  ('BUMBBA', 'BG', 'Beige',     'BG', true)
on conflict (tenant_id, code) do update
  set name = excluded.name, l_suffix = excluded.l_suffix, is_active = excluded.is_active;

-- Palette antiga (encara visible a web, NO produïda) → is_active = false
insert into colors (tenant_id, code, name, l_suffix, is_active) values
  ('BUMBBA', 'PBR', 'Light Ivory',  null, false),
  ('BUMBBA', 'PAI', 'Blue Wave',    null, false),
  ('BUMBBA', 'PMC', 'Brown Sugar',  null, false),
  ('BUMBBA', 'PVB', 'Forest Green', null, false)
on conflict (tenant_id, code) do update
  set name = excluded.name, is_active = excluded.is_active;

-- ── SUNBBA ──────────────────────────────────────────────────────────────────
insert into colors (tenant_id, code, name, l_suffix, is_active) values
  ('SUNBBA', 'PC04', 'Light Ivory',   null, true),
  ('SUNBBA', 'PC37', 'Green Olive',   null, true),
  ('SUNBBA', 'PC82', 'Grey Stone',    null, true),
  ('SUNBBA', 'PC99', 'Graphite Grey', null, true)
on conflict (tenant_id, code) do update
  set name = excluded.name, is_active = excluded.is_active;

-- Comprovació ràpida:
-- select tenant_id, code, name, l_suffix, is_active from colors order by tenant_id, is_active desc, code;
