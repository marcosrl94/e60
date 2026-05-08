import { ComingSoon } from '@e60/ui';

export default function SustainableFinancePage() {
  return (
    <ComingSoon
      tag="Backlog · originación ESG"
      icon={
        <svg viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="6" cy="6" r="3" />
          <circle cx="22" cy="14" r="3" />
          <circle cx="6" cy="22" r="3" />
          <path d="M9 7l10 5M9 21l10-5" />
        </svg>
      }
      title="Sustainable Finance"
      description="Green/social/sustainability-linked loan origination workflow, ESG pricing engine, KPI tracking for SLLs, and pipeline reporting for the originación team."
      features={[
        {
          title: 'ESG-linked origination',
          description: 'Green/social/SLL loan workflow with KPI definition and validation.',
          accent: 'green',
          icon: (
            <svg viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M2 9l3-3 2 2 5-5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ),
        },
        {
          title: 'ESG pricing',
          description: 'Margin step-up/step-down based on KPI achievement, automated tracking.',
          accent: 'blue',
          icon: (
            <svg viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M6.5 2v9M3 5l3.5-3 3.5 3M3 8l3.5 3 3.5-3" strokeLinecap="round" />
            </svg>
          ),
        },
        {
          title: 'Pipeline & KPIs',
          description: 'Real-time pipeline view, KPI achievement tracking, reporting to NZBA.',
          accent: 'orange',
          icon: (
            <svg viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M2 3h9v7H2z" />
              <path d="M2 6.5h9M5 3v7" strokeLinecap="round" />
            </svg>
          ),
        },
      ]}
    />
  );
}