/**
 * Recommendation request/response — the GET /recommend contract.
 *
 * The engine evaluates the data hierarchy in priority order (Tech Reqs §1.3.2):
 *   1. own_history              — user's own confirmed purchase for this brand+category
 *   2. measurement_approximation — MeasurementVector overlap scoring against size chart
 *   3. community                — weighted vote from similar-bodied users for this SKU
 *   4. known_fit_translation    — KnownFit at Brand A → midpoint vector → overlap at Brand B
 *
 * The response always returns a single `recommendedSize` regardless of which
 * tier produced it (Tech Reqs §1.3.6 — no confidence levels surfaced in v1),
 * but the tier used is logged for analytics.
 */

import { z } from 'zod';
import { ProductCategorySchema } from './brand';
import { SocialProofEntrySchema } from './social-proof';

export const DataTierSchema = z.enum([
  'own_history',
  'measurement_approximation',
  'community',
  'known_fit_translation',
]);
export type DataTier = z.infer<typeof DataTierSchema>;

export const RecommendRequestSchema = z.object({
  userId: z.string().uuid(),
  brandId: z.string().uuid(),
  productCategory: ProductCategorySchema,
  productSku: z.string().min(1),
});
export type RecommendRequest = z.infer<typeof RecommendRequestSchema>;

export const RecommendResponseSchema = z.object({
  /** Brand-native size label, e.g. "M", "32", "US 10". */
  recommendedSize: z.string().min(1),
  brandName: z.string(),
  productCategory: ProductCategorySchema,
  /** Which tier produced the recommendation — logged but never displayed. */
  tierUsed: DataTierSchema,
  /** Already anonymized + k≥3-gated by the backend. May be empty. */
  socialProof: z.array(SocialProofEntrySchema),
});
export type RecommendResponse = z.infer<typeof RecommendResponseSchema>;
