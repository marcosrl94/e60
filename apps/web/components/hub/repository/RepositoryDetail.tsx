'use client';

import type { Datapoint } from '@e60/domain';
import { FrameworkChip, Tag } from '@e60/ui';
import {
  CROSSWALK_LABEL,
  STATUS_LABEL,
  STATUS_VARIANT,
  TOPIC_LABEL,
} from './columns';

interface RepositoryDetailProps {
  datapoint: Datapoint | null;
}

const CATEGORY_TAG: Record<
  string,
  { label: string; variant: 'red' | 'orange' | 'blue' | 'purple' }
> = {
  E1: { label: 'Environmental', variant: 'red' },
  E2: { label: 'Environmental', variant: 'red' },
  E3: { label: 'Environmental', variant: 'red' },
  E4: { label: 'Environmental', variant: 'red' },
  E5: { label: 'Environmental', variant: 'red' },
  S1: { label: 'Social', variant: 'orange' },
  S2: { label: 'Social', variant: 'orange' },
  S3: { label: 'Social', variant: 'orange' },
  S4: { label: 'Social', variant: 'orange' },
  G1: { label: 'Governance', variant: 'blue' },
  GENERAL: { label: 'Cross-cutting', variant: 'purple' },
};

function Section({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-t border-line-soft px-[18px] py-[14px] first:border-t-0">
      <div className="mb-1.5 font-mono text-[9.5px] font-semibold uppercase tracking-[0.14em] text-ink-3">
        {label}
      </div>
      <div className="text-[12px] leading-relaxed text-ink-2">{children}</div>
    </div>
  );
}

function MiniSparkline() {
  return (
    <svg className="mt-2 h-[50px] w-full" viewBox="0 0 280 50" preserveAspectRatio="none">
      <path
        d="M0 22 L40 20 L80 16 L120 18 L160 12 L200 8 L240 10 L280 6"
        stroke="#7a4cf0"
        strokeWidth={1.8}
        fill="none"
      />
      <path
        d="M0 22 L40 20 L80 16 L120 18 L160 12 L200 8 L240 10 L280 6 L280 50 L0 50 Z"
        fill="#7a4cf0"
        opacity={0.12}
      />
    </svg>
  );
}

