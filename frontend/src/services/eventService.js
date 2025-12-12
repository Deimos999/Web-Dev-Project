import apiClient from './api';

export const eventService = {
  getAllEvents: async (filters = {}) => {
    try {
      const response = await apiClient.get('/events', { params: filters });
      return response.data;
    } catch (err) {
      console.error('Error fetching all events:', err);
      throw err;
    }
  },

  getEventById: async (id) => {
    try {
      const response = await apiClient.get(`/events/${id}`);
      return response.data;
    } catch (err) {
      console.error(`Error fetching event with id ${id}:`, err);
      throw err;
    }
  },

  createEvent: async (eventData) => {
    try {
      const response = await apiClient.post('/events', eventData);
      return response.data;
    } catch (err) {
      console.error('Error creating event:', err.response?.data || err);
      throw err;
    }
  },

  updateEvent: async (id, eventData) => {
    try {
      const response = await apiClient.patch(`/events/${id}`, eventData);
      return response.data;
    } catch (err) {
      console.error(`Error updating event ${id}:`, err.response?.data || err);
      throw err;
    }
  },

  deleteEvent: async (id) => {
    try {
      // Backend handles authorization (Admin or Organizer)
      const response = await apiClient.delete(`/events/${id}`);
      return response.data;
    } catch (err) {
      console.error(`Error deleting event ${id}:`, err.response?.data || err);
      throw err;
    }
  },

  searchEvents: async (query) => {
    try {
      const response = await apiClient.get('/events', { params: { search: query } });
      return response.data;
    } catch (err) {
      console.error(`Error searching events:`, err.response?.data || err);
      throw err;
    }
  },

  getEventsByCategory: async (categoryId) => {
    try {
      const response = await apiClient.get('/events', { params: { categoryId } });
      return response.data;
    } catch (err) {
      console.error(`Error fetching events by category:`, err.response?.data || err);
      throw err;
    }
  },
};
