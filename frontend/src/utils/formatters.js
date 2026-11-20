/**
 * Format numeric decibel values with 1 decimal place and unit
 */
export function formatDecibels(value) {
  if (value === null || value === undefined || isNaN(value)) {
    return '-- dB(A)';
  }
  return `${Number(value).toFixed(1)} dB(A)`;
}

/**
 * Format timestamps into locale string
 */
export function formatDateTime(isoString) {
  if (!isoString) return '--';
  const date = new Date(isoString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

/**
 * Format full date and time
 */
export function formatFullDate(isoString) {
  if (!isoString) return '--';
  return new Date(isoString).toLocaleString();
}

