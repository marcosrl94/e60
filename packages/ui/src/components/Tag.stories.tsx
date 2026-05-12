import type { Meta, StoryObj } from '@storybook/react';
import { Tag } from './Tag';

const meta: Meta<typeof Tag> = {
  title: 'Components/Tag',
  component: Tag,
  parameters: {
    docs: {
      description: {
        component:
          'Small colored pill used for status, category, framework, etc. Six NFQ-palette variants + neutral gray.',
      },
    },
  },
  args: {
    children: 'Live',
    variant: 'green',
  },
};
export default meta;

type Story = StoryObj<typeof Tag>;

export const Playground: Story = {};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Tag variant="green">Live</Tag>
      <Tag variant="orange">Partial</Tag>
      <Tag variant="red">Error</Tag>
      <Tag variant="blue">Info</Tag>
      <Tag variant="purple">Materiality</Tag>
      <Tag variant="gray">Off</Tag>
    </div>
  ),
};

export const InContext: Story = {
  render: () => (
    <div className="rounded-lg border border-line bg-panel p-4 shadow-e60-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-[14px] font-semibold tracking-tight text-ink-1">
          Disclosure status
        </h3>
        <Tag variant="green">Published</Tag>
      </div>
      <p className="mt-1 font-mono text-[10px] tracking-wide text-ink-3">
        ESRS E1-1 · transition plan
      </p>
    </div>
  ),
};
