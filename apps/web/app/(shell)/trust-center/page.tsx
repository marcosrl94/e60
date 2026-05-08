import { ComingSoon } from '@e60/ui';

export default function TrustCenterPage() {
  return (
    <ComingSoon
      tag="Backlog · audit & governance"
      icon={
        <svg viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="6" y="12" width="16" height="11" rx="2" />
          <path d="M9 12V9a5 5 0 0110 0v3" />
        </svg>
      }
      title="Trust Center"
      description="Audit trail across the platform, role-based access control, workflow management (sign-offs, locks, approvals), and observability for the auditor (KPMG/PwC/Deloitte). The piece that turns E6.0 into a system the regulator trusts."
      features={[
        {
          title: 'Immutable audit trail',
          description: 'Every change tracked with user, timestamp, and reason; cryptographically chained.',
          accent: 'red',
          icon: (
            <svg viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="2" y="2" width="9" height="9" rx="1" />
              <path d="M2 5h9M2 8h9" strokeLinecap="round" />
            </svg>
          ),
        },
        {
          title: 'Roles & RBAC',
          description: 'Granular permissions per module, sub-view, datapoint, and disclosure.',
          accent: 'blue',
          icon: (
            <svg viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="6.5" cy="5" r="2" />
              <path d="M2 11c0-2 2-3.5 4.5-3.5S11 9 11 11" strokeLinecap="round" />
            </svg>
          ),
        },
        {
          title: 'Workflow & sign-offs',
          description: 'Multi-stage approvals (CSO → CRO → CFO → Board) with delegation rules.',
          accent: 'green',
          icon: (
            <svg viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M2 7l3 3 5-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ),
        },
      ]}
    />
  );
}