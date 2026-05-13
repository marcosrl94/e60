'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Drawer, Tag } from '@e60/ui';
import { createClient } from '@/utils/supabase/client';
import { parseCsv, type ParsedCsv } from './csv-parser';
import {
  coerceDate,
  coerceNumber,
  mapColumns,
  pickCell,
  PORTFOLIO_FIELD_LABEL,
  type ColumnMapping,
  type PortfolioField,
} from './csv-mapping';
import { PORTFOLIO_CSV_CONNECTOR_ID } from './connectors';

/**
 * Portfolio CSV upload Drawer.
 *
 * Stages: pick → review → ingesting → done | error. The flow stays
 * fully client-side: browser Supabase client uploads the raw file to
 * the `connector_uploads` bucket, opens a `connector_syncs` row in
 * `running`, batches inserts into `portfolio_exposures`, then closes
 * the sync as `success` (or `failed`). RLS keeps every write scoped to
 * the signed-in user.
 */

type Phase = 'pick' | 'review' | 'ingesting' | 'done' | 'error';

interface ParsedState {
  file: File;
  parsed: ParsedCsv;
  mapping: ColumnMapping;
}

interface DoneState {
  rows: number;
  syncId: string;
}

interface ConnectCsvDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function ConnectCsvDrawer({ open, onClose }: ConnectCsvDrawerProps) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>('pick');
  const [parsedState, setParsedState] = useState<ParsedState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<DoneState | null>(null);
  const [progress, setProgress] = useState<{ inserted: number; total: number } | null>(null);

  const reset = useCallback(() => {
    setPhase('pick');
    setParsedState(null);
    setError(null);
    setDone(null);
    setProgress(null);
  }, []);

  const handleClose = useCallback(() => {
    onClose();
    // Wait for the slide-out animation before clearing so the user
    // doesn't see the UI snap to "pick" mid-close.
    window.setTimeout(reset, 250);
  }, [onClose, reset]);

  async function handleFile(file: File) {
    setError(null);
    try {
      const text = await file.text();
      const parsed = parseCsv(text);
      if (parsed.headers.length === 0 || parsed.rows.length === 0) {
        setError('CSV is empty or has no data rows.');
        setPhase('error');
        return;
      }
      const mapping = mapColumns(parsed.headers);
      if (mapping.missingRequired.length > 0) {
        setError(
          `Missing required column: ${mapping.missingRequired
            .map((f) => PORTFOLIO_FIELD_LABEL[f])
            .join(', ')}. Header detected: ${parsed.headers.join(', ')}`,
        );
        setPhase('error');
        return;
      }
      setParsedState({ file, parsed, mapping });
      setPhase('review');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to read file.');
      setPhase('error');
    }
  }

  async function handleIngest() {
    if (!parsedState) return;
    setPhase('ingesting');
    setError(null);
    const { file, parsed, mapping } = parsedState;
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setError('You need to be signed in to ingest data.');
      setPhase('error');
      return;
    }

    const ts = new Date().toISOString().replace(/[:.]/g, '-');
    const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = `${user.id}/${ts}-${cleanName}`;
    const { error: uploadError } = await supabase.storage
      .from('connector_uploads')
      .upload(storagePath, file, {
        contentType: file.type || 'text/csv',
        upsert: false,
      });
    if (uploadError) {
      setError(`Upload failed: ${uploadError.message}`);
      setPhase('error');
      return;
    }

    const { data: syncRow, error: syncError } = await supabase
      .from('connector_syncs')
      .insert({
        user_id: user.id,
        connector_id: PORTFOLIO_CSV_CONNECTOR_ID,
        status: 'running',
        source_filename: file.name,
        storage_path: storagePath,
      })
      .select('id')
      .single();
    if (syncError || !syncRow) {
      setError(`Sync row insert failed: ${syncError?.message ?? 'unknown'}`);
      setPhase('error');
      return;
    }

    const records = parsed.rows
      .filter((r) => r.some((c) => c.trim() !== ''))
      .map((r) => buildRecord(r, mapping, user.id, syncRow.id));

    const BATCH = 500;
    let inserted = 0;
    setProgress({ inserted: 0, total: records.length });
    try {
      for (let i = 0; i < records.length; i += BATCH) {
        const batch = records.slice(i, i + BATCH);
        const { error: insertError } = await supabase
          .from('portfolio_exposures')
          .insert(batch);
        if (insertError) throw insertError;
        inserted += batch.length;
        setProgress({ inserted, total: records.length });
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'insert failed';
      await supabase
        .from('connector_syncs')
        .update({
          status: 'failed',
          finished_at: new Date().toISOString(),
          error: msg,
          rows_processed: inserted,
        })
        .eq('id', syncRow.id);
      setError(`Insert failed after ${inserted} rows: ${msg}`);
      setPhase('error');
      return;
    }

    await supabase
      .from('connector_syncs')
      .update({
        status: 'success',
        finished_at: new Date().toISOString(),
        rows_processed: inserted,
      })
      .eq('id', syncRow.id);

    setDone({ rows: inserted, syncId: syncRow.id });
    setPhase('done');
    router.refresh();
  }

  return (
    <Drawer
      open={open}
      onClose={handleClose}
      eyebrow="Connector · Manual upload"
      title="Portfolio CSV upload"
      meta={<Tag variant="purple">PCAF-min</Tag>}
      width={640}
    >
      <div className="flex h-full flex-col overflow-y-auto px-5 py-5 text-[12.5px] leading-relaxed text-ink-2">
        {phase === 'pick' && <PickPanel onFile={handleFile} />}
        {phase === 'review' && parsedState && (
          <ReviewPanel state={parsedState} onCancel={reset} onConfirm={handleIngest} />
        )}
        {phase === 'ingesting' && <IngestingPanel progress={progress} />}
        {phase === 'done' && done && (
          <DonePanel rows={done.rows} onClose={handleClose} onAnother={reset} />
        )}
        {phase === 'error' && (
          <ErrorPanel message={error ?? 'Unknown error'} onRetry={reset} />
        )}
      </div>
    </Drawer>
  );
}

