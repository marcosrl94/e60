'use client';

import type { ReactNode } from 'react';
import { Tag, type TagVariant } from '@e60/ui';
import type { DisclosureCardData, DisclosureStatus } from './data';
import type { DisclosureMetrics } from './metrics';

interface DisclosureCardProps {
  data: DisclosureCardData;
  /** Server-computed live metrics. Undefined fallbacks to no overlay. */
  metrics?: DisclosureMetrics;
  /** Click handler — when provided, the card becomes a button (drawer trigger). */
  onOpen?: (id: string) => void;
}

const STATUS_LABEL: Record<DisclosureStatus, string> = {
  published: 'Published',
  submitted: 'Submitted',
  in_prep: 'In prep',
  scheduled: 'Scheduled',
};

const STATUS_VARIANT: Record<DisclosureStatus, TagVariant> = {
  published: 'green',
  submitted: 'green',
  in_prep: 'orange',
  scheduled: 'gray',
};

const ACCENT_TEXT: Record<DisclosureCardData['accent'], string> = {
  green: 'text-nfq-green',
  red: 'text-nfq-red',
  orange: 'text-nfq-orange',
  blue: 'text-nfq-blue',
  purple: 'text-nfq-purple',
  dark: 'text-ink-1',
};

/**
 * DisclosureCard
 *
 * When `onOpen` is provided the card becomes a button that triggers the
 * disclosure drawer. Without it, the card stays static (still hover-styled
 * for visual life).
 */
function deadlineLabel(days: number): { text: string; tone: 'red' | 'orange' | 'green' | 'gray' } {
  if (days < 0) {
    return { text: `${Math.abs(days)}d overdue`, tone: 'red' };
  }
  if (days === 0) return { text: 'Due today', tone: 'red' };
  if (days <= 7) return { text: `${days}d left`, tone: 'red' };
  if (days <= 30) return { text: `${days}d left`, tone: 'orange' };
  if (days <= 90) return { text: `${days}d left`, tone: 'green' };
  return { text: `${days}d left`, tone: 'gray' };
}

const DEADLINE_CHIP: Record<'red' | 'orange' | 'green' | 'gray', string> = {
  red: 'bg-nfq-redBg text-nfq-red',
  orange: 'bg-nfq-orangeBg text-nfq-orange',
  green: 'bg-nfq-greenBg text-nfq-green',
  gray: 'bg-canvas text-ink-3',
};

export function DisclosureCard({ data, metrics, onOpen }: DisclosureCardProps) {
  const Preview = data.preview;
  const interactive = !!onOpen;
  const dl = metrics ? deadlineLabel(metrics.daysToDeadline) : null;
  return (
    <article
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      onClick={interactive ? () => onOpen(data.id) : undefined}
      onKeyDown={
        interactive
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onOpen(data.id);
              }
            }
          : undefined
      }
      className={
        'group flex flex-col overflow-hidden rounded-lg border border-line bg-panel shadow-e60-sm transition-all hover:-translate-y-[1px] hover:border-ink-5 hover:shadow-e60-md ' +
        (interactive
          ? 'cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ink-1'
          : '')
      }
      data-disclosure={data.id}
    >
      <PreviewFrame gradient={data.gradient} status={data.status}>
        <Preview />
      </PreviewFrame>
      <div className="flex flex-col gap-1.5 px-[18px] py-[14px]">
        <div
          className={`font-mono text-[9.5px] font-semibold uppercase tracking-[0.14em] ${ACCENT_TEXT[data.accent]}`}
        >
          {data.framework}
        </div>
        <h3 className="text-[14px] font-semibold leading-snug tracking-tight text-ink-1">
          {data.title}
        </h3>
        <p className="line-clamp-2 text-[12px] leading-relaxed text-ink-3">
          {data.subtitle}
        </p>

        {metrics && metrics.total > 0 && (
          <div className="mt-2 space-y-1">
            <div className="flex items-baseline justify-between gap-2">
              <span className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink-3">
                Datapoint coverage
              </span>
              <span className="font-mono text-[10.5px] tabular-nums text-ink-1">
                <strong>{metrics.live}</strong>
                <span className="text-ink-3">/{metrics.total}</span>
                <span className="ml-1 text-ink-3">· {metrics.coveragePct}%</span>
              </span>
            </div>
            <div className="h-1 w-full overflow-hidden rounded-full bg-canvas-edge">
              <div
                className="h-full rounded-full bg-nfq-green"
                style={{ width: `${metrics.coveragePct}%` }}
              />
            </div>
            {metrics.blocked > 0 && (
              <div className="flex items-center gap-1 pt-0.5 font-mono text-[10px] text-nfq-red">
                <span aria-hidden className="inline-block h-1.5 w-1.5 rounded-full bg-nfq-red" />
                {metrics.blocked} blocking
              </div>
            )}
          </div>
        )}

        <div className="mt-2 flex items-center justify-between gap-3 border-t border-line-soft pt-2.5 font-mono text-[10px] tracking-wide text-ink-3">
          <span className="line-clamp-1">{data.meta}</span>
          <span className="flex items-center gap-1.5">
            {dl && (
              <span
                className={
                  'rounded-[3px] px-1.5 py-px font-mono text-[9.5px] font-semibold uppercase tracking-wider ' +
                  DEADLINE_CHIP[dl.tone]
                }
              >
                {dl.text}
              </span>
            )}
            <span className="line-clamp-1 text-ink-1">{data.date}</span>
          </span>
        </div>
      </div>
    </article>
  );
}

interface PreviewFrameProps {
  gradient: string;
  status: DisclosureStatus;
  children: ReactNode;
}

function PreviewFrame({ gradient, status, children }: PreviewFrameProps) {
  const tagVariant = STATUS_VARIANT[status];
  return (
    <div
      className="relative flex h-[180px] items-center justify-center"
      style={{ background: gradient }}
    >
      <div className="absolute right-3 top-3">
        <Tag
          variant={tagVariant}
          className="!bg-white/15 !text-white backdrop-blur-sm"
        >
          {STATUS_LABEL[status]}
        </Tag>
      </div>
      {children}
    </div>
  );
}
