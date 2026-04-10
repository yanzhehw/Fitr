-- Migration 00002: Scraper Configs
-- Per-brand scraping definitions, versioned for hot updates.

create table scraper_configs (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references brands(id) on delete cascade,
  version integer not null default 1,
  url_pattern text not null,
  selectors jsonb not null,
  confirmation_pattern text not null,
  category_mapping jsonb not null,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (brand_id, version)
);

create trigger scraper_configs_updated_at
  before update on scraper_configs
  for each row execute function update_updated_at();
