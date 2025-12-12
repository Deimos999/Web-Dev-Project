import apiClient from './api';

export const ticketService = {
  getUserTickets: async () => {
    // Get user's registrations which include tickets
    const response = await apiClient.get('/registration/user/my-registrations');
    return response.data;
  },

  getTicketById: async (id) => {
    const response = await apiClient.get(`/tickets/${id}`);
    return response.data;
  },

  getTicketsByEvent: async (eventId) => {
    const response = await apiClient.get(`/tickets/event/${eventId}`);
    return response.data;
  },

  createTicket: async (eventId, ticketData) => {
    const response = await apiClient.post('/tickets', {
      eventId,
      ...ticketData,
    });
    return response.data;
  },

  updateTicket: async (id, ticketData) => {
    const response = await apiClient.put(`/tickets/${id}`, ticketData);
    return response.data;
  },

  deleteTicket: async (id) => {
    const response = await apiClient.delete(`/tickets/${id}`);
    return response.data;
  },

  downloadTicket: async (id) => {
    // You may need to implement this in backend
    const response = await apiClient.get(`/tickets/${id}`, {
      responseType: 'blob',
    });
    return response.data;
  },

  resendTicket: async (id) => {
    // You may need to implement this in backend
    const response = await apiClient.post(`/tickets/${id}/resend`);
    return response.data;
  },
};