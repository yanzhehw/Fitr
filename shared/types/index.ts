/**
 * @fitr/types — shared type contract for the Fitr extension, backend, and admin panel.
 *
 * Each entity from the technical requirements has a Zod schema co-located with
 * its inferred TypeScript type. The backend uses `schema.parse()` for runtime
 * validation; the extension and admin import only the inferred types.
 *
 * Consumers reference this package via the `@fitr/types` path alias configured
 * in each package's tsconfig.json (and vite.config.ts for the extension).
 * There is no published npm package — types resolve directly from
 * `../shared/types/` at compile and bundle time.
 */

export * from './profile';
export * from './brand';
export * from './known-fit';
export * from './size-chart';
export * from './purchase';
export * from './scraper-config';
export * from './social-proof';
export * from './recommendation';
export * from './correction';
