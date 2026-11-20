import api from './api';

export const stationService = {
  /**
   * Fetch all registered noise monitoring stations
   */
  getAll: (params = {}) => api.get('/stations', { params }),

  /**
   * Get single station details by ID
   */
  getById: (id) => api.get(`/stations/${id}`),

  /**
   * Register a new station
   */
  create: (stationData) => api.post('/stations', stationData),
};

