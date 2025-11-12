import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3006/api',
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor: añadir token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth-token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: refresh token on 401
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Handle token refresh
      const refreshToken = localStorage.getItem('refresh-token');
      if (refreshToken) {
        try {
          const { data } = await axios.post(
            `${import.meta.env.VITE_API_URL || 'http://localhost:3006/api'}/auth/refresh`,
            { refreshToken }
          );

          if (data.accessToken) {
            localStorage.setItem('auth-token', data.accessToken);
            // Retry the original request
            const config = error.config;
            config.headers.Authorization = `Bearer ${data.accessToken}`;
            return apiClient(config);
          }
        } catch (refreshError) {
          // Refresh failed, clear tokens and redirect to login
          localStorage.removeItem('auth-token');
          localStorage.removeItem('refresh-token');
          localStorage.removeItem('auth-storage'); // Clear Zustand persist
          window.location.href = '/login';
        }
      } else {
        // No refresh token available, redirect to login
        localStorage.removeItem('auth-token');
        localStorage.removeItem('refresh-token');
        localStorage.removeItem('auth-storage'); // Clear Zustand persist
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
