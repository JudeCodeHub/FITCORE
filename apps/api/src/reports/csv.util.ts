export interface ReportColumn<T> {
  header: string;
  value: (row: T) => string | number;
}

function escapeCsvField(value: string | number): string {
  const str = String(value);
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

export function toCsv<T>(rows: T[], columns: ReportColumn<T>[]): string {
  const header = columns.map((c) => escapeCsvField(c.header)).join(',');
  const lines = rows.map((row) =>
    columns.map((c) => escapeCsvField(c.value(row))).join(','),
  );
  return [header, ...lines].join('\r\n') + '\r\n';
}
