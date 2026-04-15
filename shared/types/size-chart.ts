/**
 * BrandSizeChart + BrandSizeChartEntry — the size matching backbone.
 *
 * BrandSizeChart is a parent container per brand + gender + product category.
 * BrandSizeChartEntry holds individual size labels with measurement ranges
 * (e.g., chest_cm: [96, 104]). The recommendation engine's overlap scoring
 * compares a user's MeasurementVector against these ranges.
 *
 * NormalizedSizeMap has been removed — cross-brand translation now works
 * through direct measurement overlap scoring (Tech Reqs §1.3.5).
 */

import { z } from 'zod';
import { ProductCategorySchema } from './brand';
import { GenderCategorySchema } from './profile';

/**
 * Map from measurement key (chest_cm, waist_cm, hip_cm, inseam_cm,
 * shoulder_width_cm, foot_length_cm, length_cm, thigh_cm) to a [min, max]
 * range expressed in centimeters. Only relevant axes are populated per
 * product category.
 */
export const MeasurementRangesSchema = z.record(
  z.string(),
  z.tuple([z.number().nonnegative(), z.number().positive()]),
);
export type MeasurementRanges = z.infer<typeof MeasurementRangesSchema>;

/** Parent container: one per brand + gender_category + product_category. */
export const BrandSizeChartSchema = z.object({
  id: z.string().uuid(),
  brandId: z.string().uuid(),
  genderCategory: GenderCategorySchema,
  productCategory: ProductCategorySchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type BrandSizeChart = z.infer<typeof BrandSizeChartSchema>;

/** Individual size entry within a chart, e.g. "M" with chest_cm [96, 104]. */
export const BrandSizeChartEntrySchema = z.object({
  id: z.string().uuid(),
  sizeChartId: z.string().uuid(),
  /** Brand-native size label, e.g. "S", "M", "32", "US 10". */
  sizeLabel: z.string().min(1),
  measurementRanges: MeasurementRangesSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type BrandSizeChartEntry = z.infer<typeof BrandSizeChartEntrySchema>;

/** Shape used by admin when uploading size chart entries. */
export const BrandSizeChartEntryDraftSchema = BrandSizeChartEntrySchema.omit({
  id: true,
  sizeChartId: true,
  createdAt: true,
  updatedAt: true,
});
export type BrandSizeChartEntryDraft = z.infer<typeof BrandSizeChartEntryDraftSchema>;
