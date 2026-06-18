-- ============================================================================
-- ZeroStock — Esquema de base de dades (Supabase / PostgreSQL)
-- App Control Proyecto Zero Stock — Bumbba & Sunbba
-- Derivat de CONTEXT.md · 2026-06-18
-- ============================================================================
-- Per executar: Supabase → SQL Editor → enganxa tot → Run.
-- És idempotent (es pot tornar a executar sense trencar res).
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. TENANTS (marques)
-- ----------------------------------------------------------------------------
create table if not exists tenants (
  id          text primary key,            -- 'BUMBBA', 'SUNBBA'
  name        text not null,
  website     text,
  is_mature   boolean default false,        -- Bumbba=true, Sunbba=false
  created_at  timestamptz default now()
);

-- ----------------------------------------------------------------------------
-- 2. CATEGORIES de components
-- ----------------------------------------------------------------------------
create table if not exists categories (
  code        text primary key,            -- TELA, ALTRES, ESTRUCTURES, MATALASSOS, PATES, COIXINS, EMBALATGE
  name        text not null
);

-- ----------------------------------------------------------------------------
-- 3. COLORS (per tenant)
-- ----------------------------------------------------------------------------
create table if not exists colors (
  id          bigint generated always as identity primary key,
  tenant_id   text not null references tenants(id),
  code        text not null,               -- PVC, PGC, PGO  /  PC04, PC37...
  name        text not null,               -- Light Green, Arctic Sand...
  l_suffix    text,                         -- sufix estructura "L" (GC, GO, GR, VC, BG) — només Bumbba
  is_active   boolean default true,         -- palette antiga = false
  unique (tenant_id, code)
);

-- ----------------------------------------------------------------------------
-- 4. COMPONENTS / matèries primeres (amb stock actual)
-- ----------------------------------------------------------------------------
create table if not exists components (
  id            bigint generated always as identity primary key,
  sku           text not null,              -- codi intern del material
  name          text not null,              -- "Funda Coixí Gran", "Matalàs 190"...
  tenant_id     text not null references tenants(id),
  category_code text not null references categories(code),
  color_code    text,                        -- null si el component no té color (cola, manuals genèrics...)
  station       text,                        -- E0,E1,E2,E3,KANBAN,COSTE (on entra al procés)
  stock_actual  integer not null default 0,  -- pot ser NEGATIU (descuadre conegut)
  unique (tenant_id, sku, color_code)
);

-- ----------------------------------------------------------------------------
-- 5. PRODUCTES acabats
-- ----------------------------------------------------------------------------
create table if not exists products (
  id            bigint generated always as identity primary key,
  code          text not null,              -- 1P, 2P, 3P, CHL, CRN, PUF, BRAZO, CR...
  name          text not null,
  tenant_id     text not null references tenants(id),
  family        text,                        -- SOFA, INDIVIDUAL, COMPONENT
  bom_active    boolean default true,        -- WWL/PLD/SBM/PFG = false (es venen però BOM inactiu)
  sold_on_web   boolean default true,
  unique (tenant_id, code)
);

-- ----------------------------------------------------------------------------
-- 6. BOM / escandall (producte -> components consumits per unitat)
-- ----------------------------------------------------------------------------
create table if not exists bom (
  id            bigint generated always as identity primary key,
  product_id    bigint not null references products(id) on delete cascade,
  component_id  bigint not null references components(id),
  quantity      numeric not null,            -- unitats de component per producte
  station       text,                        -- estació on es consumeix
  color_varies  boolean default false        -- [c] = canvia segons color de tela del producte
);

-- ----------------------------------------------------------------------------
-- 7. MOVIMENTS d'estoc (entrades i sortides) — el cor dels indicadors
-- ----------------------------------------------------------------------------
create table if not exists stock_movements (
  id            bigint generated always as identity primary key,
  component_id  bigint not null references components(id),
  movement_type text not null,               -- 'IN' (entrada/compra) | 'OUT' (consum/producció) | 'ADJUST'
  quantity      integer not null,            -- positiu sempre; el signe el dóna movement_type
  reason        text,                        -- 'compra Tarracó', 'producció 3P', 'ajust inventari'...
  reference_id  bigint,                      -- opcional: enllaç a ordre de producció o compra
  created_at    timestamptz default now()
);

-- ----------------------------------------------------------------------------
-- 8. PREUS (retail i proposta/majorista per producte)
-- ----------------------------------------------------------------------------
create table if not exists prices (
  id            bigint generated always as identity primary key,
  product_id    bigint references products(id) on delete cascade,
  price_type    text not null,               -- 'RETAIL' | 'PROPOSTA'
  size          text,                         -- '80', '90', '160', '190'... o null
  amount        numeric not null,             -- EUR
  vat_included  boolean default false
);

-- ----------------------------------------------------------------------------
-- 9. PROVEÏDORS
-- ----------------------------------------------------------------------------
create table if not exists suppliers (
  id            bigint generated always as identity primary key,
  name          text not null,               -- 'Tarracó'
  legal_name    text,                         -- 'Tarraco Confort Upholstery SL'
  website       text,
  phone         text,
  contact_sales text,
  contact_buy   text
);

-- ----------------------------------------------------------------------------
-- 10. COMANDES a proveïdor (camions Tarracó)
-- ----------------------------------------------------------------------------
create table if not exists purchase_orders (
  id            bigint generated always as identity primary key,
  supplier_id   bigint not null references suppliers(id),
  reference      text,                        -- 'tarraco_order_2026-04-08'
  truck_number   integer,                     -- 1, 2
  order_date     date,
  m3_used        numeric,                     -- 9.996
  m3_limit       numeric default 10,
  notes          text
);

create table if not exists purchase_order_lines (
  id              bigint generated always as identity primary key,
  order_id        bigint not null references purchase_orders(id) on delete cascade,
  component_sku   text,                        -- 'SB1_C_CR_FUN_PVC'
  description     text,                        -- 'Funda Coixí Gran Light Green'
  quantity        integer not null,
  is_carry_along  boolean default false        -- potes/bosses: NO compten contra els 10 m³
);

-- ============================================================================
-- SEED — dades base (tenants, categories) que no canvien
-- ============================================================================
insert into tenants (id, name, website, is_mature) values
  ('BUMBBA', 'Bumbba', 'https://bumbba.com', true),
  ('SUNBBA', 'Sunbba', 'https://sunbba.com', false)
on conflict (id) do nothing;

insert into categories (code, name) values
  ('TELA',        'Fundes / tela'),
  ('ALTRES',      'Farcits / núclis / cola'),
  ('ESTRUCTURES', 'Estructures "L" i braços'),
  ('MATALASSOS',  'Matalassos'),
  ('PATES',       'Potes'),
  ('COIXINS',     'Coixins muntats (buffer)'),
  ('EMBALATGE',   'Caixes, bosses, manuals, etiquetes')
on conflict (code) do nothing;

insert into suppliers (name, legal_name, website, phone, contact_sales, contact_buy) values
  ('Tarracó', 'Tarraco Confort Upholstery SL', 'https://www.tarraco.eu',
   '+34 679 983 822', 'm.marti@tarraco.eu', 'a.rodriguez@tarraco.eu')
on conflict do nothing;

-- ============================================================================
-- Fi de l'esquema. Següent pas: carregar components, productes i BOM reals.
-- ============================================================================