// ── Panels ─────────────────────────────────────────────────────────────

function PickPanel({ onFile }: { onFile: (file: File) => void }) {
  const [dragOver, setDragOver] = useState(false);
  return (
    <div className="flex flex-col gap-3">
      <p>
        Drag a CSV portfolio extract or click to select. We auto-map common
        columns (counterparty, NACE, EAD, region, as-of date) to the
        platform&apos;s PCAF-minimal schema before ingesting.
      </p>
      <label
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const f = e.dataTransfer.files?.[0];
          if (f) onFile(f);
        }}
        className={
          'flex cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed px-6 py-10 text-center text-[12px] transition-colors ' +
          (dragOver
            ? 'border-nfq-purple bg-nfq-purpleBg text-nfq-purple'
            : 'border-line bg-canvas text-ink-3 hover:border-ink-3 hover:text-ink-1')
        }
      >
        <span className="text-[13px] font-medium text-ink-1">Drop CSV here</span>
        <span className="font-mono text-[10px] tracking-wide">
          or click to browse · accepts `,` and `;` delimiters
        </span>
        <input
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={(e) => {
            const f = e.currentTarget.files?.[0];
            if (f) onFile(f);
          }}
        />
      </label>
      <div className="rounded-md border border-line-soft bg-canvas px-3 py-2 font-mono text-[10px] leading-relaxed text-ink-3">
        Required column: <strong className="text-ink-1">counterparty</strong>{' '}
        (or borrower / client / contraparte). All other columns are optional
        and persisted when present.
      </div>
    </div>
  );
}

