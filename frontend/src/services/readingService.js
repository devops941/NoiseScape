import api from './api';

export const readingService = {
  /**
   * Fetch recent sound readings
   */
  getReadings: (params = { limit: 100 }) => api.get('/readings', { params }),

  /**
   * Ingest a new sound measurement from a sensor / recording node
   */
  ingest: (readingData) => api.post('/readings', readingData),

  /**
   * Fetch system summary metrics
   */
  getSummary: () => api.get('/analytics/summary'),

  /**
   * Fetch zone compliance metrics
   */
  getZoneCompliance: () => api.get('/analytics/zone-compliance'),
};

