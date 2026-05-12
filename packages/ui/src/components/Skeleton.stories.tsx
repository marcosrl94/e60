import type { Meta, StoryObj } from '@storybook/react';
import { Skeleton } from './Skeleton';

const meta: Meta<typeof Skeleton> = {
  title: 'Components/Skeleton',
  component: Skeleton,
  parameters: {
    docs: {
      description: {
        component:
          'Animated placeholder block for loading states. Tailwind `animate-pulse` over the canvas-edge tint to stay on-brand.',
      },
    },
  },
  args: {
    width: 200,
    height: 16,
    rounded: 'sm',
  },
};
export default meta;

type Story = StoryObj<typeof Skeleton>;

export const Playground: Story = {};

export const Shapes: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <Skeleton width={32} height={32} rounded="full" />
        <Skeleton width={32} height={32} rounded="md" />
        <Skeleton width={32} height={32} rounded="sm" />
      </div>
      <Skeleton width={120} height={10} />
      <Skeleton width={220} height={10} />
      <Skeleton width={180} height={10} />
    </div>
  ),
};

export const FakeKpiCard: Story = {
  render: () => (
    <div className="w-[220px] rounded-lg border border-line bg-panel p-3.5 shadow-e60-sm">
      <Skeleton width={28} height={28} rounded="sm" />
      <div className="mt-3">
        <Skeleton width={80} height={9} />
      </div>
      <div className="mt-2 flex items-end justify-between gap-2">
        <Skeleton width={70} height={22} />
        <Skeleton width={50} height={20} />
      </div>
    </div>
  ),
};
