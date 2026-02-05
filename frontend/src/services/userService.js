import apiClient from './api';

export const userService = {
  // Admin: list all users with wallet info
  async getAllUsers() {
    const response = await apiClient.get('/users');
    return response.data;
  },

  // Admin: update a user's wallet balance
  async updateWalletBalance(userId, balance) {
    const response = await apiClient.put(`/users/${userId}/wallet`, {
      balance,
    });
    return response.data;
  },
};


