-- ============================================================================
-- ZeroStock — Polítiques d'accés (RLS)
-- Executar a Supabase → SQL Editor → Run.
-- ----------------------------------------------------------------------------
-- Permet a la app (clau publishable / rol anon) LLEGIR i ESCRIURE les dades.
-- ⚠️ App interna sense login encara. Quan afegim usuaris, restringirem aquí.
-- ============================================================================

do $$
declare t text;
begin
  foreach t in array array[
    'tenants','categories','colors','components','products','bom',
    'stock_movements','prices','suppliers','purchase_orders','purchase_order_lines'
  ]
  loop
    -- Activa RLS
    execute format('alter table %I enable row level security;', t);
    -- Elimina política prèvia si existeix (idempotent)
    execute format('drop policy if exists "app_full_access" on %I;', t);
    -- Crea política permissiva per a anon + authenticated
    execute format(
      'create policy "app_full_access" on %I for all to anon, authenticated using (true) with check (true);',
      t
    );
  end loop;
end $$;
