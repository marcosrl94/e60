import type { Meta, StoryObj } from '@storybook/react';
import { DonutCard } from './DonutCard';
import { Panel } from './Panel';

const meta: Meta<typeof DonutCard> = {
  title: 'Components/DonutCard',
  component: DonutCard,
  parameters: {
    docs: {
      description: {
        component:
          'Bottom-row card for the Hub Overview. Two modes: with-donut (pass `center` + `segments`) or list-only (pass `legend` only).',
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof DonutCard>;

export const WithDonut: Story = {
  render: () => (
    <div className="w-[360px]">
      <Panel>
        <Panel.Head title="Scope mix" count="142.8 tCO₂e" />
        <DonutCard
          center={{ value: '142.8', label: 'TCO₂E' }}
          segments={[
            { color: '#1aa56a', label: 'Scope 1', value: '24.4', pct: 17 },
            { color: '#3b6cf3', label: 'Scope 2', value: '38.1', pct: 27 },
            { color: '#7a4cf0', label: 'Scope 3', value: '80.3', pct: 56 },
          ]}
        />
      </Panel>
    </div>
  ),
};

export const ListOnly: Story = {
  render: () => (
    <div className="w-[360px]">
      <Panel>
        <Panel.Head title="Top contributors" />
        <DonutCard
          legend={[
            { label: 'Purchased electricity', value: '38.1', emphasis: true },
            { label: 'Business travel', value: '22.0' },
            { label: 'Fuel · vehicle fleet', value: '18.4' },
            { label: 'Heating', value: '6.0' },
            { label: 'Waste', value: '2.1' },
          ]}
        />
      </Panel>
    </div>
  ),
};

export const FourSegments: Story = {
  render: () => (
    <div className="w-[360px]">
      <Panel>
        <Panel.Head title="Disclosure status" />
        <DonutCard
          center={{ value: '847', label: '/ 1184' }}
          segments={[
            { color: '#1aa56a', label: 'Live', value: '512', pct: 60 },
            { color: '#ff8c2d', label: 'Partial', value: '198', pct: 23 },
            { color: '#9b9ea7', label: 'Pending', value: '120', pct: 14 },
            { color: '#f04e3e', label: 'Blocked', value: '17', pct: 3 },
          ]}
        />
      </Panel>
    </div>
  ),
};
