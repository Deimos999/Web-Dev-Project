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

  createProposal: async (eventData) => {
    try {
      const response = await apiClient.post('/events/proposals', eventData);
      return response.data;
    } catch (err) {
      console.error('Error creating event proposal:', err.response?.data || err);
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

  getProposals: async () => {
    try {
      const response = await apiClient.get('/events/proposals');
      return response.data;
    } catch (err) {
      console.error('Error fetching event proposals:', err.response?.data || err);
      throw err;
    }
  },

  approveProposal: async (id) => {
    try {
      const response = await apiClient.post(`/events/proposals/${id}/approve`);
      return response.data;
    } catch (err) {
      console.error('Error approving event proposal:', err.response?.data || err);
      throw err;
    }
  },

  rejectProposal: async (id, reason) => {
    try {
      const response = await apiClient.post(`/events/proposals/${id}/reject`, {
        reason,
      });
      return response.data;
    } catch (err) {
      console.error('Error rejecting event proposal:', err.response?.data || err);
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

  searchEvents: async (query, extraFilters = {}) => {
    try {
      const response = await apiClient.get('/events', { 
        params: { 
          search: query,
          ...extraFilters,
        } 
      });
      return response.data;
    } catch (err) {
      console.error(`Error searching events:`, err.response?.data || err);
      throw err;
    }
  },

  getEventsByCategory: async (categoryId, extraFilters = {}) => {
    try {
      const response = await apiClient.get('/events', { 
        params: { 
          categoryId,
          ...extraFilters,
        } 
      });
      return response.data;
    } catch (err) {
      console.error(`Error fetching events by category:`, err.response?.data || err);
      throw err;
    }
  },
};
