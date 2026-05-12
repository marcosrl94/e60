import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Drawer } from './Drawer';
import { Tag } from './Tag';

const meta: Meta<typeof Drawer> = {
  title: 'Components/Drawer',
  component: Drawer,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Right-side slide-in panel for deep-editing a single object (disclosure, datapoint, IRO) without leaving the page. 720 px by default · Esc/backdrop closes · body scroll locks while open. `Drawer.Tabs` gives a sticky tab nav inside the body.',
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof Drawer>;

function OpenButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-md bg-ink-1 px-3 py-1.5 text-[12px] font-medium text-white hover:bg-ink-2"
    >
      {label}
    </button>
  );
}

export const Basic: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <div className="p-8">
        <OpenButton onClick={() => setOpen(true)} label="Open drawer" />
        <Drawer
          open={open}
          onClose={() => setOpen(false)}
          eyebrow="ESRS E1-1"
          title="Transition plan summary"
          meta={<Tag variant="green">Live</Tag>}
        >
          <div className="p-5 text-[13px] leading-relaxed text-ink-2">
            <p>
              The transition plan describes how the undertaking is moving from
              its current business model to one consistent with limiting global
              warming to 1.5 °C.
            </p>
            <p className="mt-3">
              Press <kbd className="rounded border border-line bg-canvas px-1 py-px font-mono text-[11px]">Esc</kbd>{' '}
              or click outside to close.
            </p>
          </div>
        </Drawer>
      </div>
    );
  },
};

export const WithTabs: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <div className="p-8">
        <OpenButton onClick={() => setOpen(true)} label="Open drawer · tabs" />
        <Drawer
          open={open}
          onClose={() => setOpen(false)}
          eyebrow="Climate change"
          title="ESRS E1 · materiality dossier"
          meta={
            <>
              <Tag variant="purple">Material</Tag>
              <Tag variant="orange">Draft</Tag>
            </>
          }
        >
          <Drawer.Tabs
            sections={[
              {
                id: 'datapoints',
                label: 'Datapoints',
                count: 42,
                content: (
                  <div className="p-5 text-[13px] text-ink-2">
                    42 datapoints contribute to this disclosure.
                  </div>
                ),
              },
              {
                id: 'narrative',
                label: 'Narrative',
                content: (
                  <div className="p-5 text-[13px] text-ink-2">
                    Free-form narrative draft. Markdown allowed.
                  </div>
                ),
              },
              {
                id: 'mapping',
                label: 'Mapping',
                count: '7',
                content: (
                  <div className="p-5 text-[13px] text-ink-2">
                    Cross-framework alignment: ISSB S2 · TCFD · GRI 305.
                  </div>
                ),
              },
              {
                id: 'history',
                label: 'History',
                content: (
                  <div className="p-5 text-[13px] text-ink-2">
                    Last 30 days of writes, exposed by the Trust Center.
                  </div>
                ),
              },
            ]}
          />
        </Drawer>
      </div>
    );
  },
};
