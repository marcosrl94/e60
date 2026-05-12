import {
  ActivityColumn,
  DonutCard,
  KpiCard,
  Panel,
  Sparkline,
  Tag,
  type ActivityItem,
} from '@e60/ui';
import { DisclosureActivityChart } from '@/components/hub/DisclosureActivityChart';

const RECENTLY_CAPTURED: ActivityItem[] = [
  {
    title: (
      <>
        <strong className="font-semibold">ESRS E1-6</strong> · Total GHG emissions
      </>
    ),
    sub: 'Carbon Intelligence · automated',
    value: '23,447 tCO₂e',
    date: '14:23',
  },
  {
    title: (
      <>
        <strong className="font-semibold">ESRS E1-7</strong> · Carbon removals
      </>
    ),
    sub: 'Manual entry · CSO Office',
    value: '142 tCO₂e',
    date: '11:08',
  },
  {
    title: (
      <>
        <strong className="font-semibold">ESRS S1-9</strong> · Diversity metrics
      </>
    ),
    sub: 'HR system · scheduled sync',
    value: '42% / 58%',
    date: '09:42',
  },
  {
    title: (
      <>
        <strong className="font-semibold">PCAF · Power sector</strong>
      </>
    ),
    sub: 'ALQUID NZ · recalc',
    value: '4.18 MtCO₂e',
    date: 'ayer',
  },
  {
    title: (
      <>
        <strong className="font-semibold">Taxonomy · GAR ratio</strong>
      </>
    ),
    sub: 'Sust. Finance team',
    value: '14.2%',
    date: '−2d',
  },
];

const RECENTLY_PUBLISHED: ActivityItem[] = [
  {
    title: (
      <>
        <strong className="font-semibold">CDP Climate 2025</strong> · response submitted
      </>
    ),
    sub: 'CDP · 412 questions',
    value: 'A−',
    date: '06 may',
  },
  {
    title: (
      <>
        <strong className="font-semibold">Pillar III ESG</strong> · TBL 1-4 firmadas
      </>
    ),
    sub: 'EBA ITS · CRO sign-off',
    value: '4 / 10',
    date: '09 abr',
  },
  {
    title: (
      <>
        <strong className="font-semibold">SBTi annual progress</strong> report
      </>
    ),
    sub: 'SBTi · validated submission',
    value: 'on track',
    date: '13 abr',
  },
  {
    title: (
      <>
        <strong className="font-semibold">UNEP-FI PRB</strong> reporting template
      </>
    ),
    sub: 'Principles Responsible Banking',
    value: 'v2.1',
    date: '08 abr',
  },
  {
    title: (
      <>
        <strong className="font-semibold">Board ESG dashboard</strong> · Q1
      </>
    ),
    sub: 'Internal · executive PDF',
    value: '38 KPIs',
    date: '29 abr',
  },
];

const BLOCKED_REVIEW: ActivityItem[] = [
  {
    title: (
      <>
        <strong className="font-semibold">CSRD · Doble materialidad</strong>
      </>
    ),
    sub: 'Pending stakeholder workshop',
    value: '−',
    date: '27 may',
  },
  {
    title: (
      <>
        <strong className="font-semibold">TBL 5</strong> · Sectoral exposures
      </>
    ),
    sub: '12 NACE codes en revisión',
    value: '73%',
    date: '07 abr',
  },
  {
    title: (
      <>
        <strong className="font-semibold">DJSI CSA 2025</strong> · sec. Innovation
      </>
    ),
    sub: 'Awaiting strategy team input',
    value: '14/22',
    date: '07 abr',
  },
  {
    title: (
      <>
        <strong className="font-semibold">ESRS S2</strong> · Workers in value chain
      </>
    ),
    sub: 'Methodology gap identified',
    value: 'draft',
    date: '06 abr',
  },
  {
    title: (
      <>
        <strong className="font-semibold">MSCI ESG ratings</strong> · query resp.
      </>
    ),
    sub: 'CSO review pending',
    value: '8 q',
    date: '20 mar',
  },
];

/**
 * Disclosure Hub · Overview
 *
 * First fully migrated route from the HTML mockups.
 * Shows greeting + KPI row + activity chart placeholder.
 *
 * The rest of the Hub Overview content (chart, activity columns, donut row)
 * will be migrated in subsequent phases.
 */
