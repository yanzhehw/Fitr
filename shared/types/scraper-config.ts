/**
 * ScraperConfig — modular per-brand scraping definition.
 *
 * Each supported brand has one config (Tech Reqs §1.2.3) describing how to
 * detect product pages, extract product data, and identify order confirmation
 * pages. Configs are versioned in the backend so updates can roll out without
 * shipping a new extension build.
 */

import { z } from 'zod';
import { ProductCategorySchema } from './brand';

/**
 * CSS selectors (or XPath, encoded as strings) used by the content script to
 * extract product data from a supported page.
 */
export const ScraperSelectorsSchema = z.object({
  productName: z.string(),
  /** Optional — many brands encode category in the URL instead. */
  productCategory: z.string().optional(),
  productSku: z.string(),
  availableSizes: z.string(),
  /** Optional — useful when the brand renders multiple sub-brands on one site. */
  brandName: z.string().optional(),
});
export type ScraperSelectors = z.infer<typeof ScraperSelectorsSchema>;

export const ScraperConfigSchema = z.object({
  id: z.string().uuid(),
  brandId: z.string().uuid(),
  /** Monotonically increasing version. The extension caches the latest. */
  version: z.number().int().positive(),
  /** Regex string. e.g. "^https://www\\.nike\\.com/t/.+" */
  urlPattern: z.string().min(1),
  selectors: ScraperSelectorsSchema,
  /** Regex string for the order confirmation page (Tech Reqs §1.5.1). */
  confirmationPattern: z.string().min(1),
  /** Brand-native category label → Fitr's normalized ProductCategory. */
  categoryMapping: z.record(z.string(), ProductCategorySchema),
  enabled: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type ScraperConfig = z.infer<typeof ScraperConfigSchema>;

/** What the extension extracts from a single product page. */
export const ScrapedProductSchema = z.object({
  brandId: z.string().uuid(),
  brandName: z.string(),
  productCategory: ProductCategorySchema,
  productSku: z.string().min(1),
  productName: z.string(),
  availableSizes: z.array(z.string().min(1)),
  productUrl: z.string().url(),
});
export type ScrapedProduct = z.infer<typeof ScrapedProductSchema>;
