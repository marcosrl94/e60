import type { Meta, StoryObj } from '@storybook/react';
import { KpiCard } from './KpiCard';
import { Sparkline } from './Sparkline';

// Tiny inline icon sets used across the variants — kept here so the stories
// stay self-contained even when the upstream icon package shifts.
const LeafIcon = (
  <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6">
    <path d="M3 11c0-4 4-8 8-8 0 4-4 8-8 8z" strokeLinejoin="round" />
    <path d="M3 11l4-4" strokeLinecap="round" />
  </svg>
);

const BoltIcon = (
  <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6">
    <path d="M7 1l-4 7h4l-1 5 5-8H7l1-4z" strokeLinejoin="round" />
  </svg>
);

const DocIcon = (
  <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6">
    <path d="M3 1.5h6l3 3V12.5H3V1.5z" strokeLinejoin="round" />
    <path d="M9 1.5v3h3" strokeLinejoin="round" />
  </svg>
);

const SERIES = [10, 12, 9, 14, 11, 18, 16, 20];

const meta: Meta<typeof KpiCard> = {
  title: 'Components/KpiCard',
  component: KpiCard,
  parameters: {
    docs: {
      description: {
        component:
          'The headline metric component used across all module overviews. Colored icon square (top-left), uppercase label, big value with optional unit, optional sparkline / trend chip, optional attribution chip.',
      },
    },
  },
  args: {
    icon: LeafIcon,
    iconColor: 'green',
    label: 'Scope 1+2 emissions',
    value: '142.8',
    unit: 'tCO₂e',
  },
};
export default meta;

type Story = StoryObj<typeof KpiCard>;

export const Playground: Story = {
  render: (args) => (
    <div className="w-[260px]">
      <KpiCard {...args} />
    </div>
  ),
};

export const WithSparkline: Story = {
  args: {
    icon: BoltIcon,
    iconColor: 'orange',
    label: 'Energy intensity',
    value: '0.42',
    unit: 'kWh/€',
    sparkline: <Sparkline data={SERIES} color="orange" filled />,
  },
  render: (args) => (
    <div className="w-[260px]">
      <KpiCard {...args} />
    </div>
  ),
};

export const WithAttribution: Story = {
  args: {
    icon: DocIcon,
    iconColor: 'blue',
    label: 'Datapoints reporting',
    value: '847',
    unit: '/ 1,184',
    attribution: { label: 'Repository' },
    sparkline: <Sparkline data={SERIES} color="blue" filled />,
  },
  render: (args) => (
    <div className="w-[260px]">
      <KpiCard {...args} />
    </div>
  ),
};

export const Row: Story = {
  render: () => (
    <div className="grid grid-cols-4 gap-3">
      <KpiCard
        icon={LeafIcon}
        iconColor="green"
        label="Scope 1+2"
        value="142.8"
        unit="tCO₂e"
        sparkline={<Sparkline data={SERIES} color="green" filled />}
      />
      <KpiCard
        icon={BoltIcon}
        iconColor="orange"
        label="Energy intensity"
        value="0.42"
        unit="kWh/€"
        sparkline={<Sparkline data={SERIES} color="orange" filled />}
      />
      <KpiCard
        icon={DocIcon}
        iconColor="blue"
        label="Datapoints"
        value="847"
        unit="/ 1,184"
        attribution={{ label: 'Repository' }}
        sparkline={<Sparkline data={SERIES} color="blue" filled />}
      />
      <KpiCard
        icon={LeafIcon}
        iconColor="purple"
        label="Material topics"
        value="9"
        unit="/ 32"
        attribution={{ label: 'Materiality' }}
      />
    </div>
  ),
};
