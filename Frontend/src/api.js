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

// AUTH API
export const register = (data) => API.post("/auth/register", data);
export const login = (data) => API.post("/auth/login", data);

// EVENTS API
export const getEvents = () => API.get("/events");
export const createEvent = (data) => API.post("/events", data);
export const deleteEvent = (id) => API.delete(`/events/${id}`);

// REGISTRATIONS API
export const registerUser = (data) => API.post("/registration", data);
export const getRegistrations = () => API.get("/registration/user/my-registrations");
export const deleteRegistration = (id) => API.post(`/registration/${id}/cancel`);

// CATEGORIES API
export const getCategories = () => API.get("/categories");

export default API;
