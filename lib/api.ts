import axios from 'axios';

// Use relative path — Vercel routes /api/v1/* to the Python serverless function
// Hardcoded to ensure we never accidentally hit localhost in production if env is misconfigured
const baseURL = "/api/v1";

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

// Handle unauthorized — redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        // Clear stored auth and redirect
        localStorage.removeItem('civic-radar-auth');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
