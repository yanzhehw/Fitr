-- Migration 00004: Purchases
-- Tracked purchase events from supported brands.
-- fit_status follows "true until proven false" lifecycle (pending → confirmed/corrected).

create table purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  brand_id uuid not null references brands(id) on delete cascade,
  product_sku text not null check (char_length(product_sku) >= 1),
  product_category product_category not null,
  size_label text not null check (char_length(size_label) >= 1),
  fit_status fit_status not null default 'pending',
  recommendation_tier_used integer check (
    recommendation_tier_used is null or
    (recommendation_tier_used >= 1 and recommendation_tier_used <= 4)
  ),
  purchased_at timestamptz not null default now(),
  confirmed_at timestamptz,
  created_at timestamptz not null default now()
);

create index idx_purchases_user on purchases(user_id);
create index idx_purchases_sku on purchases(product_sku, brand_id);
create index idx_purchases_pending on purchases(fit_status)
  where fit_status = 'pending';
