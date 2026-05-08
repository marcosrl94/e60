import { ComingSoon } from '@e60/ui';

export default function ClimateLabPage() {
  return (
    <ComingSoon
      tag="Backlog · powered by Climate X"
      icon={
        <svg viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="14" cy="14" r="11" />
          <path d="M3 14h22M14 3c4 3 6 7 6 11s-2 8-6 11M14 3c-4 3-6 7-6 11s2 8 6 11" />
        </svg>
      }
      title="Climate & Nature Lab"
      description="Physical risk engine (powered by Climate X), climate stress testing for SREP, CBAM, abatement curves, scenario analysis, and Nature Risk (TNFD) screening."
      features={[
        {
          title: 'Physical Risk Engine',
          description: 'Geospatial hazard exposure for the banking book, RCP 4.5 / 8.5 scenarios.',
          accent: 'red',
          icon: (
            <svg viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M6.5 1.5L11 9H2z" strokeLinejoin="round" />
              <path d="M6.5 5v2M6.5 8v.1" strokeLinecap="round" />
            </svg>
          ),
        },
        {
          title: 'Climate Stress Test',
          description: 'SREP-ready stress test framework with regulator-aligned assumptions.',
          accent: 'orange',
          icon: (
            <svg viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M2 11l3-3 3 2 4-6" strokeLinecap="round" />
            </svg>
          ),
        },
        {
          title: 'Nature Risk · TNFD',
          description: 'LEAP framework, ENCORE assessment, deforestation pilot Q3 2026.',
          accent: 'green',
          icon: (
            <svg viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M6.5 1.5c1.7 1.7 2.5 3.3 2.5 5a2.5 2.5 0 11-5 0c0-1.7.8-3.3 2.5-5z" />
            </svg>
          ),
        },
      ]}
    />
  );
}