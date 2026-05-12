import type { Meta, StoryObj } from '@storybook/react';
import { ActivityColumn } from './ActivityColumn';

const PlusIcon = (
  <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6">
    <path d="M7 2v10M2 7h10" strokeLinecap="round" />
  </svg>
);

const CheckIcon = (
  <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M3 7.5l2.5 2.5L11 4.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const XIcon = (
  <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6">
    <path d="M3 3l8 8M11 3l-8 8" strokeLinecap="round" />
  </svg>
);

const WarnIcon = (
  <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6">
    <path d="M7 1l6 11H1L7 1z" strokeLinejoin="round" />
    <path d="M7 5.5v3" strokeLinecap="round" />
    <circle cx="7" cy="10" r="0.4" fill="currentColor" />
  </svg>
);

const meta: Meta<typeof ActivityColumn> = {
  title: 'Components/ActivityColumn',
  component: ActivityColumn,
  parameters: {
    docs: {
      description: {
        component:
          'One column of the "Recent Disclosure Activity" 3-column panel. Mono-typography head + a list of items with title, sub, value, date.',
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof ActivityColumn>;

const SAMPLE_ITEMS = [
  {
    title: <span>ESRS E1-1 · Transition plan</span>,
    sub: 'Carbon Intelligence',
    value: 'live',
    date: '12m ago',
  },
  {
    title: <span>ESRS E2-3 · Pollution to water</span>,
    sub: 'Repository',
    value: 'partial',
    date: '2h ago',
  },
  {
    title: <span>GRI 305-3 · Other indirect emissions</span>,
    sub: 'Materiality',
    value: 'pending',
    date: '1d ago',
  },
];

export const Created: Story = {
  render: () => (
    <div className="w-[360px]">
      <ActivityColumn
        tone="created"
        icon={PlusIcon}
        title="Created"
        count={SAMPLE_ITEMS.length}
        items={SAMPLE_ITEMS}
      />
    </div>
  ),
};

export const ThreeColumn: Story = {
  render: () => (
    <div className="grid grid-cols-3 gap-3">
      <ActivityColumn
        tone="created"
        icon={PlusIcon}
        title="Created"
        count={3}
        items={SAMPLE_ITEMS.slice(0, 3)}
      />
      <ActivityColumn
        tone="won"
        icon={CheckIcon}
        title="Published"
        count={2}
        items={[
          {
            title: <strong>ESRS S1-12 · Pay gap</strong>,
            sub: 'Workday',
            value: 'live',
            date: '3h ago',
          },
          {
            title: <span>ESRS G1-1 · Business conduct</span>,
            sub: 'Repository',
            value: 'live',
            date: '8h ago',
          },
        ]}
      />
      <ActivityColumn
        tone="warn"
        icon={WarnIcon}
        title="Needs review"
        count={1}
        items={[
          {
            title: <span>ESRS E5-4 · Material flows</span>,
            sub: 'SAP S/4HANA',
            value: 'partial',
            date: '1d ago',
          },
        ]}
      />
    </div>
  ),
};

export const LostTone: Story = {
  render: () => (
    <div className="w-[360px]">
      <ActivityColumn
        tone="lost"
        icon={XIcon}
        title="Rejected"
        count={1}
        items={[
          {
            title: <span>ESRS E4-2 · Biodiversity targets</span>,
            sub: 'Materiality',
            value: 'blocked',
            date: '4h ago',
          },
        ]}
      />
    </div>
  ),
};
