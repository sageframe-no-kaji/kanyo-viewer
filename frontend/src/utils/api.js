/**
 * API client for Kanyo Viewer backend
 */

const API_BASE = import.meta.env.VITE_API_BASE || '/api';

export const api = {
  /**
   * Get all streams with today's stats
   */
  async getStreams() {
    const response = await fetch(`${API_BASE}/streams`);
    if (!response.ok) throw new Error('Failed to fetch streams');
    return response.json();
  },

  /**
   * Get stream detail with 24h stats
   */
  async getStreamDetail(streamId) {
    const response = await fetch(`${API_BASE}/streams/${streamId}`);
    if (!response.ok) throw new Error('Failed to fetch stream detail');
    return response.json();
  },

  /**
   * Get events for a specific date
   */
  async getStreamEvents(streamId, date = null) {
    const url = date
      ? `${API_BASE}/streams/${streamId}/events?date=${date}`
      : `${API_BASE}/streams/${streamId}/events`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch events');
    return response.json();
  },

  /**
   * Get stats for a time range
   */
  async getStreamStats(streamId, range = '24h') {
    const response = await fetch(`${API_BASE}/streams/${streamId}/stats?range=${range}`);
    if (!response.ok) throw new Error('Failed to fetch stats');
    return response.json();
  },

  /**
   * Get dates with events in a range
   */
  async getDatesWithEvents(streamId, startDate, endDate) {
    const response = await fetch(`${API_BASE}/streams/${streamId}/dates-with-events?start_date=${startDate}&end_date=${endDate}`);
    if (!response.ok) throw new Error('Failed to fetch dates with events');
    return response.json();
  },

  /**
   * Detect visitor timezone from IP
   */
  async getVisitorTimezone() {
    try {
      const response = await fetch(`${API_BASE}/visitor/timezone`);
      if (!response.ok) return null;
      const data = await response.json();
      return data.timezone;
    } catch {
      return null;
    }
  },

  /**
   * Get clip URL
   */
  getClipUrl(streamId, date, filename) {
    return `${API_BASE}/clips/${streamId}/${date}/${filename}`;
  }
};
