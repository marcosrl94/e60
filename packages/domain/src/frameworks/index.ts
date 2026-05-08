/**
 * Reporting frameworks supported by E6.0
 *
 * Each framework has a code (used for chips/labels), full name, and
 * an indicator of whether it's regulatory (mandatory) or voluntary.
 */

import { z } from 'zod';

export const FrameworkCodeSchema = z.enum([
  // Regulatory
  'CSRD',         // EU Corporate Sustainability Reporting Directive (ESRS)
  'EBA_PILLAR3',  // EBA Pillar III ESG (TBL 1-10)
  'CSDDD',        // Corporate Sustainability Due Diligence Directive
  'EU_TAXONOMY',  // EU Taxonomy (GAR/BTAR)
  'SFDR',         // Sustainable Finance Disclosure Regulation
  // Voluntary / standards
  'GRI',          // Global Reporting Initiative
  'TCFD',         // Task Force on Climate-related Financial Disclosures
  'TNFD',         // Task Force on Nature-related Financial Disclosures
  'CDP',          // CDP (Climate, Water, Forests)
  'SASB',         // Sustainability Accounting Standards Board
  'ISSB',         // International Sustainability Standards Board
  'SBTI',         // Science Based Targets initiative
  'PCAF',         // Partnership for Carbon Accounting Financials
  'NZBA',         // Net Zero Banking Alliance
  'UNEP_FI_PRB',  // UNEP-FI Principles for Responsible Banking
  // Ratings
  'DJSI',         // Dow Jones Sustainability Index / S&P CSA
  'MSCI_ESG',     // MSCI ESG Ratings
  'SUSTAINALYTICS',
]);

export type FrameworkCode = z.infer<typeof FrameworkCodeSchema>;

export const FrameworkSchema = z.object({
  code: FrameworkCodeSchema,
  name: z.string(),
  category: z.enum(['regulatory', 'voluntary', 'rating']),
  scope: z.array(z.enum(['climate', 'nature', 'social', 'governance', 'financial'])),
  description: z.string().optional(),
});

export type Framework = z.infer<typeof FrameworkSchema>;

/**
 * Reference catalog of frameworks. The displayName is what shows up in chips.
 */
export const FRAMEWORK_CATALOG: Record<FrameworkCode, Framework> = {
  CSRD: {
    code: 'CSRD',
    name: 'EU Corporate Sustainability Reporting Directive',
    category: 'regulatory',
    scope: ['climate', 'nature', 'social', 'governance'],
  },
  EBA_PILLAR3: {
    code: 'EBA_PILLAR3',
    name: 'EBA Pillar III ESG',
    category: 'regulatory',
    scope: ['climate', 'financial'],
  },
  CSDDD: {
    code: 'CSDDD',
    name: 'EU Corporate Sustainability Due Diligence Directive',
    category: 'regulatory',
    scope: ['social', 'governance'],
  },
  EU_TAXONOMY: {
    code: 'EU_TAXONOMY',
    name: 'EU Taxonomy Regulation',
    category: 'regulatory',
    scope: ['climate', 'nature', 'financial'],
  },
  SFDR: {
    code: 'SFDR',
    name: 'Sustainable Finance Disclosure Regulation',
    category: 'regulatory',
    scope: ['climate', 'social', 'financial'],
  },
  GRI: {
    code: 'GRI',
    name: 'Global Reporting Initiative Standards',
    category: 'voluntary',
    scope: ['climate', 'nature', 'social', 'governance'],
  },
  TCFD: {
    code: 'TCFD',
    name: 'Task Force on Climate-related Financial Disclosures',
    category: 'voluntary',
    scope: ['climate', 'financial'],
  },
  TNFD: {
    code: 'TNFD',
    name: 'Task Force on Nature-related Financial Disclosures',
    category: 'voluntary',
    scope: ['nature', 'financial'],
  },
  CDP: {
    code: 'CDP',
    name: 'CDP (formerly Carbon Disclosure Project)',
    category: 'voluntary',
    scope: ['climate', 'nature'],
  },
  SASB: {
    code: 'SASB',
    name: 'Sustainability Accounting Standards Board',
    category: 'voluntary',
    scope: ['climate', 'nature', 'social', 'governance', 'financial'],
  },
  ISSB: {
    code: 'ISSB',
    name: 'International Sustainability Standards Board',
    category: 'voluntary',
    scope: ['climate', 'financial'],
  },
  SBTI: {
    code: 'SBTI',
    name: 'Science Based Targets initiative',
    category: 'voluntary',
    scope: ['climate'],
  },
  PCAF: {
    code: 'PCAF',
    name: 'Partnership for Carbon Accounting Financials',
    category: 'voluntary',
    scope: ['climate', 'financial'],
  },
  NZBA: {
    code: 'NZBA',
    name: 'Net Zero Banking Alliance',
    category: 'voluntary',
    scope: ['climate', 'financial'],
  },
  UNEP_FI_PRB: {
    code: 'UNEP_FI_PRB',
    name: 'UNEP-FI Principles for Responsible Banking',
    category: 'voluntary',
    scope: ['climate', 'nature', 'social', 'governance'],
  },
  DJSI: {
    code: 'DJSI',
    name: 'S&P Corporate Sustainability Assessment / DJSI',
    category: 'rating',
    scope: ['climate', 'social', 'governance'],
  },
  MSCI_ESG: {
    code: 'MSCI_ESG',
    name: 'MSCI ESG Ratings',
    category: 'rating',
    scope: ['climate', 'social', 'governance'],
  },
  SUSTAINALYTICS: {
    code: 'SUSTAINALYTICS',
    name: 'Morningstar Sustainalytics',
    category: 'rating',
    scope: ['climate', 'social', 'governance'],
  },
};
