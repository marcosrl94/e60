import {
  ActivityColumn,
  ComingSoon,
  DonutCard,
  FrameworkChip,
  KpiCard,
  Panel,
  Skeleton,
  Sparkline,
  Tag,
  type ActivityItem,
} from '@e60/ui';
import { tokens } from '@e60/ui/tokens';
import { DrawerDemo } from './DrawerDemo';

/**
 * /design · in-app design system reference.
 *
 * Server-rendered single page covering color tokens, typography scale,
 * shadows, and the 10 @e60/ui primitives with their public variants.
 * Anchor ids match the sidebar nav in `layout.tsx`.
 */
export default function DesignPage() {
  return (
    <div className="mx-auto max-w-[920px] space-y-12">
      <header>
        <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-3">
          v0.1.0 · Tailwind preset · pnpm 9.12
        </div>
        <h1 className="mt-1 text-[26px] font-semibold tracking-tight text-ink-1">
          E6.0 design system
        </h1>
        <p className="mt-1 max-w-[640px] text-[13px] leading-relaxed text-ink-3">
          The visual primitives and tokens shared across every E6.0 module.
          Tokens live in <code className="rounded bg-canvas-edge px-1 py-px font-mono text-[11px]">packages/ui/src/tokens/index.ts</code>{' '}
          and are re-exported as a Tailwind preset in <code className="rounded bg-canvas-edge px-1 py-px font-mono text-[11px]">@e60/config/tailwind</code>.
          Components ship from <code className="rounded bg-canvas-edge px-1 py-px font-mono text-[11px]">@e60/ui</code>.
        </p>
      </header>

      <ColorTokensSection />
      <TypographySection />
      <ShadowSection />
      <TagSection />
      <FrameworkChipSection />
      <KpiCardSection />
      <SparklineSection />
      <PanelSection />
      <ActivityColumnSection />
      <DonutCardSection />
      <SkeletonSection />
      <DrawerSection />
      <ComingSoonSection />
    </div>
  );
}

// ── Helper layout pieces ──────────────────────────────────────────────

function Section({
  id,
  title,
  description,
  children,
}: {
  id: string;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-6">
      <div className="mb-4 border-b border-line pb-2">
        <h2 className="text-[18px] font-semibold tracking-tight text-ink-1">
          {title}
        </h2>
        {description && (
          <p className="mt-0.5 text-[12.5px] text-ink-3">{description}</p>
        )}
      </div>
      {children}
    </section>
  );
}

function Swatch({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-md border border-line-soft bg-panel">
      <div
        className="h-12 rounded-t-md border-b border-line-soft"
        style={{ background: value }}
      />
      <div className="px-2.5 py-1.5">
        <div className="font-mono text-[10px] text-ink-1">{label}</div>
        <div className="font-mono text-[9.5px] uppercase tracking-wide text-ink-3">
          {value}
        </div>
      </div>
    </div>
  );
}

// ── Tokens ────────────────────────────────────────────────────────────

