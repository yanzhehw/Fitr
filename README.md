# Fitr

AI-powered cross-brand sizing advisor for online clothing and footwear shoppers.

## The idea

Sizes aren't standardized across brands — a Medium at Nike isn't a Medium at New Balance, and most shoppers don't know their precise body measurements. Fitr is a Chrome extension that recommends the right size for the brand you're currently shopping, by combining your profile (height, weight, body type, and any "I know this fits" data points you've told us about) with publicly available brand size charts and anonymized community purchase data. When the recommendation is wrong, you tell us, and the model learns.

For the full product story see [docs/Fitr_Business_Requirements.md](docs/Fitr_Business_Requirements.md). For the technical spec see [docs/Fitr_Technical_Requirements.md](docs/Fitr_Technical_Requirements.md).

## How it works

1. You install the Chrome extension and complete a lightweight onboarding (username, height, weight, body type, gender; optional measurements and "known fits" from brands you trust).
2. When you visit a supported product page, a per-brand scraper detects the product and extracts brand, category, SKU, and the available sizes.
3. The extension calls the Fitr backend, which evaluates a 4-tier recommendation hierarchy (your own purchase history → community data with similar bodies → cross-brand size translation → brand size chart approximation) and returns a single recommended size plus a feed of anonymized peer buyers.
4. When you complete a checkout, the extension logs the purchase. If you don't flag it as a bad fit within 30 days, it becomes a positive signal that improves future recommendations for everyone.

## Repo layout

This is a flat repo with sibling folders — no monorepo tooling. Each top-level package has its own `package.json` and `tsconfig.json`. Cross-package types are shared via the `@fitr/types` path alias which resolves to `shared/types/`.

```
Fitr/
├── src/                  Chrome extension (MV3, Vite + React + Tailwind)
├── backend/              Node REST API (Sprint 3 onwards)
├── admin/                Minimal custom admin UI (Sprint 9)
├── supabase/             SQL migrations + seed data
├── shared/types/         @fitr/types — Zod schemas + inferred TS types
├── docs/                 Business + technical requirements + sprint todos
├── manifest.json         Extension manifest
├── vite.config.ts        Extension build config
└── package.json          Extension package (root)
```

For the full structure and the sprint plan see [docs/todos.md](docs/todos.md).

## Prerequisites

- **Node.js 20+** and **npm 10+**
- **Google Chrome** (or any Chromium-based browser that supports unpacked MV3 extensions)

## Setup

```sh
git clone <repo-url> Fitr
cd Fitr
npm install
```

## Running the extension in development

```sh
npm run dev
```

This starts Vite on port 5273 with hot-reload for the popup, options page, and content scripts.

To load the extension in Chrome:

1. Open `chrome://extensions`.
2. Enable **Developer mode** (top right).
3. Click **Load unpacked**.
4. Select the `dist/` folder (run `npm run build` once first if it doesn't exist).
5. Pin the Fitr icon to the toolbar.

After making code changes, the extension hot-reloads automatically. If hot-reload misbehaves, click the refresh icon next to "Fitr" on the `chrome://extensions` page.

## Build commands

```sh
npm run build      # type-check + production build to dist/
npm run preview    # serve the built extension locally
```

## Backend and admin (not yet wired)

`backend/` and `admin/` are stub packages as of Sprint 1 — they have a `package.json` and `tsconfig.json` but no source code yet. They will come online during:

- **Sprint 3** — backend bootstrap (Fastify + Supabase service-role client + profile/account routes)
- **Sprint 9** — admin UI (Vite + React, analytics dashboard + scraper-config deploy)

Run `cat backend/package.json` or `cat admin/package.json` to see their current state.

## Where to read more

- [docs/Fitr_Business_Requirements.md](docs/Fitr_Business_Requirements.md) — problem, personas, monetization, roadmap, risks
- [docs/Fitr_Technical_Requirements.md](docs/Fitr_Technical_Requirements.md) — onboarding flow, scrapers, recommendation engine, data model, system architecture
- [docs/todos.md](docs/todos.md) — sprint-organized task list with current status
- [supabase/README.md](supabase/README.md) — local Supabase setup (becomes relevant in Sprint 3)

## Status

Sprints 0 and 1 are complete: the folder skeleton, the `@fitr/types` shared contract (Zod schemas for every entity in the technical requirements), and the path alias wiring are all in place. The extension still builds and loads with the existing enable/disable toggle. Sprint 2 (onboarding wizard) is the next unit of work.
