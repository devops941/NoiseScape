import api from './api';

export const predictionService = {
  /**
   * Predict noise levels for any custom location and time using trained ML model
   */
  predictNoise: (predictionData) => api.post('/predict', predictionData),
};

