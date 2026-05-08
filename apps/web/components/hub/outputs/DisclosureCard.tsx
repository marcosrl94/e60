import type { ReactNode } from 'react';
import { Tag, type TagVariant } from '@e60/ui';
import type { DisclosureCardData, DisclosureStatus } from './data';

interface DisclosureCardProps {
  data: DisclosureCardData;
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
 * Server component. Click-through is intentionally not wired yet — once the
 * Open Disclosure drawer (Phase 3) is built, the parent route will become a
 * client component that owns selection and renders an interactive wrapper
 * around each card. Hover styles stay so the gallery already feels alive.
 */
export function DisclosureCard({ data }: DisclosureCardProps) {
  const Preview = data.preview;
  return (
    <article
      className="group flex flex-col overflow-hidden rounded-lg border border-line bg-panel shadow-e60-sm transition-all hover:-translate-y-[1px] hover:border-ink-5 hover:shadow-e60-md"
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
        <div className="mt-2 flex items-center justify-between gap-3 border-t border-line-soft pt-2.5 font-mono text-[10px] tracking-wide text-ink-3">
          <span className="line-clamp-1">{data.meta}</span>
          <span className="line-clamp-1 text-ink-1">{data.date}</span>
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
