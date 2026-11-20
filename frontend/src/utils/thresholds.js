/**
 * Standard regulatory limits and color indicators based on CPCB / WHO standards.
 */
export const ZONE_LIMITS = {
  SILENT: { day: 50.0, night: 40.0 },
  RESIDENTIAL: { day: 55.0, night: 45.0 },
  COMMERCIAL: { day: 65.0, night: 55.0 },
  INDUSTRIAL: { day: 75.0, night: 70.0 },
};

/**
 * Determine if current local time is daytime (06:00 to 22:00)
 */
export function isDaytime(date = new Date()) {
  const hour = date.getHours();
  return hour >= 6 && hour < 22;
}

/**
 * Returns permissible limit for zone
 */
export function getZoneThreshold(zone) {
  const key = (zone || 'RESIDENTIAL').toUpperCase();
  const limits = ZONE_LIMITS[key] || ZONE_LIMITS.RESIDENTIAL;
  return isDaytime() ? limits.day : limits.night;
}

/**
 * Returns severity status: 'safe' | 'warning' | 'critical'
 */
export function getNoiseSeverity(decibel, zone) {
  if (decibel === null || decibel === undefined) return 'safe';
  const threshold = getZoneThreshold(zone);
  const diff = decibel - threshold;

  if (diff <= 0) return 'safe';
  if (diff <= 10) return 'warning';
  return 'critical';
}

