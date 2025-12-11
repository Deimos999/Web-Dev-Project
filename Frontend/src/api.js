import axios from "axios";

const API = axios.create({ baseURL: "http://localhost:4000/api" });

// Add token interceptor
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Events 
export const getEvents = () => API.get("/events");
export const createEvent = (data) => API.post("/events", data);
export const deleteEvent = (id) => API.delete(`/events/${id}`);

// Registrations
export const registerUser = (data) => API.post("/registaration", data);
export const getRegistrations = () => API.get("/registaration");

// Delete a registration by ID
export const deleteRegistration = (id) => API.delete(`/registaration/${id}`);