function formatLastSync(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

export function RepositoryDetail({ datapoint }: RepositoryDetailProps) {
  if (!datapoint) {
    return (
      <aside className="sticky top-0 flex h-full flex-col items-center justify-center rounded-lg border border-line bg-panel p-8 text-center shadow-e60-sm">
        <div className="mb-2 font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-3">
          Datapoint detail
        </div>
        <p className="max-w-[220px] text-[12px] text-ink-3">
          Select a row from the catalogue to inspect its definition, source,
          framework mappings and lineage.
        </p>
      </aside>
    );
  }

  const category = CATEGORY_TAG[datapoint.topic];

  return (
    <aside className="sticky top-0 flex max-h-[calc(100vh-120px)] flex-col overflow-hidden rounded-lg border border-line bg-panel shadow-e60-sm">
      <div className="border-b border-line-soft px-[18px] pb-3 pt-[14px]">
        <div className="mb-1.5 flex items-center gap-1.5">
          <Tag variant={category.variant}>{category.label}</Tag>
          <Tag variant={STATUS_VARIANT[datapoint.status]}>
            {STATUS_LABEL[datapoint.status]}
          </Tag>
        </div>
        <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-3">
          ESRS {datapoint.id}
          {datapoint.efragId && datapoint.efragId !== datapoint.id && (
            <> · EFRAG {datapoint.efragId}</>
          )}
        </div>
        <div className="mt-1 text-[15px] font-semibold leading-snug text-ink-1">
          {datapoint.name}
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-1 font-mono text-[10px] text-ink-3">
          <span>{TOPIC_LABEL[datapoint.topic]}</span>
          {datapoint.unit && (
            <>
              <span>·</span>
              <span>{datapoint.unit}</span>
            </>
          )}
          <span>·</span>
          <span>{datapoint.type}</span>
          {datapoint.phaseInYears && (
            <Tag variant="orange" className="ml-1">
              Phase-in +{datapoint.phaseInYears}y
            </Tag>
          )}
          {datapoint.voluntary && (
            <Tag variant="purple" className="ml-1">
              Voluntary
            </Tag>
          )}
          {datapoint.conditional && (
            <Tag variant="gray" className="ml-1">
              Conditional
            </Tag>
          )}
          {datapoint.mayDisclose && !datapoint.voluntary && (
            <Tag variant="gray" className="ml-1">
              May
            </Tag>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {datapoint.latestValue && (
          <Section label="Latest value">
            <div className="text-[22px] font-semibold tracking-tight text-ink-1">
              {datapoint.latestValue}
              {datapoint.unit && (
                <span className="ml-1 font-mono text-[10px] font-normal text-ink-3">
                  {datapoint.unit}
                </span>
              )}
            </div>
            <MiniSparkline />
            <div className="flex justify-between font-mono text-[9.5px] text-ink-3">
              <span>2018</span>
              <span>2025</span>
            </div>
          </Section>
        )}

        {(datapoint.esrsDisclosure || datapoint.paragraph || datapoint.relatedAr) && (
          <Section label="ESRS reference">
            <div className="font-mono text-[11px] text-ink-1">
              {datapoint.esrsDisclosure ?? '—'}
              {datapoint.paragraph && (
                <span className="text-ink-3"> · § {datapoint.paragraph}</span>
              )}
              {datapoint.relatedAr && (
                <span className="text-ink-3">
                  {' · '}
                  {/^AR/i.test(datapoint.relatedAr)
                    ? datapoint.relatedAr
                    : `AR ${datapoint.relatedAr}`}
                </span>
              )}
            </div>
          </Section>
        )}

        {datapoint.crosswalk.length > 0 && (
          <Section label={`Regulatory crosswalk (${datapoint.crosswalk.length})`}>
            <div className="flex flex-wrap gap-1">
              {datapoint.crosswalk.map((c) => (
                <FrameworkChip
                  key={c}
                  framework={CROSSWALK_LABEL[c]}
                  className="bg-nfq-blueBg/40 text-nfq-blue"
                />
              ))}
            </div>
            <p className="mt-2 text-[11px] text-ink-3">
              Per EFRAG IG3 Appendix B — this datapoint also feeds disclosures
              required by the indicated regulation(s).
            </p>
          </Section>
        )}

        {datapoint.phaseInYears && (
          <Section label="Phase-in">
            <p>
              Eligible for omission until year{' '}
              <strong className="text-ink-1">{datapoint.phaseInYears}</strong>{' '}
              after first ESRS reporting cycle (EFRAG IG3 Appendix C).
            </p>
          </Section>
        )}

        {datapoint.source && (
          <Section label="Source">
            <span className="font-medium text-ink-1">
              {datapoint.source.identifier === 'carbon_intelligence'
                ? 'Carbon Intelligence'
                : datapoint.source.identifier === 'alquid_nz'
                  ? 'ALQUID NZ'
                  : datapoint.source.identifier}
            </span>{' '}
            · {datapoint.source.type}. Last sync{' '}
            {formatLastSync(datapoint.source.lastSync)}.
            {datapoint.source.dataQualityScore && (
              <> · PCAF DQ {datapoint.source.dataQualityScore}/5.</>
            )}
          </Section>
        )}

        <Section label={`Frameworks mapped (${datapoint.mappings.length})`}>
          {datapoint.mappings.length === 0 ? (
            <span className="text-ink-3">No mappings yet.</span>
          ) : (
            <div className="flex flex-wrap gap-1">
              {datapoint.mappings.map((m, i) => (
                <FrameworkChip
                  key={`${m.framework}-${i}`}
                  framework={`${m.framework} ${m.externalCode}`}
                />
              ))}
            </div>
          )}
        </Section>

        {datapoint.tags.length > 0 && (
          <Section label="Tags">
            <div className="flex flex-wrap gap-1">
              {datapoint.tags.map((t) => (
                <span
                  key={t}
                  className="rounded-[3px] border border-line-soft bg-canvas px-1.5 py-px font-mono text-[9px] text-ink-2 tracking-wide"
                >
                  {t}
                </span>
              ))}
            </div>
          </Section>
        )}

        {datapoint.owner && (
          <Section label="Owner">
            <span className="font-medium text-ink-1">{datapoint.owner}</span>
          </Section>
        )}
      </div>
    </aside>
  );
}
