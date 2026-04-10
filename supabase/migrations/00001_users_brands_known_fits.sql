-- Migration 00001: Users, Brands, Known Fits
-- Core user profiles and brand reference data.

-- ──────────────────────────────────────────────
-- users
-- ──────────────────────────────────────────────
create table users (
  id uuid primary key default gen_random_uuid(),
  username text not null unique check (char_length(username) >= 3),
  height_cm numeric not null check (height_cm > 0),
  weight_kg numeric not null check (weight_kg > 0),
  body_type body_type not null,
  gender_category gender_category not null,
  measurements jsonb,
  social_proof_opt_in boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger users_updated_at
  before update on users
  for each row execute function update_updated_at();

-- ──────────────────────────────────────────────
-- brands
-- ──────────────────────────────────────────────
create table brands (
  id uuid primary key default gen_random_uuid(),
  name text not null unique check (char_length(name) >= 1),
  enabled boolean not null default true,
  region region not null default 'NA',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger brands_updated_at
  before update on brands
  for each row execute function update_updated_at();

-- ──────────────────────────────────────────────
-- known_fits
-- ──────────────────────────────────────────────
create table known_fits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  brand_id uuid not null references brands(id) on delete cascade,
  product_category product_category not null,
  size_label text not null check (char_length(size_label) >= 1),
  created_at timestamptz not null default now()
);

create index idx_known_fits_user on known_fits(user_id);
