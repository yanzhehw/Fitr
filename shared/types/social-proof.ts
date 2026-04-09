/**
 * SocialProofEntry — anonymized peer-buyer record shown in the overlay feed.
 *
 * IMPORTANT: this shape represents data AFTER the backend's anonymization
 * layer (Tech Reqs §4) — usernames are already truncated, the k≥3 gate has
 * already been enforced, and only opted-in users are present. Consumers must
 * never see un-anonymized buyer data.
 */

import { z } from 'zod';

export const SocialProofEntrySchema = z.object({
  /** First 3 chars of the buyer's username + "***", e.g. "Yan***". */
  anonymizedUsername: z.string().regex(/^.{3}\*\*\*$/),
  /** Peer's height in centimeters. */
  heightCm: z.number().positive(),
  /** Peer's weight in kilograms. */
  weightKg: z.number().positive(),
  /** Brand-native size label the peer purchased. */
  sizePurchased: z.string().min(1),
  /** ISO timestamp — used to surface "recent" buyers first. */
  purchasedAt: z.string().datetime(),
});
export type SocialProofEntry = z.infer<typeof SocialProofEntrySchema>;
