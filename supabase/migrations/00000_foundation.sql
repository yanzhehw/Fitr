-- Migration 00000: Foundation
-- Shared enums, extensions, and utility functions used across all tables.

-- Enable UUID generation
create extension if not exists "pgcrypto";

-- Custom enum types matching Zod schemas in shared/types/
create type body_type as enum ('slim', 'average', 'athletic', 'broad');
create type gender_category as enum ('mens', 'womens', 'unisex');
create type product_category as enum ('tops', 'bottoms', 'outerwear', 'shoes');
create type region as enum ('NA', 'EU', 'UK', 'AU');
create type fit_status as enum ('pending', 'confirmed', 'corrected');
create type fit_feedback as enum ('ran_large', 'ran_small', 'just_right');

-- Reusable trigger function: auto-update updated_at on row modification
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;
