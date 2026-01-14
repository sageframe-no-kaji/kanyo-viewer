/**
 * Timezone detection and management utilities
 */

import { api } from './api';

const TIMEZONE_STORAGE_KEY = 'kanyo_visitor_timezone';

/**
 * Detect visitor's timezone
 * Priority: 1. localStorage, 2. JavaScript Intl API, 3. IP-based detection
 */
export async function detectVisitorTimezone() {
  // Check localStorage first
  const stored = localStorage.getItem(TIMEZONE_STORAGE_KEY);
  if (stored) return stored;

  // Try JavaScript Intl API
  try {
    const jsTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (jsTimezone) {
      setVisitorTimezone(jsTimezone);
      return jsTimezone;
    }
  } catch {
    // Intl API failed
  }

  // Fallback to IP-based detection
  try {
    const ipTimezone = await api.getVisitorTimezone();
    if (ipTimezone) {
      setVisitorTimezone(ipTimezone);
      return ipTimezone;
    }
  } catch {
    // IP detection failed
  }

  // Ultimate fallback
  const fallback = 'America/New_York';
  setVisitorTimezone(fallback);
  return fallback;
}

/**
 * Store visitor timezone in localStorage
 */
export function setVisitorTimezone(timezone) {
  localStorage.setItem(TIMEZONE_STORAGE_KEY, timezone);
}

/**
 * Get stored visitor timezone (or null if not set)
 */
export function getStoredVisitorTimezone() {
  return localStorage.getItem(TIMEZONE_STORAGE_KEY);
}

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
