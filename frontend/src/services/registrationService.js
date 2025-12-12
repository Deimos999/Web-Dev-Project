import apiClient from './api';

export const registrationService = {
  registerForEvent: async (eventId, ticketId = null) => {
    const response = await apiClient.post('/registration', {
      eventId,
      ticketId,
    });
    return response.data;
  },

  getUserRegistrations: async () => {
    try {
      const response = await apiClient.get('/registration/user/my-registrations');
      // Handle both array and object responses
      return Array.isArray(response.data) ? response.data : [response.data];
    } catch (error) {
      console.error('Registration fetch error:', error);
      throw error;
    }
  },

  getRegistrationById: async (id) => {
    const response = await apiClient.get(`/registration/${id}`);
    return response.data;
  },

  getRegistrationsByEvent: async (eventId) => {
    const response = await apiClient.get(`/registration/event/${eventId}`);
    return response.data;
  },

  checkInAttendee: async (id) => {
    const response = await apiClient.post(`/registration/${id}/check-in`);
    return response.data;
  },

  cancelRegistration: async (id) => {
    const response = await apiClient.post(`/registration/${id}/cancel`);
    return response.data;
  },

  checkRegistrationStatus: async (eventId) => {
    try {
      const response = await apiClient.get(`/registration/event/${eventId}`);
      const registrations = Array.isArray(response.data) ? response.data : [response.data];
      return { registered: registrations.length > 0 };
    } catch {
      return { registered: false };
    }
  },
};