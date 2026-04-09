/**
 * Recommendation request/response — the GET /recommend contract.
 *
 * The engine evaluates the data hierarchy in order (Tech Reqs §1.3.1):
 *   1. own_history    — user's own confirmed purchase for this SKU
 *   2. community      — aggregated purchases by similar-bodied users
 *   3. cross_brand    — normalized translation from a known fit
 *   4. size_chart     — body-metric approximation against the brand's chart
 *
 * The response always returns a single `recommendedSize` regardless of which
 * tier produced it (Tech Reqs §1.3.4 — no confidence levels surfaced in v1),
 * but the tier used is logged for analytics.
 */

import { z } from 'zod';
import { ProductCategorySchema } from './brand';
import { SocialProofEntrySchema } from './social-proof';

export const DataTierSchema = z.enum([
  'own_history',
  'community',
  'cross_brand',
  'size_chart',
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
