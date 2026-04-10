# Fitr Implementation TODOs

Sprint-organized task list. Each sprint maps to a section in [Fitr_Technical_Requirements.md](Fitr_Technical_Requirements.md).

**Status:** Sprints 0 and 1 are complete — folder skeleton, `@fitr/types` path alias, and the full Zod-validated type contract are in place. Everything below can now run in parallel up to the dependency limits noted in the map.

Dependency map:
```
Sprint 2 (onboarding)
Sprint 3 (profile + backend boot) ─┐
Sprint 4 (registry + Nike) → Sprint 5 (adidas/NB)
Sprint 6 (recommendation engine) ←─┘
    │
    ├─ Sprint 7 (overlay UI)
    ├─ Sprint 8 (purchase + affiliate + anon)
    └─ Sprint 9 (admin)
```

---

## Sprint 2 — Onboarding wizard

Goal: build the first-run experience per [Fitr_Technical_Requirements.md](Fitr_Technical_Requirements.md) §1.1.

- [ ] `src/features/onboarding/onboarding.store.ts` — reducer/state machine for the wizard
- [ ] `src/features/onboarding/components/UsernameStep.tsx` — 3+ char validator
- [ ] `src/features/onboarding/components/HeightStep.tsx` — cm/ft-in unit toggle
- [ ] `src/features/onboarding/components/WeightStep.tsx` — kg/lbs unit toggle
- [ ] `src/features/onboarding/components/BodyTypeStep.tsx` — slim/average/athletic/broad visual selector
- [ ] `src/features/onboarding/components/GenderStep.tsx` — mens/womens/unisex
- [ ] `src/features/onboarding/components/MeasurementsStep.tsx` — optional, non-pushy copy, no progress bar
- [ ] `src/features/onboarding/components/KnownFitsStep.tsx` — optional, repeatable list (brand + category + size)
- [ ] `src/features/onboarding/components/ConsentStep.tsx` — social proof opt-in toggle, defaults OFF
- [ ] `src/features/onboarding/OnboardingWizard.tsx` — orchestrator
- [ ] `src/features/onboarding/index.ts` — public exports
- [ ] `src/lib/storage.ts` — typed `chrome.storage` wrapper
- [ ] `src/lib/units.ts` — cm/in and kg/lb conversions
- [ ] First-run detection in [src/background/background.ts](../src/background/background.ts) — open options page when no profile exists
- [ ] Update [src/options/App.tsx](../src/options/App.tsx) — render wizard when profile is missing
- [ ] Unit tests: reducer, storage, units

**Done when:** fresh install lands user in the wizard; required fields enforced; optional steps skippable; opt-in defaults OFF; profile persists.

---

## Sprint 3 — Profile editor + Node backend bootstrap + account deletion

Goal: profile management and backend skeleton. Covers [Fitr_Technical_Requirements.md](Fitr_Technical_Requirements.md) §1.1, §2, §4.

**Decision needed before starting:** auth model — anonymous device-ID, magic link, or Supabase Auth email/password?

- [ ] `src/features/profile/components/ProfileEditor.tsx` — reuses onboarding step components for editing
- [ ] `src/features/profile/components/MeasurementsCard.tsx`
- [ ] `src/features/profile/components/DeleteAccountButton.tsx` — confirm dialog
- [ ] `src/features/profile/profile.store.ts`
- [ ] `src/features/profile/profile.api.ts` — GET/PUT /profile, DELETE /account
- [ ] `src/features/profile/index.ts`
- [ ] `src/lib/api-client.ts` — fetch wrapper with auth header + error normalization
- [ ] `backend/package.json` — Fastify + zod + @supabase/supabase-js
- [ ] `backend/src/index.ts` — server bootstrap
- [ ] `backend/src/app.ts` — route registration
- [ ] `backend/src/db/client.ts` — Supabase service-role client
- [ ] `backend/src/middleware/{auth,error,request-log}.ts`
- [ ] `backend/src/routes/profile.route.ts` — GET/PUT /profile
- [ ] `backend/src/routes/account.route.ts` — DELETE /account
- [ ] `backend/src/modules/profile/crud.ts`
- [ ] `backend/src/modules/profile/delete-cascade.ts` — wipes User + KnownFit + Purchase
- [ ] `backend/src/db/repositories/user.repo.ts`
- [ ] `supabase/migrations/0001_init.sql` — User, KnownFit tables
- [ ] Cascade delete integration test
- [ ] Move `@supabase/supabase-js` from root [package.json](../package.json) to `backend/package.json`

