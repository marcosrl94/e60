/**
 * Tiny dependency-free CSV parser tuned for portfolio extracts.
 *
 * Handles quoted fields, escaped quotes ("") inside quotes, and
 * auto-detects the delimiter (comma vs semicolon — Spanish banks
 * routinely export with `;`). Returns parsed rows as raw strings so
 * downstream code decides how to coerce each column.
 */

export interface ParsedCsv {
  headers: string[];
  rows: string[][];
  delimiter: ',' | ';';
}

export function parseCsv(text: string): ParsedCsv {
  const delimiter = detectDelimiter(text);
  const lines: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i]!;
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
      continue;
    }
    if (ch === '"') {
      inQuotes = true;
    } else if (ch === delimiter) {
      row.push(field);
      field = '';
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      row.push(field);
      field = '';
      if (row.some((f) => f !== '')) lines.push(row);
      row = [];
    } else {
      field += ch;
    }
  }
  if (field !== '' || row.length > 0) {
    row.push(field);
    if (row.some((f) => f !== '')) lines.push(row);
  }

  if (lines.length === 0) return { headers: [], rows: [], delimiter };
  const [headers, ...rest] = lines;
  return { headers: headers!.map((h) => h.trim()), rows: rest, delimiter };
}

function detectDelimiter(text: string): ',' | ';' {
  const firstLine = text.split(/\r?\n/, 1)[0] ?? '';
  const commas = (firstLine.match(/,/g) ?? []).length;
  const semis = (firstLine.match(/;/g) ?? []).length;
  return semis > commas ? ';' : ',';
}
