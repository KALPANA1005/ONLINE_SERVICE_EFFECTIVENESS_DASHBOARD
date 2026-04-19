import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5000/api' });

API.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  if (user?.token) config.headers.Authorization = `Bearer ${user.token}`;
  return config;
});

API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Auth
export const loginAPI = (data) => API.post('/auth/login', data);
export const registerAPI = (data) => API.post('/auth/register', data);
export const getMeAPI = () => API.get('/auth/me');

// User
export const getUserDashboardAPI = () => API.get('/user/dashboard');
export const updateProfileAPI = (data) => API.put('/user/profile', data);
export const getNotificationsAPI = () => API.get('/user/notifications');
export const getUserServicesAPI = () => API.get('/user/services'); // ← user route for services

// Admin
export const getAdminDashboardAPI = () => API.get('/admin/dashboard');
export const getAllUsersAPI = () => API.get('/admin/users');
export const createUserAPI = (data) => API.post('/admin/users', data);
export const updateUserAPI = (id, data) => API.put(`/admin/users/${id}`, data);
export const deleteUserAPI = (id) => API.delete(`/admin/users/${id}`);
export const getAllServicesAPI = () => API.get('/admin/services');
export const createServiceAPI = (data) => API.post('/admin/services', data);
export const updateServiceAPI = (id, data) => API.put(`/admin/services/${id}`, data);
export const deleteServiceAPI = (id) => API.delete(`/admin/services/${id}`);
export const exportCSVAPI = () => API.get('/admin/export', { responseType: 'blob' });

// Feedback
export const submitFeedbackAPI = (data) => API.post('/feedback', data);
export const getUserFeedbacksAPI = (page = 1) => API.get(`/feedback/my?page=${page}&limit=10`);
export const getAllFeedbacksAPI = () => API.get('/feedback/all');
export const updateFeedbackStatusAPI = (id, status) => API.put(`/feedback/${id}/status`, { status });

export default API;
