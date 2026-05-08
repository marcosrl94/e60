import Link from 'next/link';
import { Panel, Tag } from '@e60/ui';

/**
 * Sustainable Finance · module landing.
 *
 * Mini-hub for sustainable-finance products. Today only CBAM has a real
 * sub-route (placeholder embed shell awaiting the external repo URL); the
 * other three are reserved.
 */

interface SubModule {
  href?: string;
  label: string;
  description: string;
  status: 'live' | 'placeholder' | 'reserved';
  icon: React.ReactNode;
  accent: 'blue' | 'green' | 'orange' | 'purple';
}

const MODULES: SubModule[] = [
  {
    href: '/sustainable-finance/cbam',
    label: 'CBAM',
    description:
      'Carbon Border Adjustment Mechanism · embedded emissions in covered imports + CBAM certificate exposure.',
    status: 'placeholder',
    accent: 'blue',
    icon: (
      <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M2 11h14M2 7h14M2 3h14" />
        <path d="M5 14l2-2 2 2 2-2 2 2" />
      </svg>
    ),
  },
  {
    label: 'Green Asset Ratio',
    description:
      'GAR % across the banking book · Taxonomy alignment per environmental objective. Surfaces in Pillar III TBLs 7-8.',
    status: 'reserved',
    accent: 'green',
    icon: (
      <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="9" cy="9" r="6" />
        <path d="M9 5v4l3 2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: 'EU Taxonomy alignment',
    description:
      'Counterparty-level alignment scoring across the 6 environmental objectives + DNSH screening.',
    status: 'reserved',
    accent: 'orange',
    icon: (
      <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M3 3h12v12H3z" />
        <path d="M3 9h12M9 3v12" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: 'EU Green Bonds',
    description:
      'Issuance + holdings of EuGB-aligned instruments. KPIs feed Pillar III TBL 10.',
    status: 'reserved',
    accent: 'purple',
    icon: (
      <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M3 5h12v8H3z" />
        <path d="M3 7h12M9 5v8" strokeLinecap="round" />
      </svg>
    ),
  },
];

const ACCENT_BG: Record<SubModule['accent'], string> = {
  blue: 'bg-nfq-blueBg text-nfq-blue',
  green: 'bg-nfq-greenBg text-nfq-green',
  orange: 'bg-nfq-orangeBg text-nfq-orange',
  purple: 'bg-nfq-purpleBg text-nfq-purple',
};

const STATUS_LABEL: Record<SubModule['status'], string> = {
  live: 'Live',
  placeholder: 'Placeholder',
  reserved: 'Reserved',
};

const STATUS_VARIANT: Record<SubModule['status'], 'green' | 'orange' | 'gray'> = {
  live: 'green',
  placeholder: 'orange',
  reserved: 'gray',
};

export function SustainableFinanceView() {
  return (
    <>
      <div className="mb-5 flex items-start justify-between gap-6">
        <div>
          <h1 className="mb-1 text-[24px] font-semibold leading-tight tracking-tight text-ink-1">
            Sustainable Finance
          </h1>
          <div className="font-mono text-[11.5px] tracking-wide text-ink-3">
            CBAM · GAR · Taxonomy · Green Bonds ·{' '}
            <strong className="font-medium text-ink-1">EU regulatory products</strong>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Tag variant="orange">Module in progress</Tag>
          <span className="font-mono text-[10px] tracking-wide text-ink-2">
            CBAM live · 3 reserved
          </span>
        </div>
      </div>

      <Panel>
        <Panel.Head
          title="Products"
          count={`${MODULES.length} sub-modules`}
          icon={
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
              <circle cx="4" cy="4" r="2" />
              <circle cx="12" cy="8" r="2" />
              <circle cx="4" cy="12" r="2" />
              <path d="M5.6 5l5 2.6M5.6 11l5-2.6" />
            </svg>
          }
        />
        <Panel.Body>
          <div className="grid grid-cols-2 gap-3 standard:grid-cols-1">
            {MODULES.map((m) => {
              const Wrapper: React.ElementType = m.href ? Link : 'div';
              return (
                <Wrapper
                  key={m.label}
                  {...(m.href ? { href: m.href } : {})}
                  className={
                    'flex flex-col gap-2 rounded-lg border border-line bg-panel p-4 shadow-e60-sm ' +
                    (m.href
                      ? 'cursor-pointer transition-all hover:-translate-y-[1px] hover:border-ink-5 hover:shadow-e60-md'
                      : 'opacity-80')
                  }
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={
                          'flex h-8 w-8 items-center justify-center rounded-md ' +
                          ACCENT_BG[m.accent]
                        }
                      >
                        <span className="h-4 w-4">{m.icon}</span>
                      </span>
                      <div className="text-[14px] font-semibold tracking-tight text-ink-1">
                        {m.label}
                      </div>
                    </div>
                    <Tag variant={STATUS_VARIANT[m.status]}>
                      {STATUS_LABEL[m.status]}
                    </Tag>
                  </div>
                  <p className="text-[12px] leading-relaxed text-ink-3">{m.description}</p>
                </Wrapper>
              );
            })}
          </div>
        </Panel.Body>
      </Panel>
    </>
  );
}
