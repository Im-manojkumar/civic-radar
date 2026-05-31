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

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    try {
      const authData = localStorage.getItem('civic-radar-auth');
      if (authData) {
        const { state } = JSON.parse(authData);
        if (state?.token) {
          config.headers['Authorization'] = `Bearer ${state.token}`;
        }
      }
    } catch (e) {
      // ignore
    }
  }
  return config;
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