**Done when:** user can edit every profile field; "Delete account" hits backend, cascades to KnownFit, clears local storage; integration test proves cascade.

---

## Sprint 4 — Scraper registry + Nike scraper

Goal: page detection and product extraction for the first brand. Covers [Fitr_Technical_Requirements.md](Fitr_Technical_Requirements.md) §1.2.

- [ ] `src/scrapers/types.ts` — re-exports ScraperConfig from `@fitr/types`
- [ ] `src/scrapers/registry.ts` — bundled default registry
- [ ] `src/scrapers/matcher.ts` — `findConfigForUrl(url, registry)`
- [ ] `src/scrapers/nike/config.ts` — real URL pattern, DOM selectors, confirmation pattern, category mapping
- [ ] `src/scrapers/nike/fixtures/` — saved Nike product page HTML
- [ ] `src/scrapers/nike/nike.test.ts` — fixture-based extraction test
- [ ] `src/features/scraper-runner/runner.ts` — listens to page-load, extracts, emits typed event
- [ ] `src/features/scraper-runner/index.ts`
- [ ] Update [src/content/content.ts](../src/content/content.ts) — bootstrap scraper-runner on document_idle
- [ ] `src/background/handlers/scraper-registry.ts` — periodic fetch from backend with ETag
- [ ] Update [src/background/background.ts](../src/background/background.ts) — register scraper-registry handler
- [ ] `backend/src/routes/scraper-configs.route.ts` — GET /scraper-configs (stub returning bundled defaults)
- [ ] `backend/src/db/repositories/scraper-config.repo.ts`
- [ ] `supabase/migrations/0004_scraper_configs.sql` — versioned ScraperConfig table

**Done when:** visiting a real nike.com product page logs extracted brand/category/SKU/sizes; fixture test passes; non-supported pages do nothing.

---

## Sprint 5 — adidas + New Balance scrapers

Goal: round out v1 brand coverage. Pure config + tests, no engine changes.

- [ ] `src/scrapers/adidas/config.ts`
- [ ] `src/scrapers/adidas/fixtures/`
- [ ] `src/scrapers/adidas/adidas.test.ts`
- [ ] `src/scrapers/newbalance/config.ts`
- [ ] `src/scrapers/newbalance/fixtures/`
- [ ] `src/scrapers/newbalance/newbalance.test.ts`
- [ ] Manual verification on live product pages for both brands
- [ ] `docs/scraper-authoring-guide.md` — how to add a new brand

**Done when:** all 3 v1 brands extract cleanly from fixtures and live pages.

---

## Sprint 6 — Recommendation engine (4 tiers)

Goal: implement the data hierarchy from [Fitr_Technical_Requirements.md](Fitr_Technical_Requirements.md) §1.3. Build Tier 4 first (always callable fallback), then 3, 2, 1.

