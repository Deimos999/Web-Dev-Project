import apiClient from './api';

export const categoryService = {
  getAllCategories: async () => {
    const response = await apiClient.get('/categories');
    return response.data;
  },

  getCategoryById: async (id) => {
    const response = await apiClient.get(`/categories/${id}`);
    return response.data;
  },

  getCategoryWithEvents: async (id) => {
    const response = await apiClient.get(`/categories/${id}`);
    return response.data;
  },

  createCategory: async (categoryData) => {
    const response = await apiClient.post('/categories', categoryData);
    return response.data;
  },

  updateCategory: async (id, categoryData) => {
    const response = await apiClient.patch(`/categories/${id}`, categoryData);
    return response.data;
  },

  deleteCategory: async (id) => {
    const response = await apiClient.delete(`/categories/${id}`);
    return response.data;
  },

  getPopularCategories: async (limit = 5) => {
    const response = await apiClient.get('/categories');
    return response.data.slice(0, limit);
  },
};