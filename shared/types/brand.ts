/**
 * Brand — a supported retailer (Nike, adidas, New Balance for v1).
 *
 * Includes the canonical ProductCategory taxonomy used across all entities.
 * Brands map their internal labels (e.g. "running shoe", "tee") to one of these
 * via ScraperConfig.categoryMapping.
 */

import { z } from 'zod';

export const RegionSchema = z.enum(['NA', 'EU', 'UK', 'AU']);
export type Region = z.infer<typeof RegionSchema>;

/**
 * Fitr's normalized product taxonomy. v1 keeps it coarse — finer categories
 * (e.g. "hoodie" vs. "tee") share a size chart at the brand level.
 */
export const ProductCategorySchema = z.enum([
  'tops',
  'bottoms',
  'outerwear',
  'shoes',
]);
export type ProductCategory = z.infer<typeof ProductCategorySchema>;

export const BrandSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  enabled: z.boolean(),
  region: RegionSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type Brand = z.infer<typeof BrandSchema>;
