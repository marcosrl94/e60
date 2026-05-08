/**
 * Materiality types · CSRD double materiality
 *
 * Models the data structures needed for Materiality Studio:
 *   - Material topics (the 10 ESRS topics + sub-topics)
 *   - Double materiality scores (impact + financial)
 *   - IROs (Impacts, Risks, Opportunities) per topic
 *   - Stakeholder consultation data
 *   - Assessment workflow state
 *
 * Industry materiality (NACE × scope/category heatmap pre-screening) is in
 * `./industry.ts` — a complementary, GHG-specific layer that runs before the
 * IRO workshop produces the topic-level scores defined here.
 */

import { z } from 'zod';
import { EsrsTopicSchema } from '../datapoints';

export * from './industry';

/**
 * Materiality category — first-level classification used in matrix coloring.
 */
export const MaterialityCategorySchema = z.enum(['env', 'soc', 'gov']);
export type MaterialityCategory = z.infer<typeof MaterialityCategorySchema>;

/**
 * Priority bucket (derived from impact + financial scores).
 * Topics with both scores >= 3 are "high"; with one score >= 3 are "med";
 * otherwise "low" (and typically declared not material).
 */
export const MaterialityPrioritySchema = z.enum(['high', 'med', 'low']);
export type MaterialityPriority = z.infer<typeof MaterialityPrioritySchema>;

/**
 * Score on the 1-5 scale used by most CSRD materiality methodologies.
 */
export const MaterialityScoreSchema = z.number().min(1).max(5);
export type MaterialityScore = z.infer<typeof MaterialityScoreSchema>;

/**
 * A material topic with its scores and metadata.
 */
export const MaterialTopicSchema = z.object({
  id: z.string(),
  esrsTopic: EsrsTopicSchema,
  name: z.string(),
  category: MaterialityCategorySchema,
  priority: MaterialityPrioritySchema,
  /** Impact materiality score (org → environment/society) */
  impactScore: MaterialityScoreSchema,
  /** Financial materiality score (environment/society → org) */
  financialScore: MaterialityScoreSchema,
  /** Whether the topic was declared material in the most recent assessment */
  isMaterial: z.boolean(),
  /** Year of the assessment producing these scores */
  assessmentYear: z.number().int(),
  /** Number of stakeholders that highlighted this topic (out of total consulted) */
  stakeholderHighlights: z.number().int().nonnegative(),
  /** Total stakeholders consulted (denominator) */
  totalStakeholders: z.number().int().positive(),
});

export type MaterialTopic = z.infer<typeof MaterialTopicSchema>;

/**
 * IRO type — Impacts, Risks, Opportunities are the three dimensions of CSRD.
 */
export const IroTypeSchema = z.enum(['impact', 'risk', 'opportunity']);
export type IroType = z.infer<typeof IroTypeSchema>;

/**
 * Direction of an Impact (positive vs negative).
 * Only applies to type='impact'.
 */
export const ImpactDirectionSchema = z.enum(['positive', 'negative']);
export type ImpactDirection = z.infer<typeof ImpactDirectionSchema>;

/**
 * Time horizon classification per CSRD ESRS 2.
 */
export const TimeHorizonSchema = z.enum(['short', 'medium', 'long']);
export type TimeHorizon = z.infer<typeof TimeHorizonSchema>;

/**
 * Where in the value chain the IRO occurs.
 */
export const ValueChainScopeSchema = z.enum([
  'own_operations',
  'upstream',
  'downstream',
]);
export type ValueChainScope = z.infer<typeof ValueChainScopeSchema>;

/**
 * An IRO (Impact, Risk, or Opportunity) — the operational unit of CSRD materiality.
 *
 * Each material topic decomposes into multiple IROs. Each IRO is scored
 * along its own dimensions (severity/scope/likelihood for impacts and risks,
 * scale/financial effect for opportunities).
 */
export const IroSchema = z.object({
  id: z.string(),
  topicId: z.string(),
  type: IroTypeSchema,
  /** Short title shown in lists */
  title: z.string(),
  /** Full description */
  description: z.string(),
  /** Only relevant when type='impact' */
  direction: ImpactDirectionSchema.optional(),
  timeHorizon: TimeHorizonSchema,
  valueChainScope: ValueChainScopeSchema,
  /**
   * Severity / magnitude score (1-5).
   * For impacts: how big is the effect on environment/society.
   * For risks: how big is the financial loss exposure.
   * For opportunities: how big is the financial upside.
   */
  severityScore: MaterialityScoreSchema,
  /**
   * Scope / extent score (1-5).
   * How widespread is the IRO (geography, business lines, supply tiers).
   */
  scopeScore: MaterialityScoreSchema,
  /**
   * Likelihood (1-5).
   * For risks/opportunities only. For impacts, set to 5 (already happening) or
   * a probability score depending on methodology.
   */
  likelihoodScore: MaterialityScoreSchema,
  /** Datapoints this IRO drives — used to filter Repository */
  associatedDatapointIds: z.array(z.string()).default([]),
  /** Owner team or individual */
  owner: z.string().optional(),
  /** Whether this IRO has been validated by an external auditor */
  auditorValidated: z.boolean().default(false),
});

export type Iro = z.infer<typeof IroSchema>;

/**
 * A consulted stakeholder.
 */
export const StakeholderSchema = z.object({
  id: z.string(),
  /** Group name e.g. "Inversores institucionales", "Reguladores BCE" */
  name: z.string(),
  category: z.enum([
    'investors',
    'regulators',
    'employees',
    'customers',
    'suppliers',
    'communities',
    'ngos',
    'unions',
    'board',
    'auditors',
  ]),
  /** When the consultation took place */
  consultedAt: z.string().datetime(),
  /** Method of consultation */
  method: z.enum(['survey', 'workshop', 'interview', 'public_consultation']),
  /** Number of individuals represented */
  representativeCount: z.number().int().positive().optional(),
});

export type Stakeholder = z.infer<typeof StakeholderSchema>;

/**
 * Phase of the annual assessment workflow.
 */
export const AssessmentPhaseSchema = z.enum([
  'kickoff',
  'longlist',
  'screening',
  'consultation',
  'scoring',
  'iro_definition',
  'validation',
  'lock',
]);

export type AssessmentPhase = z.infer<typeof AssessmentPhaseSchema>;

/**
 * State of the current materiality assessment exercise.
 */
export const AssessmentSchema = z.object({
  id: z.string(),
  year: z.number().int(),
  currentPhase: AssessmentPhaseSchema,
  /** Phases that have been completed */
  completedPhases: z.array(AssessmentPhaseSchema),
  /** When the current phase started */
  phaseStartedAt: z.string().datetime(),
  /** Owner of the assessment (typically CSO) */
  owner: z.string(),
  /** Stakeholders that will be consulted */
  plannedStakeholderIds: z.array(z.string()),
  /** Stakeholders that have already responded */
  consultedStakeholderIds: z.array(z.string()),
  /** Whether the assessment has been validated by external auditor */
  auditorValidated: z.boolean(),
  auditorName: z.string().optional(),
});

export type Assessment = z.infer<typeof AssessmentSchema>;
