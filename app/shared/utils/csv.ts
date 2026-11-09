export type CsvCell = string | number | null | undefined;

/** Cells that a spreadsheet would read as a formula get a leading apostrophe. */
const FORMULA_START = /^[=+\-@\t\r]/;

function escapeCell(cell: CsvCell): string {
  if (cell === null || cell === undefined) return '';
  const text = typeof cell === 'string' && FORMULA_START.test(cell) ? `'${cell}` : String(cell);
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

/** Rows to CSV text (RFC 4180: comma separated, CRLF line breaks). */
export function toCsv(rows: CsvCell[][]): string {
  return rows.map((row) => row.map(escapeCell).join(',')).join('\r\n');
}
