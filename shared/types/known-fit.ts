/**
 * KnownFit — a self-reported "I know this size fits me" entry.
 *
 * Captured during onboarding (optional) and via the manual correction flow
 * (Tech Reqs §1.5.3). Feeds Tier 3 (cross-brand translation) of the
 * recommendation engine.
 */

import { z } from 'zod';
import { ProductCategorySchema } from './brand';

export const KnownFitSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  brandId: z.string().uuid(),
  productCategory: ProductCategorySchema,
  /** Brand-native size label, e.g. "M", "32", "US 10". */
  sizeLabel: z.string().min(1),
  createdAt: z.string().datetime(),
});
export type KnownFit = z.infer<typeof KnownFitSchema>;

export const KnownFitDraftSchema = KnownFitSchema.omit({
  id: true,
  userId: true,
  createdAt: true,
});
export type KnownFitDraft = z.infer<typeof KnownFitDraftSchema>;
