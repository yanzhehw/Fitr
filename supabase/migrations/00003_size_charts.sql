-- Migration 00003: Brand Size Charts + Normalized Size Maps
-- The size translation backbone for the recommendation engine.

-- ──────────────────────────────────────────────
-- brand_size_charts
-- Brand's published size table. Tier 4 matches user measurements against these.
-- ──────────────────────────────────────────────
create table brand_size_charts (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references brands(id) on delete cascade,
  gender_category gender_category not null,
  product_category product_category not null,
  size_label text not null check (char_length(size_label) >= 1),
  measurements jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (brand_id, gender_category, product_category, size_label)
);

create trigger brand_size_charts_updated_at
  before update on brand_size_charts
  for each row execute function update_updated_at();

create index idx_brand_size_charts_lookup
  on brand_size_charts(brand_id, gender_category, product_category);

-- ──────────────────────────────────────────────
-- normalized_size_maps
-- Maps brand sizes to Fitr's internal scale for cross-brand translation (Tier 3).
-- ──────────────────────────────────────────────
create table normalized_size_maps (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references brands(id) on delete cascade,
  gender_category gender_category not null,
  product_category product_category not null,
  size_label text not null check (char_length(size_label) >= 1),
  fitr_internal_size integer not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (brand_id, gender_category, product_category, size_label)
);

create trigger normalized_size_maps_updated_at
  before update on normalized_size_maps
  for each row execute function update_updated_at();

create index idx_normalized_size_maps_lookup
  on normalized_size_maps(brand_id, gender_category, product_category);
