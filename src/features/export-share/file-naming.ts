/**
 * Export file names: ASCII-only with a zero-padded order number so the gallery and
 * target apps keep the carousel order (some apps mangle non-ASCII names).
 */
export function exportFileName(date: Date, purposeId: string, index: number, total: number): string {
  const pad = Math.max(2, String(total).length);
  const d = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
  const purpose = purposeId.replace(/[^a-z0-9-]/gi, '').toLowerCase() || 'set';
  return `cutpick-${d}-${purpose}-${String(index + 1).padStart(pad, '0')}.jpg`;
}
