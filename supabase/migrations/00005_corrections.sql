-- Migration 00005: Corrections
-- User-submitted feedback when a recommendation was wrong.
-- Either actual_size or fit_feedback must be provided (CHECK constraint).

create table corrections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  purchase_id uuid not null references purchases(id) on delete cascade,
  actual_size text,
  fit_feedback fit_feedback,
  notes text check (notes is null or char_length(notes) <= 500),
  created_at timestamptz not null default now(),
  constraint corrections_must_have_feedback
    check (actual_size is not null or fit_feedback is not null)
);

create index idx_corrections_user on corrections(user_id);
create index idx_corrections_purchase on corrections(purchase_id);
