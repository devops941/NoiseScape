import api from './api';

export const alertService = {
  /**
   * Fetch threshold breach alerts
   */
  getAlerts: (params = {}) => api.get('/alerts', { params }),

  /**
   * Resolve / acknowledge an alert
   */
  resolve: (id) => api.patch(`/alerts/${id}/resolve`, { is_resolved: true }),
};

