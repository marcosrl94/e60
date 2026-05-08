import type { ReactNode } from 'react';
import {
  BoardPreview,
  CdpPreview,
  CsrdPreview,
  DjsiPreview,
  PillarThreePreview,
  PrbPreview,
} from './previews';

export type DisclosureStatus = 'published' | 'submitted' | 'in_prep' | 'scheduled';

export interface DisclosureCardData {
  id: string;
  /** Short framework label shown above the title (e.g. "CSRD · ESRS"). */
  framework: string;
  /** Color used for the framework label and the preview gradient accent. */
  accent: 'green' | 'red' | 'orange' | 'blue' | 'purple' | 'dark';
  title: string;
  subtitle: string;
  status: DisclosureStatus;
  meta: string;
  date: string;
  /** Inline preview SVG. */
  preview: () => ReactNode;
  /** CSS gradient string for the preview background. */
  gradient: string;
}

export const DISCLOSURES: DisclosureCardData[] = [
  {
    id: 'csrd',
    framework: 'CSRD · ESRS',
    accent: 'green',
    title: 'Estado de información sostenibilidad 2025',
    subtitle: 'Reporte regulatorio CSRD · 1,144 datapoints · auditoría externa.',
    status: 'published',
    meta: 'Auditor · KPMG',
    date: '31 mar 2026',
    preview: CsrdPreview,
    gradient: 'linear-gradient(135deg, #1a3a32 0%, #2d4540 100%)',
  },
  {
    id: 'cdp',
    framework: 'CDP CLIMATE 2025',
    accent: 'green',
    title: 'CDP Climate Change · response',
    subtitle: '412 questions · 91% prefilled from datapoint repository.',
    status: 'submitted',
    meta: 'Score: A− (improved)',
    date: '06 may 2026',
    preview: CdpPreview,
    gradient: 'linear-gradient(135deg, #1aa56a 0%, #4cc28a 100%)',
  },
  {
    id: 'pillar3',
    framework: 'EBA · PILLAR III ESG',
    accent: 'red',
    title: 'Pillar III ESG · Q4 2025',
    subtitle: '10 templates · 9 ready · TBL 5 en revisión metodológica.',
    status: 'in_prep',
    meta: 'CRO sign-off pending',
    date: '28 ene 2026',
    preview: PillarThreePreview,
    gradient: 'linear-gradient(135deg, #f04e3e 0%, #ff8c2d 100%)',
  },
  {
    id: 'djsi',
    framework: 'S&P · DJSI / CSA',
    accent: 'blue',
    title: 'DJSI Corporate Sustainability Assessment',
    subtitle: '160 datapoints · 14/22 sections completed · innovation pendiente.',
    status: 'in_prep',
    meta: 'Industry: Banks',
    date: '15 jun 2026',
    preview: DjsiPreview,
    gradient: 'linear-gradient(135deg, #3b6cf3 0%, #6b8ef5 100%)',
  },
  {
    id: 'prb',
    framework: 'UNEP-FI · PRB',
    accent: 'purple',
    title: 'Principles Responsible Banking · annual',
    subtitle:
      'Reporting template + assurance · 22 indicators incluyendo footprint propio.',
    status: 'published',
    meta: 'v2.1 · assurance signed',
    date: '08 abr 2026',
    preview: PrbPreview,
    gradient: 'linear-gradient(135deg, #7a4cf0 0%, #9d77f5 100%)',
  },
  {
    id: 'board',
    framework: 'INTERNAL · BOARD',
    accent: 'dark',
    title: 'Board ESG Dashboard · Q1 2026',
    subtitle: 'Executive PDF · 38 KPIs seleccionados para el Consejo.',
    status: 'scheduled',
    meta: 'Audience: BoD',
    date: '22 abr 2026',
    preview: BoardPreview,
    gradient: 'linear-gradient(135deg, #0b0d12 0%, #424653 100%)',
  },
];