function ColorTokensSection() {
  const groups = [
    {
      label: 'Surfaces',
      entries: [
        ['canvas', tokens.colors.canvas],
        ['canvas-edge', tokens.colors.canvasEdge],
        ['panel', tokens.colors.panel],
        ['panel-soft', tokens.colors.panelSoft],
        ['panel-hover', tokens.colors.panelHover],
        ['line', tokens.colors.line],
        ['line-soft', tokens.colors.lineSoft],
      ] as const,
    },
    {
      label: 'Ink scale',
      entries: [
        ['ink-1', tokens.colors.ink[1]],
        ['ink-2', tokens.colors.ink[2]],
        ['ink-3', tokens.colors.ink[3]],
        ['ink-4', tokens.colors.ink[4]],
        ['ink-5', tokens.colors.ink[5]],
      ] as const,
    },
    {
      label: 'NFQ accents',
      entries: [
        ['nfq-red', tokens.colors.nfq.red],
        ['nfq-orange', tokens.colors.nfq.orange],
        ['nfq-blue', tokens.colors.nfq.blue],
        ['nfq-purple', tokens.colors.nfq.purple],
        ['nfq-green', tokens.colors.nfq.green],
        ['nfq-amber', tokens.colors.nfq.amber],
      ] as const,
    },
    {
      label: 'NFQ tints',
      entries: [
        ['nfq-redBg', tokens.colors.nfq.redBg],
        ['nfq-orangeBg', tokens.colors.nfq.orangeBg],
        ['nfq-blueBg', tokens.colors.nfq.blueBg],
        ['nfq-purpleBg', tokens.colors.nfq.purpleBg],
        ['nfq-greenBg', tokens.colors.nfq.greenBg],
      ] as const,
    },
  ];

  return (
    <Section
      id="tokens-color"
      title="Color tokens"
      description="Surfaces, ink scale and the NFQ accent palette. Pending the official NFQ HEX guide — placeholders today."
    >
      <div className="space-y-4">
        {groups.map((g) => (
          <div key={g.label}>
            <div className="mb-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-3">
              {g.label}
            </div>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-4 lg:grid-cols-6">
              {g.entries.map(([label, value]) => (
                <Swatch key={label} label={label} value={value} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

function TypographySection() {
  const sizes: { key: keyof typeof tokens.typography.fontSize; px: string }[] = [
    { key: 'xs', px: '10px · meta pills · tags' },
    { key: 'sm', px: '11px · sublabels' },
    { key: 'base', px: '12.5px · body' },
    { key: 'md', px: '13px · emphasis body' },
    { key: 'lg', px: '16px · drawer titles' },
    { key: 'xl', px: '18px · section headers' },
    { key: '2xl', px: '24px · page titles' },
  ];
  return (
    <Section
      id="tokens-type"
      title="Typography"
      description="Inter for body, JetBrains Mono for codes, identifiers and meta."
    >
      <div className="rounded-md border border-line-soft bg-panel">
        {sizes.map((s, i) => (
          <div
            key={s.key}
            className={
              'flex items-baseline gap-4 px-4 py-3 ' +
              (i < sizes.length - 1 ? 'border-b border-line-soft' : '')
            }
          >
            <span className="w-[60px] font-mono text-[10px] uppercase tracking-wide text-ink-3">
              {s.key}
            </span>
            <span
              className="text-ink-1"
              style={{ fontSize: tokens.typography.fontSize[s.key] }}
            >
              The quick brown fox jumps
            </span>
            <span className="ml-auto font-mono text-[10px] tracking-wide text-ink-3">
              {s.px}
            </span>
          </div>
        ))}
      </div>
    </Section>
  );
}

function ShadowSection() {
  const shadows: { key: keyof typeof tokens.shadows; sample: string }[] = [
    { key: 'sm', sample: 'shadow-e60-sm' },
    { key: 'md', sample: 'shadow-e60-md' },
    { key: 'lg', sample: 'shadow-e60-lg' },
    { key: 'pop', sample: 'shadow-e60-pop' },
  ];
  return (
    <Section id="tokens-shadow" title="Shadows" description="Four elevations.">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {shadows.map((s) => (
          <div
            key={s.key}
            className={
              'flex h-[110px] flex-col items-center justify-center gap-1 rounded-lg bg-panel ' +
              s.sample
            }
          >
            <div className="font-mono text-[11px] font-semibold text-ink-1">
              {s.key}
            </div>
            <div className="font-mono text-[9px] tracking-wide text-ink-3">
              {s.sample}
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

// ── Component sections ───────────────────────────────────────────────

function TagSection() {
  return (
    <Section
      id="tag"
      title="Tag"
      description="Status / category pill in 6 variants. Mono uppercase tracking-wide."
    >
      <div className="flex flex-wrap items-center gap-2">
        <Tag variant="green">Live</Tag>
        <Tag variant="orange">Partial</Tag>
        <Tag variant="red">Blocked</Tag>
        <Tag variant="blue">Mapped</Tag>
        <Tag variant="purple">Custom</Tag>
        <Tag variant="gray">Pending</Tag>
      </div>
    </Section>
  );
}

function FrameworkChipSection() {
  return (
    <Section
      id="framework-chip"
      title="FrameworkChip"
      description="Compact chip for framework codes. Used inline in tables and detail panels."
    >
      <div className="flex flex-wrap gap-1">
        <FrameworkChip framework="CSRD" />
        <FrameworkChip framework="GRI 305" />
        <FrameworkChip framework="CDP C6.1" />
        <FrameworkChip framework="PCAF" />
        <FrameworkChip framework="EBA Pillar III" />
        <FrameworkChip framework="SBTi annual" />
      </div>
    </Section>
  );
}

function KpiCardSection() {
  return (
    <Section
      id="kpi-card"
      title="KpiCard"
      description="Stat card with optional icon, sparkline and unit suffix. Composed inline by the page."
    >
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <KpiCard
          icon={
            <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M2 4h10v8H2z" strokeLinejoin="round" />
              <path d="M2 6.5h10M5 4v8" strokeLinecap="round" />
            </svg>
          }
          iconColor="purple"
          label="Datapoints"
          value="1,184"
          sparkline={<Sparkline data={[18, 16, 14, 11, 8, 5, 3]} color="purple" filled />}
        />
        <KpiCard
          icon={
            <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6">
              <circle cx="7" cy="7" r="5" />
              <path d="M5.5 7l1.5 1.5L9 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          }
          iconColor="orange"
          label="Captured"
          value="847"
          unit="/1144"
        />
        <KpiCard
          icon={
            <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M3 7l3 3 5-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          }
          iconColor="green"
          label="Disclosures Q4"
          value="12"
          sparkline={<Sparkline data={[18, 16, 13, 12, 10, 7, 5]} color="green" filled />}
        />
      </div>
    </Section>
  );
}

function SparklineSection() {
  return (
    <Section
      id="sparkline"
      title="Sparkline"
      description="Tiny inline trend line. Filled or stroke-only, 5 colors."
    >
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        {(['red', 'orange', 'blue', 'purple', 'green'] as const).map((c) => (
          <div key={c} className="rounded-md border border-line-soft bg-panel p-3">
            <div className="mb-2 font-mono text-[9.5px] uppercase tracking-wide text-ink-3">
              {c}
            </div>
            <Sparkline data={[18, 16, 13, 12, 10, 7, 5]} color={c} filled />
          </div>
        ))}
      </div>
    </Section>
  );
}

function PanelSection() {
  return (
    <Section
      id="panel"
      title="Panel"
      description="Surface wrapper composed of Panel.Head + Panel.Body. Default body padding can be removed via flush prop."
    >
      <Panel>
        <Panel.Head
          title="Disclosure activity"
          count="7 frameworks · 12 disclosures"
          icon={
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M2 9l3-3 2 2 3-4 2 3 2-2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          }
        />
        <Panel.Body>
          <div className="text-[12.5px] text-ink-2">
            Panel body content. Mix of charts, tables, lists, etc.
          </div>
        </Panel.Body>
      </Panel>
    </Section>
  );
}

function ActivityColumnSection() {
  const items: ActivityItem[] = [
    { title: <><strong className="font-semibold">ESRS E1-6</strong> · Total GHG</>, sub: 'Carbon Intelligence', value: '23,447 tCO₂e', date: '14:23' },
    { title: <><strong className="font-semibold">ESRS S1-9</strong> · Diversity</>, sub: 'HR Workday', value: '42% / 58%', date: '09:42' },
    { title: <><strong className="font-semibold">PCAF · Power</strong></>, sub: 'ALQUID NZ', value: '4.18 MtCO₂e', date: 'ayer' },
  ];
  return (
    <Section
      id="activity-column"
      title="ActivityColumn"
      description="One column of a 3-col activity panel. tone drives the icon color (created / won / lost)."
    >
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {(['created', 'won', 'lost'] as const).map((tone) => (
          <ActivityColumn
            key={tone}
            tone={tone}
            title={tone === 'created' ? 'Recently captured' : tone === 'won' ? 'Recently published' : 'Blocked / review'}
            count={items.length}
            items={items}
            icon={
              <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M7 3v8M3 7h8" strokeLinecap="round" />
              </svg>
            }
          />
        ))}
      </div>
    </Section>
  );
}

function DonutCardSection() {
  return (
    <Section
      id="donut-card"
      title="DonutCard"
      description="Either a center value with segmented donut, or a stacked legend list. Embedded inside a Panel."
    >
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <Panel>
          <Panel.Head title="By ESRS Topic" />
          <DonutCard
            center={{ value: '847', label: 'CAPTURED' }}
            segments={[
              { color: '#f04e3e', label: 'Environmental', value: '38%', pct: 38 },
              { color: '#ff8c2d', label: 'Social', value: '28%', pct: 28 },
              { color: '#3b6cf3', label: 'Governance', value: '22%', pct: 22 },
              { color: '#7a4cf0', label: 'Cross-cutting', value: '12%', pct: 12 },
            ]}
          />
        </Panel>
        <Panel>
          <Panel.Head title="By Framework" />
          <DonutCard
            legend={[
              { label: 'CSRD / ESRS', value: '1,144', emphasis: true },
              { label: 'GRI Standards', value: '412' },
              { label: 'CDP Climate', value: '186' },
              { label: 'TCFD', value: '42' },
              { label: 'TNFD', value: '38' },
            ]}
          />
        </Panel>
      </div>
    </Section>
  );
}

function SkeletonSection() {
  return (
    <Section
      id="skeleton"
      title="Skeleton"
      description="animate-pulse placeholder. Three rounding presets."
    >
      <div className="space-y-3 rounded-md border border-line-soft bg-panel p-4">
        <div className="flex items-center gap-3">
          <Skeleton width={32} height={32} rounded="full" />
          <div className="flex-1 space-y-2">
            <Skeleton height={10} width="40%" />
            <Skeleton height={8} width="65%" />
          </div>
        </div>
        <Skeleton height={120} rounded="md" />
        <div className="space-y-1.5">
          <Skeleton height={8} width="80%" />
          <Skeleton height={8} width="55%" />
          <Skeleton height={8} width="68%" />
        </div>
      </div>
    </Section>
  );
}

function DrawerSection() {
  return (
    <Section
      id="drawer"
      title="Drawer"
      description="720px slide-from-right panel with backdrop blur, Esc + backdrop close, body scroll lock. Ships Drawer.Tabs subcomponent."
    >
      <DrawerDemo />
    </Section>
  );
}

function ComingSoonSection() {
  return (
    <Section
      id="coming-soon"
      title="ComingSoon"
      description="Placeholder for unfinished routes. Greeting + 3 feature stripe."
    >
      <div className="rounded-md border border-line bg-panel">
        <div className="scale-[0.6] origin-top-left" style={{ width: '167%', height: 360 }}>
          <ComingSoon
            tag="Phase 7 of migration"
            icon={
              <svg viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="14" cy="14" r="11" />
              </svg>
            }
            title="Sample placeholder"
            description="The component used by routes that aren't migrated yet. Hub Overview is migrated; the rest pulse here until the team picks them up."
            features={[
              { title: 'Feature one', description: 'Concise sub-text describing the feature.', accent: 'red', icon: <svg viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="6.5" cy="6.5" r="5"/></svg> },
              { title: 'Feature two', description: 'Another feature, different accent color.', accent: 'orange', icon: <svg viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="2" width="9" height="9"/></svg> },
              { title: 'Feature three', description: 'Third feature.', accent: 'green', icon: <svg viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 7l3 3 5-6" strokeLinecap="round"/></svg> },
            ]}
          />
        </div>
      </div>
    </Section>
  );
}
