import type { Meta, StoryObj } from '@storybook/react';
import { ComingSoon } from './ComingSoon';

const PortfolioIcon = (
  <svg viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M14 4l11 5.5-11 5.5-11-5.5z" strokeLinejoin="round" />
    <path d="M3 17l11 5.5 11-5.5" />
  </svg>
);

const PlugIcon = (
  <svg viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="3.5" cy="3.5" r="1.5" />
    <circle cx="9.5" cy="9.5" r="1.5" />
    <path d="M4.5 4.5l4 4" strokeLinecap="round" />
  </svg>
);

const MapIcon = (
  <svg viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="6.5" cy="5" r="2.5" />
    <path
      d="M6.5 2c2 0 3.5 1.5 3.5 3.5 0 3-3.5 6-3.5 6S3 8.5 3 5.5C3 3.5 4.5 2 6.5 2z"
      strokeLinejoin="round"
    />
  </svg>
);

const TableIcon = (
  <svg viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M2 3h9v7H2z" />
    <path d="M2 5.5h9" strokeLinecap="round" />
  </svg>
);

const meta: Meta<typeof ComingSoon> = {
  title: 'Components/ComingSoon',
  component: ComingSoon,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Placeholder for module/sub-views that aren\'t built yet but still need to communicate roadmap with substance. Tag · large icon · title · description · up to six feature cards.',
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof ComingSoon>;

export const Minimal: Story = {
  render: () => (
    <ComingSoon
      title="Climate Lab"
      description="Physical and transition risk modelling at portfolio level — scenarios, sensitivity, heatmaps."
      tag="Backlog · climate science"
      icon={PortfolioIcon}
    />
  ),
};

export const WithFeatures: Story = {
  render: () => (
    <ComingSoon
      title="Data Layer"
      description="Connectors to source systems · portfolio loading · geocoding · hazard datasets · emission factor libraries."
      tag="Backlog · data foundation"
      icon={PortfolioIcon}
      features={[
        {
          title: 'Connectors',
          description:
            'SAP · Workday · Oracle · banking core · ESG providers (MSCI · Sustainalytics).',
          accent: 'blue',
          icon: PlugIcon,
        },
        {
          title: 'Geocoding & hazards',
          description:
            'Address geocoding · hazard datasets (flood · wildfire · drought) · Climate X.',
          accent: 'orange',
          icon: MapIcon,
        },
        {
          title: 'Emission factor library',
          description: 'IEA · DEFRA · EPA · MITECO with versioning and audit trail.',
          accent: 'green',
          icon: TableIcon,
        },
      ]}
    />
  ),
};
