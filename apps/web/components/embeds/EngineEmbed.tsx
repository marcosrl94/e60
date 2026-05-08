import { Panel, Tag } from '@e60/ui';

/**
 * EngineEmbed
 *
 * Generic shell that hosts an **external** calculation engine inside E6.0 via
 * iframe. Today it serves ALQUID Net Zero (financed emissions, portfolio
 * alignment) — a separate product that lives in its own repo.
 *
 * Native modules built directly in E6.0 (e.g. Carbon Intelligence for
 * own-operations GHG) do NOT use this shell — they render their own React UI.
 *
 * The engine's output flows back into the E6.0 Datapoint Repository as the
 * source of truth for ESRS disclosures and Pillar III templates. The `feeds`
 * prop is what makes that "engine → disclosure" wiring visible to the user.
 *
 * When `NEXT_PUBLIC_ALQUID_NZ_BASE_URL` is unset, a clearly-labelled
 * placeholder is rendered so the route is still browseable in the demo.
 */

export type EngineId = 'alquid-nz';

interface EngineConfig {
  brand: string;
  badgeClassName: string;
  envVar: string;
  placeholderBody: string;
}

const ENGINES: Record<EngineId, EngineConfig> = {
  'alquid-nz': {
    brand: 'ALQUID Net Zero',
    badgeClassName: 'bg-ink-1 text-white',
    envVar: 'NEXT_PUBLIC_ALQUID_NZ_BASE_URL',
    placeholderBody:
      'ALQUID NZ ejecuta el motor PCAF v3 + alineación de cartera y devuelve el resultado, que aterriza en el Datapoint Repository como insumo para disclosure ESRS y Pillar III.',
  },
};

interface EngineEmbedProps {
  /** Which external engine renders this view. */
  engine: EngineId;
  /** Slug appended to the engine base URL: `${BASE}/embed/{view}`. */
  view: string;
  title: string;
  subtitle?: string;
  /** Friendly label for the panel head (e.g. "Financed emissions · PCAF v3"). */
  viewLabel: string;
  /** Disclosure datapoints fed by this view, surfaced for the user. */
  feeds?: { code: string; description: string }[];
  /** Optional metadata pill shown beside "LIVE". */
  metaPill?: string;
}

export function EngineEmbed({
  engine,
  view,
  title,
  subtitle,
  viewLabel,
  feeds,
  metaPill,
}: EngineEmbedProps) {
  const cfg = ENGINES[engine];
  const base = process.env[cfg.envVar];
  const embedUrl = base ? `${base.replace(/\/$/, '')}/embed/${view}` : null;

  return (
    <>
      {/* Greeting */}
      <div className="mb-5 flex items-start justify-between gap-6">
        <div>
          <h1 className="mb-1 flex flex-wrap items-center gap-2 text-[24px] font-semibold leading-tight tracking-tight text-ink-1">
            {title}
            <span
              className={`rounded-md px-2 py-[3px] font-mono text-[10px] font-medium uppercase tracking-[0.12em] ${cfg.badgeClassName}`}
            >
              {cfg.brand}
            </span>
          </h1>
          {subtitle && (
            <div className="font-mono text-[11.5px] tracking-wide text-ink-3">
              {subtitle}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Tag variant={embedUrl ? 'green' : 'gray'}>
            {embedUrl ? 'Live' : 'Not connected'}
          </Tag>
          {metaPill && (
            <span className="font-mono text-[10px] tracking-wide text-ink-2">
              {metaPill}
            </span>
          )}
        </div>
      </div>

      <Panel>
        <Panel.Head
          title={viewLabel}
          count="Disclosure input"
          icon={
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M2 9l4-4 3 3 5-7" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M9 1h5v5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          }
        />
        <Panel.Body flush>
          {embedUrl ? (
            <iframe
              src={embedUrl}
              title={`${cfg.brand} · ${viewLabel}`}
              className="h-[calc(100vh-260px)] w-full border-0"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              referrerPolicy="strict-origin-when-cross-origin"
            />
          ) : (
            <PlaceholderCard cfg={cfg} viewLabel={viewLabel} />
          )}
        </Panel.Body>
      </Panel>

      {feeds && feeds.length > 0 && (
        <Panel className="mt-[18px]">
          <Panel.Head
            title="Feeds the disclosure repository"
            count={`${feeds.length} datapoints`}
            icon={
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            }
          />
          <Panel.Body>
            <ul className="grid grid-cols-1 gap-x-6 gap-y-2 md:grid-cols-2">
              {feeds.map((f) => (
                <li
                  key={f.code}
                  className="flex items-baseline gap-2 text-[12px] text-ink-2"
                >
                  <span className="font-mono text-[10.5px] font-semibold tracking-wide text-ink-1">
                    {f.code}
                  </span>
                  <span className="text-ink-3">·</span>
                  <span>{f.description}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-[11px] leading-relaxed text-ink-3">
              {cfg.brand} runs the calculation; E6.0 consumes the resulting values
              from{' '}
              <a
                className="underline decoration-dotted underline-offset-2"
                href="/disclosure-hub/repository"
              >
                the Datapoint Repository
              </a>{' '}
              and assembles them into ESRS / Pillar III narratives.
            </p>
          </Panel.Body>
        </Panel>
      )}
    </>
  );
}

function PlaceholderCard({
  cfg,
  viewLabel,
}: {
  cfg: EngineConfig;
  viewLabel: string;
}) {
  return (
    <div className="flex h-[calc(100vh-260px)] flex-col items-center justify-center gap-3 px-8 text-center">
      <div className="rounded-md border border-line bg-canvas px-3 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-2">
        {cfg.brand} · embed
      </div>
      <h2 className="max-w-[460px] text-[18px] font-semibold leading-snug text-ink-1">
        {viewLabel} se servirá embebido desde {cfg.brand}.
      </h2>
      <p className="max-w-[480px] text-[12px] leading-relaxed text-ink-3">
        Esta vista no se reconstruye en E6.0. {cfg.placeholderBody}
      </p>
      <p className="mt-2 max-w-[480px] font-mono text-[10.5px] leading-relaxed text-ink-4">
        Pendiente · define{' '}
        <code className="rounded bg-canvas-edge px-1 py-px text-ink-2">
          {cfg.envVar}
        </code>{' '}
        en{' '}
        <code className="rounded bg-canvas-edge px-1 py-px text-ink-2">
          apps/web/.env.local
        </code>{' '}
        cuando el repo de {cfg.brand} esté disponible.
      </p>
    </div>
  );
}