- [ ] `supabase/migrations/0002_brands_and_charts.sql` — Brand, BrandSizeChart, NormalizedSizeMap
- [ ] `supabase/migrations/0003_purchases.sql` — Purchase + fit_status enum
- [ ] `supabase/seed/brands.sql` — Nike, adidas, New Balance
- [ ] `supabase/seed/size-charts/` — JSON for v1 mens tops + shoes
- [ ] `supabase/seed/normalization-map.sql`
- [ ] `backend/src/modules/recommendation/body-approximation.ts` — height/weight/body_type → chest/waist/hip/inseam
- [ ] `backend/src/modules/recommendation/tier4-size-chart.ts` — body metrics vs. brand chart
- [ ] `backend/src/modules/recommendation/tier3-cross-brand.ts` — normalized map translation
- [ ] `backend/src/modules/recommendation/tier2-community.ts` — similar body profile query
- [ ] `backend/src/modules/recommendation/tier1-own-history.ts` — user's confirmed purchases
- [ ] `backend/src/modules/recommendation/engine.ts` — orchestrator with tier fallback
- [ ] `backend/src/routes/recommend.route.ts` — GET /recommend with zod validation
- [ ] `backend/src/db/repositories/{size-chart,normalized-size-map,purchase}.repo.ts`
- [ ] Log which tier was used per recommendation (for analytics)
- [ ] `backend/src/modules/recommendation/__tests__/` — per-tier tests + engine fallback chain test

**Done when:** `GET /recommend?brand=nike&category=mens_tops&sku=X&userId=Y` returns a size + tier number; all tiers tested; seed populates local DB.

---

## Sprint 7 — Overlay UI + recommendation client + correction

Goal: the user-facing popup overlay per [Fitr_Technical_Requirements.md](Fitr_Technical_Requirements.md) §1.4.

- [ ] `src/features/overlay/shadow-host.ts` — Shadow DOM root for style isolation
- [ ] `src/features/overlay/overlay.styles.css`
- [ ] `src/features/overlay/OverlayApp.tsx` — composes recommendation + social-proof + correction
- [ ] `src/features/overlay/index.ts`
- [ ] `src/features/recommendation/components/SizeRecommendationCard.tsx` — prominent size, brand/category context
- [ ] `src/features/recommendation/recommendation.api.ts` — GET /recommend client
- [ ] `src/features/recommendation/useRecommendation.ts` — hook
- [ ] `src/features/recommendation/index.ts`
- [ ] `src/features/social-proof/components/SocialProofFeed.tsx`
- [ ] `src/features/social-proof/components/SocialProofEntry.tsx`
- [ ] `src/features/social-proof/components/EmptyState.tsx` — "no data yet"
- [ ] `src/features/social-proof/index.ts`
- [ ] `src/features/correction/components/CorrectionModal.tsx`
- [ ] `src/features/correction/components/CorrectionForm.tsx`
- [ ] `src/features/correction/correction.api.ts` — POST /correction
- [ ] `src/features/correction/index.ts`
- [ ] Update [src/content/content.ts](../src/content/content.ts) — mount overlay when scraper-runner emits a product
- [ ] `src/content/overlay-mount.tsx` — React mount into Shadow DOM
- [ ] Dismiss-per-page persistence via `chrome.storage.session`
- [ ] Add "auto-popup off" toggle to `src/options/tabs/GeneralTab.tsx`
- [ ] `backend/src/routes/correction.route.ts` (stub)

**Done when:** overlay appears on a real Nike product page, shows recommendation + social proof (or empty state), correction modal submits, dismiss hides for the session.

---

## Sprint 8 — Purchase tracking + affiliate + anonymization

Goal: feedback loop per [Fitr_Technical_Requirements.md](Fitr_Technical_Requirements.md) §1.5 and the privacy enforcement layer per §4.

