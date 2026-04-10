# Fitr

AI-powered cross-brand sizing advisor Chrome extension. Recommends the right clothing/footwear size by combining user profiles, brand size charts, and anonymized community purchase data.

## Tech stack

- **Extension:** React 18, TypeScript 5.5 (strict), Vite 5 + @crxjs/vite-plugin (MV3), Tailwind CSS 3
- **Validation:** Zod 4 — schemas are the source of truth; TS types are inferred via `z.infer<>`
- **Database:** Supabase (PostgreSQL) — client via `@supabase/supabase-js`
- **Backend (Sprint 3+):** Fastify + Zod + Supabase service-role client
- **Admin (Sprint 9+):** Vite + React + Tailwind

## Repo layout

Flat repo with sibling packages — no monorepo tooling (no Turborepo, no workspaces). Each top-level package has its own `package.json` and `tsconfig.json`.

```
Fitr/
├── src/                  Chrome extension source
│   ├── background/       MV3 service worker (message broker, settings sync)
│   ├── content/          Content script (page detection, overlay mount)
│   ├── popup/            Popup UI (status badge, open settings)
│   ├── options/          Options/settings page (tabbed layout)
│   ├── features/         Feature modules (onboarding, profile, overlay, etc.)
│   ├── lib/              Shared utilities (storage, units, api-client)
│   └── shared/           Extension-local types (Settings, Message)
├── backend/              Node REST API (stub until Sprint 3)
│   └── src/
├── admin/                Admin UI (stub until Sprint 9)
│   └── src/
├── shared/types/         @fitr/types — cross-package Zod schemas + TS types
├── supabase/             SQL migrations + seed data
│   ├── migrations/
│   └── seed/
├── .claude/docs/         Business requirements, technical requirements, sprint todos
├── manifest.json         Chrome extension manifest (MV3)
├── vite.config.ts        Extension build config (port 5273)
├── tsconfig.json         Root TS config (strict, ES2022)
└── package.json          Root extension package
```

## Path alias

`@fitr/types` resolves to `shared/types/index.ts`. Configured in both:
- `tsconfig.json` → `paths`
- `vite.config.ts` → `resolve.alias`

All cross-package types (Profile, Brand, Purchase, etc.) live here as Zod schemas with co-located inferred TS types. Use `import { Profile } from '@fitr/types'` — never import directly from `shared/types/`.

## Commands

```sh
npm run dev        # Vite dev server on port 5273 with HMR
npm run build      # tsc -b && vite build → dist/
npm run preview    # Serve built extension locally
```

To load in Chrome: `chrome://extensions` → Developer mode → Load unpacked → select `dist/`.

## Architecture

- **MV3 service worker** (`src/background/background.ts`): message broker between popup, options, and content script. Initializes default settings on install.
- **Message passing:** typed messages via `chrome.runtime.sendMessage` / `onMessage`. Message types defined in `src/shared/types.ts`.
- **Settings:** stored in `chrome.storage.sync`. Extension-local `Settings` type in `src/shared/types.ts`.
- **Supabase client:** lazy-loaded singleton in `src/shared/supabase.ts` using `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` env vars.
- **Content scripts** run on `<all_urls>` (MV3 manifest). Activation is gated by the scraper registry — only act on supported brand URLs.

## Coding conventions

- TypeScript strict mode (`noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`)
- Every data entity has a Zod schema + inferred type in `shared/types/`. Backend uses `.parse()` for runtime validation; extension/admin import only the types.
- Feature-folder structure under `src/features/` — each feature gets `components/`, `*.store.ts`, `*.api.ts`, `index.ts`
- React functional components with hooks
- Tailwind for styling — no CSS modules or styled-components
- Internal units: cm for height/measurements, kg for weight. UI shows unit toggles (cm/ft-in, kg/lbs)

## Coding guidelines

