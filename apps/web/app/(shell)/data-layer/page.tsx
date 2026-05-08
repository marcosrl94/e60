import { ComingSoon } from '@e60/ui';

export default function DataLayerPage() {
  return (
    <ComingSoon
      tag="Backlog · data foundation"
      icon={
        <svg viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M14 4l11 5.5-11 5.5-11-5.5z" strokeLinejoin="round" />
          <path d="M3 17l11 5.5 11-5.5" />
        </svg>
      }
      title="Data Layer"
      description="Connectors to source systems (HR, ERP, banking core, ESG data providers), portfolio loading, geocoding, hazard datasets, and emission factor libraries. The plumbing that makes everything else possible."
      features={[
        {
          title: 'Connectors',
          description: 'SAP, Workday, Oracle, banking core, ESG providers (MSCI, Sustainalytics).',
          accent: 'blue',
          icon: (
            <svg viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="3.5" cy="3.5" r="1.5" />
              <circle cx="9.5" cy="9.5" r="1.5" />
              <path d="M4.5 4.5l4 4" strokeLinecap="round" />
            </svg>
          ),
        },
        {
          title: 'Geocoding & hazards',
          description: 'Address geocoding, hazard datasets (flood, wildfire, drought), Climate X integration.',
          accent: 'orange',
          icon: (
            <svg viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="6.5" cy="5" r="2.5" />
              <path
                d="M6.5 2c2 0 3.5 1.5 3.5 3.5 0 3-3.5 6-3.5 6S3 8.5 3 5.5C3 3.5 4.5 2 6.5 2z"
                strokeLinejoin="round"
              />
            </svg>
          ),
        },
        {
          title: 'Emission factor library',
          description: 'IEA, DEFRA, EPA factors with versioning and audit trail.',
          accent: 'green',
          icon: (
            <svg viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M2 3h9v7H2z" />
              <path d="M2 5.5h9" strokeLinecap="round" />
            </svg>
          ),
        },
      ]}
    />
  );
}