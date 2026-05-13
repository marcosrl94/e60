/**
 * Datapoints — the atomic unit of E6.0
 *
 * A datapoint is a single piece of ESG information identified by:
 *   - An ID (typically the EFRAG ESRS code, e.g. "E1-6_01")
 *   - A name (human-readable label)
 *   - A type (numeric, percentage, monetary, text, boolean)
 *   - A unit when applicable
 *   - Mappings to multiple frameworks
 *   - A current value with provenance metadata
 */

import { z } from 'zod';
import { FrameworkCodeSchema } from '../frameworks';
import {
  ComparativePeriodValueSchema,
  DatapointLineageSchema,
  DatapointWorkflowStatusSchema,
  ReportingPeriodSchema,
} from '../lineage';

/**
 * ESRS top-level topic taxonomy.
 * Matches the official EFRAG taxonomy.
 */
export const EsrsTopicSchema = z.enum([
  'E1', // Climate change
  'E2', // Pollution
  'E3', // Water and marine resources
  'E4', // Biodiversity and ecosystems
  'E5', // Resource use and circular economy
  'S1', // Own workforce
  'S2', // Workers in the value chain
  'S3', // Affected communities
  'S4', // Consumers and end-users
  'G1', // Business conduct
  'GENERAL', // ESRS 1+2 cross-cutting
]);

export type EsrsTopic = z.infer<typeof EsrsTopicSchema>;

export const DatapointTypeSchema = z.enum([
  'numeric',
  'percentage',
  'monetary',
  'text',
  'boolean',
  'date',
  'enum',
]);

export type DatapointType = z.infer<typeof DatapointTypeSchema>;

export const DatapointStatusSchema = z.enum([
  'live',        // captured and validated, ready for disclosure
  'partial',     // captured but with gaps or under review
  'blocked',     // unable to capture due to methodology gap
  'pending',     // not yet captured
  'not_material', // declared not material in latest assessment
  'custom',      // bank-specific datapoint
]);

export type DatapointStatus = z.infer<typeof DatapointStatusSchema>;

/**
 * A reference to a datapoint in another framework, with optional formula
 * (e.g. when one framework requires a transformation of the source datapoint).
 */
export const FrameworkMappingSchema = z.object({
  framework: FrameworkCodeSchema,
  /** External code in the target framework, e.g. "C6.1a", "GRI 305-1" */
  externalCode: z.string(),
  /** Optional transformation formula */
  formula: z.string().optional(),
  /** Whether this mapping has been validated by the framework's mapping authority */
  authoritative: z.boolean().default(false),
});

export type FrameworkMapping = z.infer<typeof FrameworkMappingSchema>;

/**
 * Provenance: where this datapoint's value came from.
 */
export const DatapointSourceSchema = z.object({
  type: z.enum(['engine', 'connector', 'manual', 'derived']),
  /** Engine name (e.g. "alquid_nz", "carbon_intelligence") or connector name */
  identifier: z.string(),
  /** When the value was last computed/synced */
  lastSync: z.string().datetime(),
  /** PCAF Data Quality score, 1 (best) to 5 (worst) */
  dataQualityScore: z.number().min(1).max(5).optional(),
});

export type DatapointSource = z.infer<typeof DatapointSourceSchema>;

/**
 * Regulatory crosswalk codes from EFRAG IG3 Appendix B (ESRS 2 connections).
 * Indicates which other regulation/template a datapoint also serves.
 */
export const RegulatoryCrosswalkSchema = z.enum([
  'SFDR',         // Sustainable Finance Disclosure Regulation
  'PILLAR_3',     // EBA Pillar III ESG (Implementing Technical Standards)
  'BENCHMARK',    // EU Benchmark Regulation (low-carbon / Paris-aligned)
  'CLIMATE_LAW',  // EU Climate Law
]);

export type RegulatoryCrosswalk = z.infer<typeof RegulatoryCrosswalkSchema>;