- **Imports:** use `@fitr/types` alias for cross-package types. Use relative imports within the same package.
- **Naming:** PascalCase for components and types, camelCase for functions/variables, UPPER_SNAKE_CASE for constants. Zod schemas use `PascalCase` + `Schema` suffix (e.g., `ProfileSchema`).
- **File naming:** kebab-case for files (e.g., `body-approximation.ts`), PascalCase for React components (e.g., `UsernameStep.tsx`).
- **Error handling:** validate at system boundaries (user input, API requests) with Zod `.parse()`. Trust internal code and framework guarantees — don't add redundant checks.
- **State management:** `chrome.storage.sync` for persisted settings, React state/hooks for UI state, reducers/state machines for complex flows (e.g., onboarding wizard).
- **API layer:** feature-level `*.api.ts` files handle fetch calls. Shared `src/lib/api-client.ts` provides auth header injection and error normalization.
- **Chrome APIs:** wrap `chrome.storage` and `chrome.runtime.sendMessage` in typed helpers in `src/lib/`. Never call raw Chrome APIs directly from components.
- **CSS:** use Tailwind utility classes. Keep `index.css` files minimal (Tailwind directives + global resets only). No inline `style` props unless dynamic values require it.
- **Async patterns:** use `async/await` over `.then()` chains. Handle loading/error states in hooks.
- **Commit scope:** one logical change per commit. Prefix commit messages with the sprint or feature area (e.g., `sprint-2: add onboarding wizard`).

## Testing rules

- **Test framework:** Vitest (to be added in Sprint 2 alongside first testable code)
- **Test file location:** co-locate test files next to the code they test using `*.test.ts` / `*.test.tsx` suffix
- **Unit tests required for:**
  - Reducers and state machines (`*.store.ts`)
  - Utility functions (`src/lib/` — storage wrappers, unit conversions, etc.)
  - Zod schema validation edge cases (only when schemas have custom refinements)
  - Recommendation engine tiers (each tier tested independently + fallback chain)
  - Anonymization logic (k-anonymity gate, username truncation, opt-in filtering)
- **Fixture-based tests for scrapers:** save real product page HTML snapshots in `src/scrapers/<brand>/fixtures/` and test extraction against them. Never hit live websites in tests.
- **Integration tests:** cascade delete (Sprint 3), recommendation engine end-to-end (Sprint 6)
- **No mocking Chrome APIs in unit tests** — extract logic into pure functions that can be tested without browser context. Test Chrome integration via manual loading or e2e.
- **E2E (future):** Playwright for cross-cutting flows (loads extension, navigates fixture pages). Not yet configured.
- **Test commands** (once Vitest is added):
  ```sh
  npm test           # Run all tests
  npm test -- --watch  # Watch mode
  ```

## Current status

- **Sprints 0–1 complete:** project skeleton, `@fitr/types` shared contract (all entity schemas), path alias wiring, basic popup/options/background/content scripts
- **Current branch:** `backend-setup`
- **Next:** Sprint 2 — onboarding wizard (see `.claude/docs/todos.md`)

## Requirements docs

Full specifications live in `.claude/docs/`:
- `Fitr_Business_Requirements.md` — problem, personas, monetization, phased roadmap, risks
- `Fitr_Technical_Requirements.md` — onboarding flow, scrapers, recommendation engine (4-tier hierarchy), data model, privacy
- `todos.md` — sprint-organized task list with dependency map

## Key constraints

- **Social proof opt-in defaults OFF** — users must explicitly enable it
- **k-anonymity:** social proof entries only shown when 3+ qualifying entries exist for a product
- **Username truncation:** first 3 chars + `***` in social proof (e.g., "Yan***")
- **Affiliate links must never override** existing referral cookies
- **Account deletion cascades:** purges User + KnownFit + Purchase + consent records
- **Content scripts** activate only on scraper registry URL patterns (privacy requirement), even though manifest declares `<all_urls>`
- **v1 brands:** Nike, adidas, New Balance (clothing tops/bottoms/outerwear + shoes)

## Open decisions (lock before relevant sprint)

1. **Auth model** (blocks Sprint 3): anonymous device-ID, magic link, or Supabase Auth?
2. **Cron hosting** (blocks Sprint 8): Supabase scheduled functions, cron worker, or pg_cron?
3. **Onboarding blocking?** Wizard required before use, or skippable with anonymous profile?
