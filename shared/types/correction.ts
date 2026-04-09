/**
 * Correction — user-submitted feedback that a recommendation was wrong.
 *
 * Triggered from the overlay's "Correct this recommendation" link
 * (Tech Reqs §1.5.3). Updates the user's profile and feeds the cross-brand
 * mapping. Either `actualSize` or `fitFeedback` must be provided.
 */

import { z } from 'zod';

export const FitFeedbackSchema = z.enum(['ran_large', 'ran_small', 'just_right']);
export type FitFeedback = z.infer<typeof FitFeedbackSchema>;

export const CorrectionSchema = z
  .object({
    id: z.string().uuid(),
    userId: z.string().uuid(),
    purchaseId: z.string().uuid(),
    /** What the user says actually fits, e.g. "L" instead of the recommended "M". */
    actualSize: z.string().min(1).optional(),
    fitFeedback: FitFeedbackSchema.optional(),
    notes: z.string().max(500).optional(),
    createdAt: z.string().datetime(),
  })
  .refine((data) => data.actualSize !== undefined || data.fitFeedback !== undefined, {
    message: 'Either actualSize or fitFeedback must be provided',
  });
export type Correction = z.infer<typeof CorrectionSchema>;

/** Shape used by the extension when submitting a correction. */
export const CorrectionDraftSchema = z
  .object({
    purchaseId: z.string().uuid(),
    actualSize: z.string().min(1).optional(),
    fitFeedback: FitFeedbackSchema.optional(),
    notes: z.string().max(500).optional(),
  })
  .refine((data) => data.actualSize !== undefined || data.fitFeedback !== undefined, {
    message: 'Either actualSize or fitFeedback must be provided',
  });
export type CorrectionDraft = z.infer<typeof CorrectionDraftSchema>;