- [ ] `src/features/purchase-tracking/detector.ts` — uses brand `confirmationPattern` to detect order pages
- [ ] `src/features/purchase-tracking/purchase.api.ts` — POST /purchase
- [ ] `src/features/purchase-tracking/index.ts`
- [ ] `src/features/affiliate/wrapper.ts` — wraps outbound links, honors existing referral cookies (NEVER overrides)
- [ ] `src/features/affiliate/index.ts`
- [ ] `backend/src/routes/purchase.route.ts`
- [ ] `backend/src/modules/purchase/record.ts` — logs Purchase, fit_status=pending
- [ ] `backend/src/modules/purchase/confirm.ts` — 30-day auto-confirm cron
- [ ] `backend/src/modules/purchase/correct.ts` — handles corrections
- [ ] `backend/src/modules/anonymization/truncate-username.ts` — "Yanis" → "Yan***"
- [ ] `backend/src/modules/anonymization/k-anonymity.ts` — enforce k≥3 gate
- [ ] `backend/src/modules/anonymization/opt-in-filter.ts` — only opted-in users
- [ ] `backend/src/modules/anonymization/__tests__/`
- [ ] Wire anonymization into `backend/src/modules/recommendation/tier2-community.ts`
- [ ] Decision: cron host (Supabase scheduled functions, separate worker, or pg_cron?)

**Done when:** test checkout sends POST /purchase; outbound links carry affiliate params but don't override pre-existing referral cookies; anonymization tests prove k<3 returns empty + non-opted-in users excluded.

---

## Sprint 9 — Admin panel (analytics + scraper deploy)

Goal: minimal custom admin UI per [Fitr_Technical_Requirements.md](Fitr_Technical_Requirements.md) §1.6. Most CRUD lives in Supabase Studio; this app covers analytics + scraper config deploy.

- [ ] `admin/package.json` — Vite + React + Tailwind
- [ ] `admin/vite.config.ts`, `admin/tsconfig.json` (with `@fitr/types` alias), `admin/index.html`
- [ ] `admin/src/main.tsx`, `admin/src/App.tsx` — router
- [ ] `admin/src/lib/api-client.ts` — talks to backend /admin/* routes
- [ ] `admin/src/lib/auth.ts` — admin login via Supabase Auth
- [ ] `admin/src/pages/Dashboard.tsx` — links to Studio + summary
- [ ] `admin/src/pages/Analytics.tsx`
- [ ] `admin/src/pages/ScraperDeploy.tsx`
- [ ] `admin/src/features/analytics/` — TierChart, AccuracyChart, KPICard + analytics.api.ts
- [ ] `admin/src/features/scraper-deploy/` — ConfigDiff, DeployButton + scraper-deploy.api.ts
- [ ] `backend/src/routes/admin/analytics.route.ts`
- [ ] `backend/src/routes/admin/scraper-configs.admin.route.ts` — versioned deploy
- [ ] `backend/src/middleware/auth.ts` — admin role check (separate from user auth)

**Done when:** admin can log in, see analytics with real data, deploy a new scraper config, and the extension picks up the new config on next service worker wake.

---

## Cross-cutting (ongoing)

Privacy, security, observability, and docs work that doesn't fit into a single sprint.

- [ ] HTTPS everywhere; verify Supabase encryption-at-rest is enabled
- [ ] Hard rule: content scripts only activate on registry URL patterns (privacy)
- [ ] Playwright e2e suite gated per-PR (loads extension, hits a fixture nike.com page)
- [ ] `docs/architecture.md` — system diagram + data flow
- [ ] `docs/scraper-authoring-guide.md` — written during Sprint 5
- [ ] `docs/api-contract.md` — generated from `@fitr/types` Zod schemas
- [ ] Privacy policy published before launch (covers data scope, storage, third-party sharing, GDPR/CCPA rights)

---

## Open decisions to lock before sprints

1. **Auth model** (blocks Sprint 3): anonymous device-ID, magic link, or Supabase Auth email/password? Default: Supabase Auth anonymous sign-in.
2. **Cron hosting** (blocks Sprint 8): Supabase scheduled functions, separate cron worker, or `pg_cron`?
3. **Backend framework** (Sprint 3): Fastify (recommended) vs. Express vs. Hono?
4. **Onboarding blocking?** Should the wizard be blocking (can't use Fitr until done) or deferrable (skip with anonymous profile)?
5. **Scraper refresh cadence**: on service worker wake only, every N hours, or both?
