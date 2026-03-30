/**
 * Minimal RFC 4180-style CSV helpers (no external deps).
 * UTF-8 BOM prefix optional for Excel; see callers.
 */

export function escapeCsvCell(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "";
  const s = String(value);
  if (/[",\r\n]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export function csvRow(
  cells: (string | number | null | undefined)[]
): string {
  return cells.map(escapeCsvCell).join(",");
}

export function csvDocument(
  header: string[],
  rows: (string | number | null | undefined)[][]
): string {
  const lines = [csvRow(header), ...rows.map(csvRow)];
  return lines.join("\r\n");
}
