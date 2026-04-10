# Fitr — Supabase

Schema is the source of truth for Fitr data. Migrations are applied via the Supabase CLI.

## Layout

- `migrations/` — incremental SQL migration files (numbered 00000, 00001, ...).
- `seed/` — seed data for local development (brands, size charts, normalization tables). Created during Sprint 6.

## Local development

```sh
# Install Supabase CLI: https://supabase.com/docs/guides/local-development/cli/getting-started
supabase start      # spins up local Postgres + Studio
supabase db reset   # applies migrations + seed
supabase db push    # push migrations to remote project
```

## Migrations

| Migration | Tables |
| --------- | ------ |
| `00000_foundation.sql` | enums, extensions, `update_updated_at()` trigger function |
| `00001_users_brands_known_fits.sql` | `users`, `brands`, `known_fits` |
| `00002_scraper_configs.sql` | `scraper_configs` |
| `00003_size_charts.sql` | `brand_size_charts`, `normalized_size_maps` |
| `00004_purchases.sql` | `purchases` |
| `00005_corrections.sql` | `corrections` |