function ReviewPanel({
  state,
  onCancel,
  onConfirm,
}: {
  state: ParsedState;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const { file, parsed, mapping } = state;
  const fields: PortfolioField[] = [
    'counterparty_name',
    'counterparty_id',
    'nace_code',
    'nace_label',
    'ead_eur',
    'outstanding_eur',
    'region',
    'as_of_date',
  ];
  const previewRows = parsed.rows.slice(0, 5);

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-md border border-line bg-canvas px-3 py-2 font-mono text-[10.5px] tracking-wide text-ink-3">
        <span className="text-ink-1">{file.name}</span> · {parsed.rows.length}{' '}
        rows · delimiter <span className="text-ink-1">{parsed.delimiter}</span>{' '}
        · {parsed.headers.length} columns
      </div>

      <section className="flex flex-col gap-1.5">
        <h3 className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-3">
          Column mapping
        </h3>
        <table className="w-full text-[11.5px]">
          <tbody>
            {fields.map((f) => {
              const idx = mapping.matched[f];
              const matched = idx != null;
              return (
                <tr key={f} className="border-b border-line-soft last:border-0">
                  <td className="py-1.5 pr-3 text-ink-2">{PORTFOLIO_FIELD_LABEL[f]}</td>
                  <td className="py-1.5 pr-3 font-mono text-[11px] tracking-tight">
                    {matched ? (
                      <span className="rounded bg-nfq-greenBg px-1.5 py-px text-nfq-green">
                        {parsed.headers[idx]}
                      </span>
                    ) : (
                      <span className="text-ink-3">— skipped —</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {mapping.unmatchedHeaders.length > 0 && (
          <p className="font-mono text-[10px] text-ink-3">
            Ignored columns: {mapping.unmatchedHeaders.join(', ')}
          </p>
        )}
      </section>

      <section className="flex flex-col gap-1.5">
        <h3 className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-3">
          Preview · first {previewRows.length} rows
        </h3>
        <div className="overflow-x-auto rounded-md border border-line bg-canvas">
          <table className="min-w-full text-[10.5px] tabular-nums">
            <thead>
              <tr className="bg-panel">
                {parsed.headers.map((h) => (
                  <th key={h} className="border-b border-line px-2 py-1.5 text-left font-mono font-semibold text-ink-3">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {previewRows.map((row, i) => (
                <tr key={i} className="border-b border-line-soft last:border-0">
                  {parsed.headers.map((_, j) => (
                    <td key={j} className="px-2 py-1 text-ink-1">
                      {row[j] ?? ''}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="mt-auto flex items-center justify-end gap-2 border-t border-line-soft pt-3">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-line px-3 py-1.5 text-[12px] font-medium text-ink-2 hover:bg-canvas hover:text-ink-1"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="rounded-md bg-ink-1 px-3 py-1.5 text-[12px] font-medium text-white hover:bg-ink-1/90"
        >
          Ingest {parsed.rows.length} rows
        </button>
      </div>
    </div>
  );
}

function IngestingPanel({
  progress,
}: {
  progress: { inserted: number; total: number } | null;
}) {
  const pct =
    progress && progress.total > 0
      ? Math.round((progress.inserted / progress.total) * 100)
      : null;
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
      <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-3">
        Ingesting
      </div>
      <div className="text-[14px] font-semibold text-ink-1 tabular-nums">
        {progress
          ? `${progress.inserted.toLocaleString('en-US')} / ${progress.total.toLocaleString('en-US')} rows`
          : 'Uploading file…'}
      </div>
      {pct != null && (
        <div className="h-1.5 w-48 overflow-hidden rounded-full bg-canvas">
          <div
            className="h-full bg-nfq-purple transition-[width] duration-200"
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
      <p className="font-mono text-[10px] text-ink-3">
        Raw file → Storage · rows → portfolio_exposures · sync row tracked in
        connector_syncs.
      </p>
    </div>
  );
}

function DonePanel({
  rows,
  onClose,
  onAnother,
}: {
  rows: number;
  onClose: () => void;
  onAnother: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
      <Tag variant="green">Ingest complete</Tag>
      <div className="text-[18px] font-semibold tabular-nums text-ink-1">
        {rows.toLocaleString('en-US')} rows
      </div>
      <p className="max-w-sm text-ink-3">
        Persisted to <code className="font-mono">portfolio_exposures</code>{' '}
        with provenance to <code className="font-mono">connector_syncs</code>.
        The connector card and the Trust Center timeline now reflect this
        upload.
      </p>
      <div className="mt-2 flex items-center gap-2">
        <button
          type="button"
          onClick={onAnother}
          className="rounded-md border border-line px-3 py-1.5 text-[12px] font-medium text-ink-2 hover:bg-canvas hover:text-ink-1"
        >
          Upload another
        </button>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md bg-ink-1 px-3 py-1.5 text-[12px] font-medium text-white hover:bg-ink-1/90"
        >
          Close
        </button>
      </div>
    </div>
  );
}

function ErrorPanel({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
      <Tag variant="red">Ingest failed</Tag>
      <p className="max-w-md text-ink-1">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="rounded-md border border-line px-3 py-1.5 text-[12px] font-medium text-ink-2 hover:bg-canvas hover:text-ink-1"
      >
        Start over
      </button>
    </div>
  );
}

// ── Record builder ─────────────────────────────────────────────────────

function buildRecord(
  row: string[],
  mapping: ColumnMapping,
  userId: string,
  syncId: string,
) {
  const m = mapping.matched;
  return {
    user_id: userId,
    connector_sync_id: syncId,
    counterparty_name:
      (pickCell(row, m.counterparty_name) ?? '').trim() || 'UNKNOWN',
    counterparty_id: trimOrNull(pickCell(row, m.counterparty_id)),
    nace_code: trimOrNull(pickCell(row, m.nace_code)),
    nace_label: trimOrNull(pickCell(row, m.nace_label)),
    ead_eur: coerceNumber(pickCell(row, m.ead_eur)),
    outstanding_eur: coerceNumber(pickCell(row, m.outstanding_eur)),
    region: trimOrNull(pickCell(row, m.region)),
    as_of_date: coerceDate(pickCell(row, m.as_of_date)),
  };
}

function trimOrNull(s: string | undefined): string | null {
  if (s == null) return null;
  const t = s.trim();
  return t === '' ? null : t;
}
