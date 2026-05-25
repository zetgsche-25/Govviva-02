import axios from 'axios';

const API_URL =
  import.meta.env.VITE_API_URL?.replace(/\/$/, '') ||
  'http://localhost:3000';

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json'
  }
}) as any;

api.interceptors.request.use((config: any) => {
  const token = localStorage.getItem('govviva_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response: any) => {
    return response.data;
  },
  (error: any) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('govviva_token');
      window.dispatchEvent(new Event('auth_expired'));
      return Promise.reject(new Error('Sessão expirada. Por favor, faça login novamente.'));
    }
    const apiError = error.response?.data?.error || 'Erro na requisição';
    return Promise.reject(new Error(apiError));
  }
);
