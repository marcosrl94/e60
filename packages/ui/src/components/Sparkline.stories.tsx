import type { Meta, StoryObj } from '@storybook/react';
import { Sparkline, type SparklineColor } from './Sparkline';

const SERIES_UP = [12, 14, 11, 15, 18, 17, 22, 24, 21, 28];
const SERIES_DOWN = [42, 38, 41, 35, 30, 32, 28, 24, 22, 18];
const SERIES_VOLATILE = [10, 14, 8, 16, 12, 20, 9, 18, 11, 22];

const meta: Meta<typeof Sparkline> = {
  title: 'Components/Sparkline',
  component: Sparkline,
  parameters: {
    docs: {
      description: {
        component:
          'Tiny inline chart used inside KpiCards and lists. Pure SVG · no library · auto-scaled. For axes, tooltips, multi-series use Recharts.',
      },
    },
  },
  args: {
    data: SERIES_UP,
    color: 'blue',
    filled: false,
    width: 60,
    height: 22,
  },
};
export default meta;

type Story = StoryObj<typeof Sparkline>;

export const Playground: Story = {};

export const AllColors: Story = {
  render: () => {
    const colors: SparklineColor[] = ['red', 'orange', 'blue', 'purple', 'green', 'dark'];
    return (
      <div className="flex flex-col gap-3">
        {colors.map((c) => (
          <div key={c} className="flex items-center gap-3">
            <span className="w-14 font-mono text-[10px] uppercase tracking-wide text-ink-3">
              {c}
            </span>
            <Sparkline data={SERIES_UP} color={c} />
            <Sparkline data={SERIES_UP} color={c} filled />
          </div>
        ))}
      </div>
    );
  },
};

export const TrendShapes: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <span className="w-20 font-mono text-[10px] uppercase tracking-wide text-ink-3">
          Up
        </span>
        <Sparkline data={SERIES_UP} color="green" filled />
      </div>
      <div className="flex items-center gap-3">
        <span className="w-20 font-mono text-[10px] uppercase tracking-wide text-ink-3">
          Down
        </span>
        <Sparkline data={SERIES_DOWN} color="red" filled />
      </div>
      <div className="flex items-center gap-3">
        <span className="w-20 font-mono text-[10px] uppercase tracking-wide text-ink-3">
          Volatile
        </span>
        <Sparkline data={SERIES_VOLATILE} color="orange" filled />
      </div>
    </div>
  ),
};

export const Larger: Story = {
  args: {
    width: 200,
    height: 60,
    filled: true,
    color: 'purple',
  },
};
