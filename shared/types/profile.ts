/**
 * Profile — the core user record.
 *
 * Captured during onboarding (Tech Reqs §1.1) and editable from the options page.
 * `measurements` are optional; if absent, the recommendation engine falls back to
 * body-metric approximation from height/weight/body type (Tech Reqs §1.3.2).
 */

import { z } from 'zod';

export const BodyTypeSchema = z.enum(['slim', 'average', 'athletic', 'broad']);
export type BodyType = z.infer<typeof BodyTypeSchema>;

export const GenderCategorySchema = z.enum(['mens', 'womens', 'unisex']);
export type GenderCategory = z.infer<typeof GenderCategorySchema>;

export const HeightUnitSchema = z.enum(['cm', 'in']);
export type HeightUnit = z.infer<typeof HeightUnitSchema>;

export const WeightUnitSchema = z.enum(['kg', 'lb']);
export type WeightUnit = z.infer<typeof WeightUnitSchema>;

/**
 * All measurements stored in centimeters internally regardless of the unit the
 * user entered. The UI handles cm/in conversion via lib/units.ts.
 */
export const MeasurementsSchema = z.object({
  chestCm: z.number().positive().optional(),
  waistCm: z.number().positive().optional(),
  hipCm: z.number().positive().optional(),
  inseamCm: z.number().positive().optional(),
  shoulderWidthCm: z.number().positive().optional(),
  footLengthCm: z.number().positive().optional(),
});
export type Measurements = z.infer<typeof MeasurementsSchema>;

export const ProfileSchema = z.object({
  id: z.string().uuid(),
  username: z.string().min(3),
  /** Stored in centimeters regardless of input unit. */
  heightCm: z.number().positive(),
  /** Stored in kilograms regardless of input unit. */
  weightKg: z.number().positive(),
  bodyType: BodyTypeSchema,
  genderCategory: GenderCategorySchema,
  measurements: MeasurementsSchema.optional(),
  /** Defaults OFF (Tech Reqs §1.1.3, Business Reqs §4). */
  socialProofOptIn: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type Profile = z.infer<typeof ProfileSchema>;

/** Shape used by the onboarding wizard before a user is persisted. */
export const ProfileDraftSchema = ProfileSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type ProfileDraft = z.infer<typeof ProfileDraftSchema>;
