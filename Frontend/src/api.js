import axios from "axios";

const API = axios.create({ 
  baseURL: "http://localhost:4000/api" 
});

// Add token to all requests
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// AUTH
export const register = (data) => API.post("/auth/register", data);
export const login = (data) => API.post("/auth/login", data);

// EVENTS
export const getEvents = () => API.get("/events");
export const createEvent = (data) => API.post("/events", data);
export const deleteEvent = (id) => API.delete(`/events/${id}`);

// REGISTRATIONS
export const registerUser = (data) => API.post("/registration", data); // Auth required
export const getMyRegistrations = () => API.get("/registration/user/my-registrations"); // Auth only
export const getRegistrationsByEventPublic = (eventId) => API.get(`/registration/public/event/${eventId}`); // Guests
export const deleteRegistration = (id) => API.delete(`/registration/${id}`);

// CATEGORIES
export const getCategories = () => API.get("/categories");

export default API;
