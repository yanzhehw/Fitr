/**
 * BrandSizeChart + NormalizedSizeMap — the size translation backbone.
 *
 * BrandSizeChart is the brand's published table (Tech Reqs §1.3.3) — used by
 * Tier 4 to match a user's body measurements against a size label.
 *
 * NormalizedSizeMap maps each brand size to Fitr's internal scale, enabling
 * Tier 3 cross-brand translation. Both are seeded from public data and
 * maintained via the admin panel + Supabase Studio.
 */

import { z } from 'zod';
import { ProductCategorySchema } from './brand';
import { GenderCategorySchema } from './profile';

/**
 * Map from measurement key (chest, waist, hip, inseam, shoulderWidth,
 * footLength) to a [min, max] range expressed in centimeters.
 */
export const SizeChartMeasurementsSchema = z.record(
  z.string(),
  z.tuple([z.number().nonnegative(), z.number().positive()]),
);
export type SizeChartMeasurements = z.infer<typeof SizeChartMeasurementsSchema>;

export const BrandSizeChartSchema = z.object({
  id: z.string().uuid(),
  brandId: z.string().uuid(),
  genderCategory: GenderCategorySchema,
  productCategory: ProductCategorySchema,
  /** Brand-native size label, e.g. "S", "M", "32", "US 10". */
  sizeLabel: z.string().min(1),
  measurements: SizeChartMeasurementsSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type BrandSizeChart = z.infer<typeof BrandSizeChartSchema>;

/**
 * Fitr's internal normalized scale — small integers per category that allow
 * cross-brand comparison. e.g. mens-tops 0..10, mens-shoes 0..30.
 */
export const NormalizedSizeMapSchema = z.object({
  id: z.string().uuid(),
  brandId: z.string().uuid(),
  genderCategory: GenderCategorySchema,
  productCategory: ProductCategorySchema,
  /** Brand-native label, matches BrandSizeChart.sizeLabel. */
  sizeLabel: z.string().min(1),
  /** Position on Fitr's internal scale for this category. */
  fitrInternalSize: z.number(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type NormalizedSizeMap = z.infer<typeof NormalizedSizeMapSchema>;
