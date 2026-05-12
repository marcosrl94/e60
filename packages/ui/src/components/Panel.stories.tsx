import type { Meta, StoryObj } from '@storybook/react';
import { Panel } from './Panel';
import { Tag } from './Tag';

const ChartIcon = (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
    <path d="M2 13h12" strokeLinecap="round" />
    <path d="M4 10v3M7 6v7M10 8v5M13 4v9" strokeLinecap="round" />
  </svg>
);

const meta: Meta<typeof Panel> = {
  title: 'Components/Panel',
  component: Panel,
  parameters: {
    docs: {
      description: {
        component:
          'Primary surface wrapper. Compose with `Panel.Head` (icon · title · optional count · actions) and `Panel.Body` (set `flush` to drop the default padding for tables).',
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof Panel>;

export const Basic: Story = {
  render: () => (
    <div className="w-[520px]">
      <Panel>
        <Panel.Head
          icon={ChartIcon}
          title="Disclosure activity"
          count="7 frameworks"
        />
        <Panel.Body>
          <div className="flex h-32 items-center justify-center font-mono text-[11px] text-ink-3">
            (chart goes here)
          </div>
        </Panel.Body>
      </Panel>
    </div>
  ),
};

export const WithActions: Story = {
  render: () => (
    <div className="w-[520px]">
      <Panel>
        <Panel.Head
          icon={ChartIcon}
          title="Recent activity"
          actions={
            <>
              <Tag variant="green">Live</Tag>
              <button
                type="button"
                className="rounded border border-line px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-ink-2 hover:bg-canvas hover:text-ink-1"
              >
                Export
              </button>
            </>
          }
        />
        <Panel.Body>
          <p className="text-[12px] leading-relaxed text-ink-3">
            Anything that crosses the audit threshold lands here as evidence
            for the auditor.
          </p>
        </Panel.Body>
      </Panel>
    </div>
  ),
};

export const Flush: Story = {
  render: () => (
    <div className="w-[520px]">
      <Panel>
        <Panel.Head title="Datapoints" count="1184 rows" />
        <Panel.Body flush>
          <table className="w-full text-[12px]">
            <thead className="bg-canvas text-ink-3">
              <tr>
                <th className="px-3 py-2 text-left font-mono text-[10px] uppercase tracking-wide">
                  Code
                </th>
                <th className="px-3 py-2 text-left font-mono text-[10px] uppercase tracking-wide">
                  Description
                </th>
                <th className="px-3 py-2 text-left font-mono text-[10px] uppercase tracking-wide">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                ['E1-1.1', 'Transition plan summary', 'live'],
                ['E1-4.2', 'Targets disclosure', 'partial'],
                ['E2-3.1', 'Pollution to water', 'pending'],
              ].map(([code, desc, status]) => (
                <tr key={code} className="border-t border-line-soft">
                  <td className="px-3 py-2 font-mono text-[11px]">{code}</td>
                  <td className="px-3 py-2 text-ink-1">{desc}</td>
                  <td className="px-3 py-2">
                    <Tag
                      variant={
                        status === 'live'
                          ? 'green'
                          : status === 'partial'
                            ? 'orange'
                            : 'gray'
                      }
                    >
                      {status}
                    </Tag>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel.Body>
      </Panel>
    </div>
  ),
};
