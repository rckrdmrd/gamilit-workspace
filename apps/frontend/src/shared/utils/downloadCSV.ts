/**
 * downloadCSV - Shared utility for CSV file downloads
 *
 * Replaces the duplicated pattern found in 13+ admin files:
 * createElement('a') + blob download + click + revoke
 *
 * @param data - Array of objects to export
 * @param headers - Column headers mapping { key: label }
 * @param filename - Download filename (without .csv extension)
 *
 * @example
 * ```ts
 * downloadCSV(
 *   logs,
 *   { id: 'ID', email: 'Email', status: 'Status' },
 *   'audit-logs'
 * );
 * ```
 */
export function downloadCSV<T extends Record<string, unknown>>(
  data: T[],
  headers: Record<string, string>,
  filename: string,
): void {
  if (data.length === 0) return;

  const headerKeys = Object.keys(headers);
  const headerLabels = Object.values(headers);

  const csvRows = [
    headerLabels.join(','),
    ...data.map((row) =>
      headerKeys
        .map((key) => {
          const value = row[key];
          const str = value == null ? '' : String(value);
          return `"${str.replace(/"/g, '""')}"`;
        })
        .join(','),
    ),
  ];

  const csvContent = csvRows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

/**
 * downloadBlobAsFile - Downloads a pre-built Blob as a file
 *
 * For cases where the CSV content is already built (e.g., from API response).
 *
 * @param blob - The Blob to download
 * @param filename - Full filename including extension
 */
export function downloadBlobAsFile(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
