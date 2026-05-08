import { Fragment } from 'react';

/**
 * HeroFlow
 *
 * Three step badges connected by arrows: datapoints → frameworks → disclosures.
 * Mirrors the section at the top of the Output Generators view in the mockup.
 */

interface Step {
  icon: React.ReactNode;
  value: string;
  label: string;
  tone: 'purple' | 'orange' | 'green';
}

const TONE_CLASSES: Record<Step['tone'], string> = {
  purple: 'bg-nfq-purpleBg text-nfq-purple',
  orange: 'bg-nfq-orangeBg text-nfq-orange',
  green: 'bg-nfq-greenBg text-nfq-green',
};

const STEPS: Step[] = [
  {
    tone: 'purple',
    icon: (
      <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M2 5h14v8H2z" strokeLinejoin="round" />
        <path d="M2 8h14M5 5v8" strokeLinecap="round" />
      </svg>
    ),
    value: '1,184',
    label: 'Datapoints captured',
  },
  {
    tone: 'orange',
    icon: (
      <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M3 2h12v14H3z" strokeLinejoin="round" />
        <path d="M6 6h6M6 9h6M6 12h4" strokeLinecap="round" />
      </svg>
    ),
    value: '8',
    label: 'Frameworks mapped',
  },
  {
    tone: 'green',
    icon: (
      <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M3 9l3 3 9-9" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    value: '47',
    label: 'Disclosures published 2025',
  },
];

const Arrow = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    className="h-6 w-6 text-ink-4"
  >
    <path
      d="M4 12h16M14 6l6 6-6 6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export function HeroFlow() {
  return (
    <div className="mb-[18px] flex items-center justify-around gap-3 rounded-lg border border-line bg-panel px-6 py-5 shadow-e60-sm">
      {STEPS.map((step, idx) => (
        <Fragment key={step.label}>
          <div className="flex flex-col items-center text-center">
            <div
              className={`mb-2 flex h-10 w-10 items-center justify-center rounded-md ${TONE_CLASSES[step.tone]}`}
            >
              {step.icon}
            </div>
            <div className="text-[20px] font-semibold tracking-tight text-ink-1">
              {step.value}
            </div>
            <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-3">
              {step.label}
            </div>
          </div>
          {idx < STEPS.length - 1 && <Arrow />}
        </Fragment>
      ))}
    </div>
  );
}
