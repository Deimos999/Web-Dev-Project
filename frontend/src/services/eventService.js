import apiClient from './api';

export const eventService = {
  getAllEvents: async (filters = {}) => {
    const response = await apiClient.get('/events', { params: filters });
    return response.data;
  },

  getEventById: async (id) => {
    const response = await apiClient.get(`/events/${id}`);
    return response.data;
  },

  getEventsByCategory: async (categoryId) => {
    const response = await apiClient.get('/events', {
      params: { categoryId },
    });
    return response.data;
  },

  searchEvents: async (query) => {
    const response = await apiClient.get('/events', {
      params: { search: query },
    });
    return response.data;
  },

  createEvent: async (eventData) => {
    const response = await apiClient.post('/events', eventData);
    return response.data;
  },

  updateEvent: async (id, eventData) => {
    const response = await apiClient.put(`/events/${id}`, eventData);
    return response.data;
  },

  deleteEvent: async (id) => {
    const response = await apiClient.delete(`/events/${id}`);
    return response.data;
  },

  getUpcomingEvents: async () => {
    const response = await apiClient.get('/events', {
      params: { upcoming: true },
    });
    return response.data;
  },

  getEventStatistics: async (id) => {
    const response = await apiClient.get(`/events/${id}/statistics`);
    return response.data;
  },
};