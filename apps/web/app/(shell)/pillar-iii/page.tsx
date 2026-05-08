import { ComingSoon } from '@e60/ui';

export default function PillarIiiPage() {
  return (
    <ComingSoon
      tag="Next module · CRO commercial entry point"
      icon={
        <svg viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path
            d="M14 3l9 3.6v6.9c0 5.7-3.9 9.9-9 11.1-5.1-1.2-9-5.4-9-11.1V6.6z"
            strokeLinejoin="round"
          />
        </svg>
      }
      title="Pillar III & Regulatory"
      description="EBA Pillar III ESG (TBL 1-10), EU Taxonomy (GAR/BTAR), SFDR, EU CSRD compliance hub. Designed as the CRO entry point for the product: deterministic regulatory output, audit-ready, with hard deadlines and lock workflow."
      features={[
        {
          title: 'Pillar III ESG · 10 TBL templates',
          description: 'Auto-populated from datapoint repository with sign-off workflow and lock.',
          accent: 'red',
          icon: (
            <svg viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="2" y="2" width="9" height="9" rx="1" />
              <path d="M2 5h9M2 8h9M5 2v9" strokeLinecap="round" />
            </svg>
          ),
        },
        {
          title: 'EU Taxonomy · GAR/BTAR',
          description: 'NACE-level alignment with eligibility + alignment thresholds.',
          accent: 'blue',
          icon: (
            <svg viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="6.5" cy="6.5" r="5" />
              <path d="M6.5 1.5v10M1.5 6.5h10" strokeLinecap="round" />
            </svg>
          ),
        },
        {
          title: 'SFDR + Article 8/9 funds',
          description: 'PAI indicators and product-level SFDR disclosures.',
          accent: 'green',
          icon: (
            <svg viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 7l3 3 5-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ),
        },
      ]}
    />
  );
}