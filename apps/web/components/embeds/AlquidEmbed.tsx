import { Panel, Tag } from '@e60/ui';

/**
 * AlquidEmbed
 *
 * Placeholder shell for the ALQUID Net Zero engine. ALQUID NZ is **not** rebuilt
 * inside E6.0 — it lives as a separate product (repo TBD, will be wired in later)
 * and is embedded here via iframe. Its computed series (sectoral emissions,
 * temperature alignment, projection vs SBTi target, PCAF DQ scores…) flow back
 * into the E6.0 Datapoint Repository as the source of truth for ESRS disclosures
 * E1-6_05 (financed emissions), E1-9 (climate risk), and the Pillar III TBL templates
 * — i.e. ALQUID NZ output is a **disclosure input**, not a parallel UI.
 *
 * When `NEXT_PUBLIC_ALQUID_NZ_BASE_URL` is set, this component mounts an iframe
 * pointing to `${base}/embed/{view}`. Until then, it renders a clearly-labelled
 * placeholder so the route is browseable in the demo.
 */

interface AlquidEmbedProps {
  /** Slug passed to ALQUID NZ to choose which view to render. */
  view: 'financed-emissions' | 'net-zero-trajectory' | 'portfolio-alignment';
  title: string;
  subtitle?: string;
  /** Disclosure datapoints fed by this view, surfaced for the user. */
  feeds?: { code: string; description: string }[];
  /** Optional metadata pill shown beside "LIVE". */
  metaPill?: string;
}

const VIEW_LABEL: Record<AlquidEmbedProps['view'], string> = {
  'financed-emissions': 'Financed emissions · PCAF v3',
  'net-zero-trajectory': 'Net-Zero Trajectory · SBTi 1.5°C',
  'portfolio-alignment': 'Portfolio alignment · NZBA',
};

export function AlquidEmbed({
  view,
  title,
  subtitle,
  feeds,
  metaPill,
}: AlquidEmbedProps) {
  const base = process.env.NEXT_PUBLIC_ALQUID_NZ_BASE_URL;
  const embedUrl = base ? `${base.replace(/\/$/, '')}/embed/${view}` : null;

  return (
    <>
      {/* Greeting */}
      <div className="mb-5 flex items-start justify-between gap-6">
        <div>
          <h1 className="mb-1 flex flex-wrap items-center gap-2 text-[24px] font-semibold leading-tight tracking-tight text-ink-1">
            {title}
            <span className="rounded-md bg-ink-1 px-2 py-[3px] font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-white">
              ALQUID Net Zero
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
          title={VIEW_LABEL[view]}
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
              title={`ALQUID Net Zero · ${VIEW_LABEL[view]}`}
              className="h-[calc(100vh-260px)] w-full border-0"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              referrerPolicy="strict-origin-when-cross-origin"
            />
          ) : (
            <PlaceholderCard view={view} />
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
            <ul className="grid grid-cols-1 gap-x-6 gap-y-2 standard:grid-cols-1 wide:grid-cols-1 md:grid-cols-2">
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
              ALQUID NZ runs the calculation; E6.0 consumes the resulting values
              from <a className="underline decoration-dotted underline-offset-2" href="/disclosure-hub/repository">the Datapoint Repository</a> and assembles them into ESRS / Pillar III narratives.
            </p>
          </Panel.Body>
        </Panel>
      )}
    </>
  );
}

function PlaceholderCard({ view }: { view: AlquidEmbedProps['view'] }) {
  return (
    <div className="flex h-[calc(100vh-260px)] flex-col items-center justify-center gap-3 px-8 text-center">
      <div className="rounded-md border border-line bg-canvas px-3 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-2">
        ALQUID Net Zero · embed
      </div>
      <h2 className="max-w-[420px] text-[18px] font-semibold leading-snug text-ink-1">
        {VIEW_LABEL[view]} se servirá embebido desde ALQUID Net Zero.
      </h2>
      <p className="max-w-[460px] text-[12px] leading-relaxed text-ink-3">
        Esta vista no se reconstruye en E6.0. ALQUID NZ ejecuta el motor PCAF v3
        + alineación de cartera y devuelve el resultado, que aterriza en el
        Datapoint Repository como insumo para disclosure ESRS y Pillar III.
      </p>
      <p className="mt-2 max-w-[460px] font-mono text-[10.5px] leading-relaxed text-ink-4">
        Pendiente · define <code className="rounded bg-canvas-edge px-1 py-px text-ink-2">NEXT_PUBLIC_ALQUID_NZ_BASE_URL</code> en{' '}
        <code className="rounded bg-canvas-edge px-1 py-px text-ink-2">apps/web/.env.local</code>{' '}
        cuando el repo de ALQUID NZ esté disponible.
      </p>
    </div>
  );
}
