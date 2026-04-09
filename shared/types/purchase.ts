/**
 * Purchase — a tracked purchase event from a supported brand.
 *
 * Logged when the extension detects an order confirmation page (Tech Reqs §1.5.1).
 * `fitStatus` follows a "true until proven false" lifecycle (Tech Reqs §1.5.2):
 * starts as `pending`, becomes `confirmed` after a 30-day window with no
 * correction, or `corrected` if the user flags it as a bad fit.
 */

import { z } from 'zod';
import { ProductCategorySchema } from './brand';

export const FitStatusSchema = z.enum(['pending', 'confirmed', 'corrected']);
export type FitStatus = z.infer<typeof FitStatusSchema>;

export const PurchaseSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  brandId: z.string().uuid(),
  productSku: z.string().min(1),
  productCategory: ProductCategorySchema,
  /** Brand-native size label that the user actually purchased. */
  sizeLabel: z.string().min(1),
  fitStatus: FitStatusSchema,
  /** Which data tier the recommendation that informed this purchase came from
   * (for analytics — see Tech Reqs §1.6.2). Null if the user ignored the rec. */
  recommendationTierUsed: z.number().int().min(1).max(4).nullable(),
  purchasedAt: z.string().datetime(),
  /** Set when fitStatus transitions from pending to confirmed. */
  confirmedAt: z.string().datetime().nullable(),
});
export type Purchase = z.infer<typeof PurchaseSchema>;

/** Shape used by the extension when reporting a fresh purchase to the backend. */
export const PurchaseDraftSchema = PurchaseSchema.omit({
  id: true,
  fitStatus: true,
  confirmedAt: true,
});
export type PurchaseDraft = z.infer<typeof PurchaseDraftSchema>;
