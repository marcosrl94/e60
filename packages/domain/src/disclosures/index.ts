/**
 * Disclosures · the outputs of E6.0
 *
 * A disclosure is a deliverable assembled from datapoints — a CSRD report,
 * a CDP submission, a Pillar III ESG TBL, a board dashboard, etc.
 */

import { z } from 'zod';
import { FrameworkCodeSchema } from '../frameworks';

export const DisclosureStatusSchema = z.enum([
  'draft',
  'in_prep',
  'pending_review',
  'pending_signoff',
  'published',
  'submitted',
  'scheduled',
  'archived',
]);

export type DisclosureStatus = z.infer<typeof DisclosureStatusSchema>;

export const DisclosureSchema = z.object({
  id: z.string(),
  /** Internal name (e.g. "Estado de información sostenibilidad 2025") */
  name: z.string(),
  /** Source framework */
  framework: FrameworkCodeSchema,
  /** Optional sub-classification (e.g. "C6.1a" for CDP) */
  frameworkVariant: z.string().optional(),
  status: DisclosureStatusSchema,
  /** Reporting period this disclosure covers */
  periodStart: z.string().date(),
  periodEnd: z.string().date(),
  /** Submission deadline */
  deadline: z.string().date().optional(),
  /** Datapoints that this disclosure consumes */
  datapointIds: z.array(z.string()).default([]),
  /** % of required datapoints captured */
  completionPercent: z.number().min(0).max(100),
  /** Owner */
  owner: z.string(),
  /** External auditor when applicable */
  auditor: z.string().optional(),
  /** Audience tag for internal disclosures (e.g. "Board of Directors") */
  audience: z.string().optional(),
});

export type Disclosure = z.infer<typeof DisclosureSchema>;
