import apiClient from './api';

export const paymentService = {
  initiatePayment: async (registrationId, paymentData) => {
    const response = await apiClient.post('/payments', {
      registrationId,
      ...paymentData,
    });
    return response.data;
  },

  getPaymentStatus: async (paymentId) => {
    const response = await apiClient.get(`/payments/${paymentId}`);
    return response.data;
  },

  getUserPayments: async () => {
    const response = await apiClient.get('/payments');
    return response.data;
  },

  verifyPayment: async (paymentId, verificationData) => {
    const response = await apiClient.post(`/payments/${paymentId}/verify`, verificationData);
    return response.data;
  },

  getPaymentReceipt: async (paymentId) => {
    const response = await apiClient.get(`/payments/${paymentId}/receipt`, {
      responseType: 'blob',
    });
    return response.data;
  },

  refundPayment: async (paymentId, reason) => {
    const response = await apiClient.post(`/payments/${paymentId}/refund`, { reason });
    return response.data;
  },

  getPaymentStatistics: async () => {
    const response = await apiClient.get('/payments/statistics');
    return response.data;
  },

  createPaymentIntent: async (amount, currency = 'USD') => {
    const response = await apiClient.post('/payments/intent', { amount, currency });
    return response.data;
  },
};