export default function HubOverviewPage() {
  return (
    <>
      {/* Greeting */}
      <div className="mb-5 flex items-start justify-between gap-6">
        <div>
          <h1 className="mb-1 text-[24px] font-semibold leading-tight tracking-tight text-ink-1">
            Buenos días, Marta
          </h1>
          <div className="font-mono text-[11.5px] tracking-wide text-ink-3">
            Disclosure Hub · <strong className="font-medium text-ink-1">Pilot Bank Iberia</strong> · Real-time metrics
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Tag variant="green">Live</Tag>
          <span className="font-mono text-[10px] tracking-wide text-ink-2">
            Updated 13:13
          </span>
        </div>
      </div>

      {/* KPI Row · 5 metrics */}
      <div className="mb-[18px] grid grid-cols-5 gap-3">
        <KpiCard
          icon={
            <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M2 4h10v8H2z" strokeLinejoin="round" />
              <path d="M2 6.5h10M5 4v8" strokeLinecap="round" />
            </svg>
          }
          iconColor="purple"
          label="Datapoints"
          value="1,144"
          attribution={{ label: 'Repository' }}
          sparkline={
            <Sparkline data={[18, 16, 14, 11, 8, 5, 3]} color="purple" filled />
          }
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
          attribution={{ label: 'Engines · Connectors' }}
          sparkline={
            <Sparkline data={[19, 18, 14, 13, 10, 7, 5]} color="orange" filled />
          }
        />
        <KpiCard
          icon={
            <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M2 7l3 3 7-7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          }
          iconColor="blue"
          label="Frameworks"
          value="8"
          unit=" active"
          attribution={{ label: 'Crosswalk' }}
          sparkline={<Sparkline data={[18, 18, 18, 14, 14, 8, 8]} color="blue" />}
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
          attribution={{ label: 'Outputs' }}
          sparkline={
            <Sparkline data={[18, 16, 13, 12, 10, 7, 5]} color="green" filled />
          }
        />
        <KpiCard
          icon={
            <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6">
              <circle cx="7" cy="7" r="5.5" />
              <path d="M7 4v3M7 10v.1" strokeLinecap="round" />
            </svg>
          }
          iconColor="red"
          label="Pending review"
          value="23"
          attribution={{ label: 'CRO Queue' }}
          sparkline={<Sparkline data={[13, 14, 11, 9, 12, 8, 6]} color="red" />}
        />
      </div>

      {/* Chart */}
      <Panel>
        <Panel.Head
          title="Disclosure activity"
          count="7 frameworks · 12 disclosures"
          icon={
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path
                d="M2 9l3-3 2 2 3-4 2 3 2-2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          }
        />
        <Panel.Body>
          <DisclosureActivityChart />
        </Panel.Body>
      </Panel>

      {/* Recent Disclosure Activity · 3 columns */}
      <Panel className="mt-[18px]">
        <Panel.Head
          title="Recent Disclosure Activity"
          icon={
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
              <circle cx="8" cy="8" r="6.5" />
              <path d="M8 4.5v3.5l2 1.5" strokeLinecap="round" />
            </svg>
          }
        />
        <Panel.Body flush>
          <div className="grid grid-cols-3 gap-3 p-3">
            <ActivityColumn
              tone="created"
              title="Recently Captured"
              count={RECENTLY_CAPTURED.length}
              items={RECENTLY_CAPTURED}
              icon={
                <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <path d="M7 3v8M3 7h8" strokeLinecap="round" />
                </svg>
              }
            />
            <ActivityColumn
              tone="won"
              title="Recently Published"
              count={RECENTLY_PUBLISHED.length}
              items={RECENTLY_PUBLISHED}
              icon={
                <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <path d="M3 7l3 3 5-6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              }
            />
            <ActivityColumn
              tone="lost"
              title="Blocked / Review"
              count={BLOCKED_REVIEW.length}
              items={BLOCKED_REVIEW}
              icon={
                <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <circle cx="7" cy="7" r="5.5" />
                  <path d="M5 5l4 4M9 5l-4 4" strokeLinecap="round" />
                </svg>
              }
            />
          </div>
        </Panel.Body>
      </Panel>

      {/* Bottom row · 3 donut cards */}
      <div className="mt-[18px] grid grid-cols-3 gap-3 wide:grid-cols-2">
        <Panel>
          <Panel.Head
            title="By ESRS Topic"
            icon={
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M8 1.5v6l5 3" strokeLinecap="round" />
                <circle cx="8" cy="8" r="6.5" />
              </svg>
            }
          />
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
          <Panel.Head
            title="By Framework"
            icon={
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M3 4h10M3 8h10M3 12h10" strokeLinecap="round" />
              </svg>
            }
          />
          <DonutCard
            legend={[
              { label: 'CSRD / ESRS', value: '1,144', emphasis: true },
              { label: 'GRI Standards', value: '412' },
              { label: 'CDP Climate', value: '186' },
              { label: 'TCFD', value: '42' },
              { label: 'TNFD', value: '38' },
              { label: 'SASB Banks', value: '28' },
              { label: 'DJSI / CSA', value: '160' },
              { label: 'UNEP-FI PRB', value: '22' },
            ]}
          />
        </Panel>

        <Panel className="wide:col-span-2">
          <Panel.Head
            title="By Source"
            icon={
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
                <circle cx="8" cy="8" r="6.5" />
                <path d="M5.5 8l2 2 3-4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            }
          />
          <DonutCard
            center={{ value: '87%', label: 'AUTOMATED' }}
            segments={[
              { color: '#1aa56a', label: 'Engines (NZ + CI)', value: '60%', pct: 60 },
              { color: '#3b6cf3', label: 'Connectors', value: '22%', pct: 22 },
              { color: '#ff8c2d', label: 'Manual entry', value: '18%', pct: 18 },
            ]}
          />
        </Panel>
      </div>
    </>
  );
}
