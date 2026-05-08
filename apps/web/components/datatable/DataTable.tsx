'use client';

import { useEffect, useRef, useState } from 'react';
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type Row,
  type RowData,
  type SortingState,
  type Table as TanstackTable,
} from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import { cn } from '@e60/ui/lib/cn';

interface DataTableProps<TData extends RowData> {
  data: TData[];
  columns: ColumnDef<TData, unknown>[];
  /** Pixel height of each row — fixed, used by the virtualizer */
  rowHeight?: number;
  /** Pixel height of the scroll viewport */
  height?: number | string;
  /** Function returning a stable row id (for selection / scrolling) */
  getRowId?: (row: TData, index: number) => string;
  /** Currently selected row id (for highlight) */
  selectedRowId?: string | null;
  /** Called when a row is clicked */
  onRowClick?: (row: TData) => void;
  /** Optional global filter function (string match across columns) */
  globalFilter?: string;
  /** Optional `filterFns.row` override delegating to a custom predicate */
  rowMatches?: (row: TData) => boolean;
  /** Initial sorting */
  initialSorting?: SortingState;
  /** Hook that exposes the underlying table instance (e.g. to read filtered count) */
  onTableReady?: (table: TanstackTable<TData>) => void;
}

/**
 * DataTable
 *
 * Virtualized, sortable table built on TanStack Table v8 + react-virtual.
 * Designed for large catalogues (1k+ rows) like the Datapoint Repository.
 *
 * Visual style follows the E6.0 mockup: dense rows, mono codes, hover/select
 * highlighting. Header is sticky inside the scroll container.
 */
export function DataTable<TData extends RowData>({
  data,
  columns,
  rowHeight = 42,
  height = '100%',
  getRowId,
  selectedRowId,
  onRowClick,
  globalFilter,
  rowMatches,
  initialSorting,
  onTableReady,
}: DataTableProps<TData>) {
  const table = useReactTable({
    data,
    columns,
    state: {
      globalFilter: globalFilter ?? '',
    },
    initialState: { sorting: initialSorting },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getRowId: getRowId
      ? (row, index) => getRowId(row, index)
      : undefined,
    globalFilterFn: rowMatches
      ? (row) => rowMatches(row.original as TData)
      : 'auto',
  });

  if (onTableReady) onTableReady(table);

  const { rows } = table.getRowModel();

  const scrollRef = useRef<HTMLDivElement>(null);
  // Virtualization depends on a scroll element only present after mount; gate it
  // so SSR/CSR markup matches and we avoid hydration warnings.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const virtualizer = useVirtualizer({
    count: mounted ? rows.length : 0,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => rowHeight,
    overscan: 12,
  });

  const totalHeight = virtualizer.getTotalSize();
  const virtualRows = virtualizer.getVirtualItems();
  const paddingTop = virtualRows[0]?.start ?? 0;
  const paddingBottom =
    virtualRows.length > 0 ? totalHeight - (virtualRows.at(-1)!.end ?? 0) : 0;

  return (
    <div
      ref={scrollRef}
      className="relative overflow-auto"
      style={{ height }}
    >
      <table className="w-full border-collapse">
        <thead className="sticky top-0 z-10 bg-panel">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} className="border-b border-line">
              {headerGroup.headers.map((header) => {
                const canSort = header.column.getCanSort();
                const sorted = header.column.getIsSorted();
                return (
                  <th
                    key={header.id}
                    className={cn(
                      'select-none px-[14px] py-[9px] text-left',
                      'font-mono text-[9.5px] font-semibold uppercase tracking-[0.12em] text-ink-3',
                      canSort && 'cursor-pointer hover:text-ink-1',
                      header.column.columnDef.meta &&
                        (header.column.columnDef.meta as { align?: string }).align === 'right' &&
                        'text-right',
                      header.column.columnDef.meta &&
                        (header.column.columnDef.meta as { align?: string }).align === 'center' &&
                        'text-center',
                    )}
                    style={{
                      width:
                        header.getSize() && header.getSize() !== 150
                          ? header.getSize()
                          : undefined,
                    }}
                    onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                  >
                    {header.isPlaceholder ? null : (
                      <span className="inline-flex items-center gap-1">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {sorted === 'asc' && <span aria-hidden>▲</span>}
                        {sorted === 'desc' && <span aria-hidden>▼</span>}
                      </span>
                    )}
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody>
          {paddingTop > 0 && (
            <tr aria-hidden>
              <td colSpan={table.getAllLeafColumns().length} style={{ height: paddingTop }} />
            </tr>
          )}
          {virtualRows.map((vRow) => {
            const row = rows[vRow.index] as Row<TData>;
            const isSelected = selectedRowId != null && row.id === selectedRowId;
            return (
              <tr
                key={row.id}
                data-row-id={row.id}
                className={cn(
                  'border-b border-line-soft transition-colors',
                  onRowClick && 'cursor-pointer',
                  isSelected
                    ? 'bg-nfq-blueBg/60'
                    : 'hover:bg-panel-hover',
                )}
                style={{ height: rowHeight }}
                onClick={onRowClick ? () => onRowClick(row.original as TData) : undefined}
              >
                {row.getVisibleCells().map((cell) => {
                  const meta = cell.column.columnDef.meta as
                    | { align?: 'left' | 'right' | 'center'; muted?: boolean }
                    | undefined;
                  return (
                    <td
                      key={cell.id}
                      className={cn(
                        'px-[14px] align-middle text-[12px] text-ink-1',
                        meta?.align === 'right' && 'text-right tabular-nums',
                        meta?.align === 'center' && 'text-center',
                        meta?.muted && 'text-ink-3',
                      )}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  );
                })}
              </tr>
            );
          })}
          {paddingBottom > 0 && (
            <tr aria-hidden>
              <td colSpan={table.getAllLeafColumns().length} style={{ height: paddingBottom }} />
            </tr>
          )}
          {mounted && rows.length === 0 && (
            <tr>
              <td
                colSpan={table.getAllLeafColumns().length}
                className="px-[14px] py-12 text-center text-[12px] text-ink-3"
              >
                No matching datapoints.
              </td>
            </tr>
          )}
          {!mounted && (
            <tr aria-hidden>
              <td
                colSpan={table.getAllLeafColumns().length}
                className="px-[14px] py-10 text-center text-[11px] text-ink-3"
              >
                Loading catalogue…
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
