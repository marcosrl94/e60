import type { Meta, StoryObj } from '@storybook/react';
import { FrameworkChip } from './FrameworkChip';

const meta: Meta<typeof FrameworkChip> = {
  title: 'Components/FrameworkChip',
  component: FrameworkChip,
  parameters: {
    docs: {
      description: {
        component:
          'Inline chip used to indicate which reporting framework a datapoint is mapped to. Multiple chips can be stacked next to each other.',
      },
    },
  },
  args: {
    framework: 'ESRS E1-1',
  },
};
export default meta;

type Story = StoryObj<typeof FrameworkChip>;

export const Playground: Story = {};

export const FrameworkSet: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-y-2 text-[12px] text-ink-2">
      <span className="mr-2">Mapped to</span>
      <FrameworkChip framework="ESRS E1-1" />
      <FrameworkChip framework="GRI 305-1" />
      <FrameworkChip framework="ISSB S2" />
      <FrameworkChip framework="TCFD M-c" />
      <FrameworkChip framework="CDP C6.1" />
      <FrameworkChip framework="SASB FN-CB" />
    </div>
  ),
};
