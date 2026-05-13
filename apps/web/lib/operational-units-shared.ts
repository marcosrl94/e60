/**
 * Operational scope · client-safe types + helpers.
 *
 * Lives in its own module so client components (NewEntryForm,
 * Inventory by-location view) can import it without dragging in
 * `next/headers` from the server-only `operational-units.ts`.
 */

export type OperationalUnitKind =
  | 'reporting_entity'
  | 'subsidiary'
  | 'business_line'
  | 'facility'
  | 'country_aggregate';

export interface OperationalUnit {
  id: string;
  parentId: string | null;
  kind: OperationalUnitKind;
  name: string;
  shortCode: string | null;
  country: string | null;
}

/**
 * Build a flat ordered list (root first, then DFS by parent) ready to
 * render in a `<select>` with indentation per depth.
 */
export function flattenTreeForSelect(
  units: OperationalUnit[],
): Array<{ unit: OperationalUnit; depth: number }> {
  const byParent = new Map<string | null, OperationalUnit[]>();
  for (const u of units) {
    const list = byParent.get(u.parentId) ?? [];
    list.push(u);
    byParent.set(u.parentId, list);
  }
  const order: Record<OperationalUnitKind, number> = {
    reporting_entity: 0,
    subsidiary: 1,
    business_line: 2,
    country_aggregate: 3,
    facility: 4,
  };
  for (const list of byParent.values()) {
    list.sort(
      (a, b) => order[a.kind] - order[b.kind] || a.name.localeCompare(b.name),
    );
  }
  const out: Array<{ unit: OperationalUnit; depth: number }> = [];
  function walk(parentId: string | null, depth: number) {
    const children = byParent.get(parentId) ?? [];
    for (const u of children) {
      out.push({ unit: u, depth });
      walk(u.id, depth + 1);
    }
  }
  walk(null, 0);
  return out;
}
