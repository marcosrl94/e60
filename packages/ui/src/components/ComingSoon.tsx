import type { ReactNode } from 'react';
import { cn } from '../lib/cn';

export type ComingSoonAccent = 'purple' | 'blue' | 'orange' | 'green' | 'red';

export interface ComingSoonFeature {
  title: string;
  description: string;
  icon: ReactNode;
  accent?: ComingSoonAccent;
}

export interface ComingSoonProps {
  title: string;
  description: string;
  /** Tag shown above the title (e.g. "Powered by ALQUID NZ · Q3 2026") */
  tag?: string;
  /** Large icon shown at the top */
  icon?: ReactNode;
  /** Up to 6 feature cards rendered in a 3-column grid */
  features?: ComingSoonFeature[];
  className?: string;
}

const ACCENT_BG: Record<ComingSoonAccent, string> = {
  purple: 'bg-nfq-purpleBg text-nfq-purple',
  blue: 'bg-nfq-blueBg text-nfq-blue',
  orange: 'bg-nfq-orangeBg text-nfq-orange',
  green: 'bg-nfq-greenBg text-nfq-green',
  red: 'bg-nfq-redBg text-nfq-red',
};

/**
 * ComingSoon
 *
 * Used for module/sub-view placeholders that aren't built yet but need to
 * communicate roadmap with substance. Replaces a generic "coming soon" page
 * with something demoable: tag, description, and 3-6 feature cards.
 */
export function ComingSoon({
  title,
  description,
  tag,
  icon,
  features = [],
  className,
}: ComingSoonProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center px-10 text-center',
        className
      )}
      style={{ minHeight: '60vh' }}
    >
      {icon && (
        <div
          className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-line-soft text-nfq-purple"
          style={{
            background: 'linear-gradient(135deg, #f0eafe, #ecf0fe)',
          }}
        >
          <span className="h-7 w-7">{icon}</span>
        </div>
      )}

      {tag && (
        <span className="mb-3.5 rounded-full bg-nfq-purpleBg px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-widest text-nfq-purple">
          {tag}
        </span>
      )}

      <h1 className="mb-2 text-[22px] font-semibold tracking-tight text-ink-1">
        {title}
      </h1>
      <p className="mb-5 max-w-[460px] text-[13.5px] leading-[1.5] text-ink-3">
        {description}
      </p>

      {features.length > 0 && (
        <div className="grid w-full max-w-[700px] grid-cols-3 gap-3 cramped:grid-cols-1">
          {features.map((feature, i) => {
            const accent = feature.accent ?? 'purple';
            return (
              <div
                key={i}
                className="rounded-md border border-line bg-panel p-3.5 text-left"
              >
                <div
                  className={cn(
                    'mb-2 flex h-6 w-6 items-center justify-center rounded-sm',
                    ACCENT_BG[accent]
                  )}
                >
                  <span className="h-3 w-3">{feature.icon}</span>
                </div>
                <div className="mb-1 text-[12px] font-semibold text-ink-1">
                  {feature.title}
                </div>
                <div className="text-[11px] leading-[1.4] text-ink-3">
                  {feature.description}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
