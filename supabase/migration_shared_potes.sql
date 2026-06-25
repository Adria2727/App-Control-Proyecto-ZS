-- ============================================================================
-- Migració: Potes → component SHARED (elimina POT_BL i POT_NG de totes les marques)
-- Executar UNA sola vegada a Supabase SQL Editor
-- Stock resultant: 304 + 408 + (-24) + 0 = 688
-- ============================================================================

-- 1. Afegir tenant SHARED
insert into tenants (id, name, website, active)
values ('SHARED', 'Compartit', null, true)
on conflict (id) do nothing;

-- 2. Crear nou component POT (suma tots els stocks anteriors)
insert into components (tenant_id, sku, name, category_code, station, stock_actual)
values (
  'SHARED', 'POT', 'Potes',
  'PATES', 'E0',
  coalesce((
    select sum(stock_actual)
    from components
    where sku in ('POT_BL','POT_NG')
  ), 688)
)
on conflict (tenant_id, sku) do update
  set stock_actual = excluded.stock_actual;

-- 3. Redirigir BOM → nou component POT
update bom
set component_id = (
  select id from components where tenant_id='SHARED' and sku='POT'
)
where component_id in (
  select id from components where sku in ('POT_BL','POT_NG')
);

-- 4. Netejar movements i invoice_lines dels components vells
delete from stock_movements
where component_id in (
  select id from components where sku in ('POT_BL','POT_NG')
);

delete from invoice_in_lines
where component_id in (
  select id from components where sku in ('POT_BL','POT_NG')
);

-- 5. Eliminar els 4 components vells
delete from components where sku in ('POT_BL','POT_NG');