/**
 * EFRAG IG3 Appendix C — phase-in periods. Datapoints flagged here are
 * eligible to be omitted from the first reporting cycle and disclosed only
 * after the indicated number of years.
 */
export const PhaseInYearsSchema = z.union([z.literal(1), z.literal(2), z.literal(3)]);
export type PhaseInYears = z.infer<typeof PhaseInYearsSchema>;

/**
 * Core datapoint schema.
 */
export const DatapointSchema = z.object({
  id: z.string(),
  /** Optional EFRAG taxonomy ID */
  efragId: z.string().optional(),
  /** Human-readable name */
  name: z.string(),
  /** Longer definition (used in detail panels) */
  definition: z.string().optional(),
  /** ESRS topic this belongs to */
  topic: EsrsTopicSchema,
  /** Specific ESRS disclosure requirement (e.g. "E1-6", "S1-9") */
  esrsDisclosure: z.string().optional(),
  /** Paragraph reference within the disclosure (e.g. "5 a", "16 b iv") */
  paragraph: z.string().optional(),
  /** Application Requirements references (e.g. "AR 6 - AR 7") */
  relatedAr: z.string().optional(),
  type: DatapointTypeSchema,
  /** Unit of measurement, when applicable */
  unit: z.string().optional(),
  status: DatapointStatusSchema,
  /** Mappings to other frameworks */
  mappings: z.array(FrameworkMappingSchema).default([]),
  /** Regulatory crosswalk per EFRAG IG3 Appendix B (SFDR, Pillar III, etc.) */
  crosswalk: z.array(RegulatoryCrosswalkSchema).default([]),
  /** Phase-in window per EFRAG IG3 Appendix C, in years (1, 2 or 3) */
  phaseInYears: PhaseInYearsSchema.optional(),
  /** True when the datapoint is conditional / alternative per EFRAG */
  conditional: z.boolean().default(false),
  /** "May [V]" voluntary disclosure flag from EFRAG IG3 */
  mayDisclose: z.boolean().default(false),
  /** True for fully voluntary datapoints (Appendix C, voluntary list) */
  voluntary: z.boolean().default(false),
  /** Latest captured value, formatted as string for flexibility */
  latestValue: z.string().optional(),
  /** Numeric value when applicable, for sorting and aggregation */
  numericValue: z.number().optional(),
  /** Source / provenance */
  source: DatapointSourceSchema.optional(),
  /** Owner of the datapoint (typically a team or individual) */
  owner: z.string().optional(),
  /** Whether this is a custom (bank-specific) datapoint */
  isCustom: z.boolean().default(false),
  /** Tags for filtering */
  tags: z.array(z.string()).default([]),
  /**
   * Workflow approval status. Orthogonal to `status` (which describes
   * EFRAG IG3 readiness) — this one tracks the human review cycle:
   * empty → draft → review → approved → locked.
   */
  workflowStatus: DatapointWorkflowStatusSchema.optional(),
  /** Reporting period the captured value applies to. */
  period: ReportingPeriodSchema.optional(),
  /** Number of evidence attachments backing the value (docs, screenshots, formulas). */
  evidenceCount: z.number().int().nonnegative().optional(),
  /** Full provenance + value history for audit. */
  lineage: DatapointLineageSchema.optional(),
  /**
   * Prior-period values (N-1, N-2…). ESRS / CSRD comparative reporting
   * requires at least N-1 for quantitative disclosures; by the third
   * cycle the full N / N-1 / N-2 chain is mandatory. Ordered newest-
   * first (closest comparative period first).
   */
  comparatives: z.array(ComparativePeriodValueSchema).default([]),
});

export type Datapoint = z.infer<typeof DatapointSchema>;

/**
 * Aggregated counts by status — used in KPI cards and progress bars.
 */
export interface DatapointStatusCounts {
  live: number;
  partial: number;
  blocked: number;
  pending: number;
  total: number;
}
