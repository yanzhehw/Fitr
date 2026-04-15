-- Migration 00006: Measurement Pipeline Architecture
-- Introduces MeasurementVector as the universal intermediate layer for size matching.
-- Replaces the normalized-size-map approach with direct measurement overlap scoring.

-- ──────────────────────────────────────────────
-- New enum types
-- ──────────────────────────────────────────────

-- Gender-specific body types replace the generic body_type enum.
create type body_type_mens as enum ('inverted_triangle', 'rectangle', 'oval');
create type body_type_womens as enum ('apple', 'pear', 'hourglass', 'cane_sugar', 'athletic');

create type measurement_confidence as enum ('low', 'medium', 'high');
create type known_fit_source as enum ('self_reported', 'purchase_confirmed', 'corrected');

-- ──────────────────────────────────────────────
-- Users: add measurement vector columns
-- ──────────────────────────────────────────────

-- Drop the old generic body_type column (replaced by gender-specific columns)
alter table users drop column body_type;

-- Add gender-specific body type columns (exactly one should be non-null, enforced by check)
alter table users add column body_type_mens body_type_mens;
alter table users add column body_type_womens body_type_womens;

alter table users add constraint users_body_type_matches_gender check (
  (gender_category = 'mens' and body_type_mens is not null and body_type_womens is null)
  or (gender_category = 'womens' and body_type_womens is not null and body_type_mens is null)
  or (gender_category = 'unisex' and (body_type_mens is not null or body_type_womens is not null))
);

-- Rename the old generic measurements column to exact_measurements
alter table users rename column measurements to exact_measurements;

-- Add predicted_measurements (computed by the Approximation Model, cached)
alter table users add column predicted_measurements jsonb;

-- Add measurement_confidence
alter table users add column measurement_confidence measurement_confidence not null default 'low';

-- ──────────────────────────────────────────────
-- Known Fits: add source column
-- ──────────────────────────────────────────────

alter table known_fits add column source known_fit_source not null default 'self_reported';

-- ──────────────────────────────────────────────
-- Brand Size Charts: restructure into parent + entries
-- ──────────────────────────────────────────────

-- Rename existing table to preserve data conceptually — it becomes the entry table
alter table brand_size_charts rename to brand_size_chart_entries;

-- Create the parent brand_size_charts table
create table brand_size_charts (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references brands(id) on delete cascade,
  gender_category gender_category not null,
  product_category product_category not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (brand_id, gender_category, product_category)
);

create trigger brand_size_charts_updated_at
  before update on brand_size_charts
  for each row execute function update_updated_at();

-- Add FK from entries to the new parent chart table
-- First drop the old unique constraint and indexes on the renamed table
alter table brand_size_chart_entries drop constraint brand_size_charts_brand_id_gender_category_product_categ_key;
drop index if exists idx_brand_size_charts_lookup;

-- Remove the now-redundant columns from entries (gender_category, product_category)
-- and add size_chart_id FK instead
alter table brand_size_chart_entries add column size_chart_id uuid;
alter table brand_size_chart_entries drop column gender_category;
alter table brand_size_chart_entries drop column product_category;
alter table brand_size_chart_entries drop column brand_id;

-- The size_chart_id will be populated by a data migration step (if data exists).
-- For now, make it required for new entries.
alter table brand_size_chart_entries
  add constraint fk_size_chart_entries_chart
  foreign key (size_chart_id) references brand_size_charts(id) on delete cascade;

-- Add unique constraint: one entry per size label per chart
alter table brand_size_chart_entries
  add constraint uq_size_chart_entry_label unique (size_chart_id, size_label);

-- Rename the measurements column to measurement_ranges for clarity
alter table brand_size_chart_entries rename column measurements to measurement_ranges;

-- Index for lookups
create index idx_brand_size_chart_entries_chart on brand_size_chart_entries(size_chart_id);

-- ──────────────────────────────────────────────
-- Drop normalized_size_maps (replaced by measurement overlap scoring)
-- ──────────────────────────────────────────────

drop table if exists normalized_size_maps;

-- ──────────────────────────────────────────────
-- Drop the old generic body_type enum (no longer used)
-- ──────────────────────────────────────────────

drop type if exists body_type;
