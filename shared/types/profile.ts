/**
 * Profile — the core user record.
 *
 * Captured during onboarding (Tech Reqs §1.1) and editable from the options page.
 * The Approximation Model produces `predictedMeasurements` from height/weight/body_type.
 * `exactMeasurements` are user-provided overrides (Tech Reqs §1.3.3).
 */

import { z } from 'zod';

/** Gender-specific body type enums. */
export const BodyTypeMensSchema = z.enum(['inverted_triangle', 'rectangle', 'oval']);
export type BodyTypeMens = z.infer<typeof BodyTypeMensSchema>;

export const BodyTypeWomensSchema = z.enum(['apple', 'pear', 'hourglass', 'cane_sugar', 'athletic']);
export type BodyTypeWomens = z.infer<typeof BodyTypeWomensSchema>;

export const GenderCategorySchema = z.enum(['mens', 'womens', 'unisex']);
export type GenderCategory = z.infer<typeof GenderCategorySchema>;

export const HeightUnitSchema = z.enum(['cm', 'in']);
export type HeightUnit = z.infer<typeof HeightUnitSchema>;

export const WeightUnitSchema = z.enum(['kg', 'lb']);
export type WeightUnit = z.infer<typeof WeightUnitSchema>;

export const MeasurementConfidenceSchema = z.enum(['low', 'medium', 'high']);
export type MeasurementConfidence = z.infer<typeof MeasurementConfidenceSchema>;

/**
 * MeasurementVector — the universal intermediate layer for size matching.
 *
 * All fields are nullable — only relevant fields populated per user's available data.
 * `lengthCm` represents garment full vertical length; its semantic meaning (top length
 * vs. pant length) is resolved at scoring time by product category.
 * `thighCm` is only scored for bottoms/pants.
 */
export const MeasurementVectorSchema = z.object({
  chestCm: z.number().positive().nullable().optional(),
  waistCm: z.number().positive().nullable().optional(),
  hipCm: z.number().positive().nullable().optional(),
  inseamCm: z.number().positive().nullable().optional(),
  shoulderWidthCm: z.number().positive().nullable().optional(),
  footLengthCm: z.number().positive().nullable().optional(),
  lengthCm: z.number().positive().nullable().optional(),
  thighCm: z.number().positive().nullable().optional(),
});
export type MeasurementVector = z.infer<typeof MeasurementVectorSchema>;

export const ProfileSchema = z.object({
  id: z.string().uuid(),
  username: z.string().min(3),
  /** Stored in centimeters regardless of input unit. */
  heightCm: z.number().positive(),
  /** Stored in kilograms regardless of input unit. */
  weightKg: z.number().positive(),
  genderCategory: GenderCategorySchema,
  /** Exactly one of bodyTypeMens / bodyTypeWomens should be set, matching genderCategory. */
  bodyTypeMens: BodyTypeMensSchema.nullable().optional(),
  bodyTypeWomens: BodyTypeWomensSchema.nullable().optional(),
  /** Computed by the Approximation Model, cached on profile create/update. */
  predictedMeasurements: MeasurementVectorSchema.nullable().optional(),
  /** User-provided measurements — overrides predictions when present. */
  exactMeasurements: MeasurementVectorSchema.nullable().optional(),
  /** Reflects how much ground truth data backs the prediction. */
  measurementConfidence: MeasurementConfidenceSchema,
  /** Defaults OFF (Tech Reqs §1.1.3, Business Reqs §4). */
  socialProofOptIn: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type Profile = z.infer<typeof ProfileSchema>;

/** Shape used by the onboarding wizard before a user is persisted. */
export const ProfileDraftSchema = ProfileSchema.omit({
  id: true,
  predictedMeasurements: true,
  measurementConfidence: true,
  createdAt: true,
  updatedAt: true,
});
export type ProfileDraft = z.infer<typeof ProfileDraftSchema>;
