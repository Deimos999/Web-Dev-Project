import apiClient from './api';

export const walletService = {
  getMyWallet: async () => {
    const response = await apiClient.get('/wallet/me');
    return response.data;
  },

  topUp: async (amount) => {
    const response = await apiClient.post('/wallet/top-up', { amount });
    return response.data;
  },

  payForRegistration: async (registrationId) => {
    const response = await apiClient.post('/wallet/pay', { registrationId });
    return response.data;
  },
};


