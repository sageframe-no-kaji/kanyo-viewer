/**
 * Timezone utilities
 *
 * Event times are always presented in the STREAM's timezone, so what the
 * viewer sees matches what the camera saw.
 */

/**
 * Format time in a specific timezone
 */
export function formatTimeInTimezone(date, timezone, options = {}) {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
    ...options
  }).format(date);
}

/**
 * Get numeric time parts of a date as seen in a timezone.
 * Returns { hour, minute, second } in 24-hour form.
 */
export function getTimePartsInTimezone(date, timezone) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hourCycle: 'h23'
  }).formatToParts(date);

  const byType = {};
  for (const part of parts) {
    if (part.type !== 'literal') {
      byType[part.type] = parseInt(part.value, 10);
    }
  }
  return { hour: byType.hour, minute: byType.minute, second: byType.second };
}

/**
 * Get date string in timezone (YYYY-MM-DD)
 */
export function getDateInTimezone(date, timezone) {
  return new Intl.DateTimeFormat('en-CA', { // en-CA gives YYYY-MM-DD format
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date);
}

/**
 * Check if device is touch-enabled
 */
export function isTouchDevice() {
  return (('ontouchstart' in window) ||
    (navigator.maxTouchPoints > 0) ||
    (navigator.msMaxTouchPoints > 0) ||
    window.matchMedia('(pointer: coarse)').matches);
}
