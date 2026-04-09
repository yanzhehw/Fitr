# Fitr — Supabase

Schema is the source of truth for Fitr data. Migrations are applied via the Supabase CLI.

## Layout

- `migrations/` — incremental SQL migration files (numbered 0001, 0002, ...). Created during Sprints 3, 4, and 6.
- `seed/` — seed data for local development (brands, size charts, normalization tables). Created during Sprint 6.

## Local development (will be wired up in Sprint 3)

```sh
# Install Supabase CLI: https://supabase.com/docs/guides/local-development/cli/getting-started
supabase init       # one-time
supabase start      # spins up local Postgres + Studio
supabase db reset   # applies migrations + seed
```

## Sprint timeline

| Sprint | Migration | Tables |
| ------ | --------- | ------ |
| 3      | `0001_init.sql` | `users`, `known_fits` |
| 6      | `0002_brands_and_charts.sql` | `brands`, `brand_size_charts`, `normalized_size_maps` |
| 6      | `0003_purchases.sql` | `purchases` (+ `fit_status` enum) |
| 4      | `0004_scraper_configs.sql` | `scraper_configs` (versioned) |
