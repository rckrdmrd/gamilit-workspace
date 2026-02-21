/**
 * API Client - Base Axios Instance
 *
 * Centralized HTTP client for all API requests with interceptors
 * for authentication, error handling, and request/response transformation.
 */

import axios from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { API_CONFIG, FEATURE_FLAGS } from '@/config/api.config';
import { camelToSnake } from '@/utils/transformKeys';

// ============================================================================
// CONFIGURATION
// ============================================================================

let isRedirectingToLogin = false;
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
};

// ============================================================================
// AXIOS INSTANCE
// ============================================================================

/**
 * Base Axios instance with default configuration
 * Uses unified API config from @/config/api.config
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_CONFIG.baseURL,
  timeout: API_CONFIG.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============================================================================
// REQUEST INTERCEPTOR
// ============================================================================

/**
 * Request interceptor to add authentication tokens and tenant headers
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Add JWT token from localStorage
    const token = localStorage.getItem('auth-token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add tenant-id header for multi-tenant support
    const tenantId = localStorage.getItem('tenant-id');
    if (tenantId && config.headers) {
      config.headers['X-Tenant-Id'] = tenantId;
    }

    // Transform request data from camelCase to snake_case
    if (config.data && typeof config.data === 'object') {
      config.data = camelToSnake(config.data);
    }

    // Transform query params from camelCase to snake_case
    if (config.params && typeof config.params === 'object') {
      config.params = camelToSnake(config.params);
    }

    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  },
);

// ============================================================================
// RESPONSE INTERCEPTOR
// ============================================================================

/**
 * Response interceptor to handle errors and token refresh
 */
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Unwrap backend response format: { success, data, timestamp, path }
    // Extract the inner "data" field if it exists (from TransformResponseInterceptor)
    if (
      response.data &&
      typeof response.data === 'object' &&
      'success' in response.data &&
      'data' in response.data
    ) {
      response.data = response.data.data;
    }

    // NOTE: Do NOT transform response data from snake_case to camelCase
    // All frontend types (StudentMonitoring, Classroom, etc.) are defined in snake_case
    // Transformation would cause undefined values when accessing properties
    // See: orchestration/agentes/architecture-analyst/ANALISIS-TEACHER-PORTAL-2025-12-14/01-GAPS-TEACHER-PORTAL.md

    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized - token expired
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers['Authorization'] = 'Bearer ' + token;
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem('refresh-token');

        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const { data } = await axios.post(`${API_CONFIG.baseURL}/auth/refresh`, {
          refreshToken,
        });

        const newToken = data.token;
        localStorage.setItem('auth-token', newToken);

        // Update header for subsequent requests
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

        processQueue(null, newToken);

        originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);

        // Refresh failed - set logout flag
        localStorage.setItem('is_logging_out', 'true');

        // Clear tokens
        localStorage.removeItem('auth-token');
        localStorage.removeItem('refresh-token');
        localStorage.removeItem('auth-storage');

        if (
          typeof window !== 'undefined' &&
          !window.location.pathname.includes('/login') &&
          !isRedirectingToLogin
        ) {
          isRedirectingToLogin = true;
          window.location.href = '/login';
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      console.error('[API] Access forbidden:', error.response.data);
    }

    // Handle 404 Not Found
    if (error.response?.status === 404) {
      // Silent fail for optional endpoints (hints, avatars, etc.)
      const url = error.config?.url || '';
      const optionalEndpoints = ['/hints', '/avatar', '/profile-picture', '/badges'];
      const isOptional = optionalEndpoints.some((endpoint) => url.includes(endpoint));

      if (!isOptional) {
        console.error('[API] Resource not found:', error.config.url);
      }
    }

    // Handle 500 Internal Server Error
    if (error.response?.status === 500) {
      console.error('[API] Server error:', error.response.data);
    }

    // Log error in debug mode
    if (FEATURE_FLAGS.DEBUG_API) {
      console.error('[API Error]', {
        status: error.response?.status,
        url: error.config?.url,
        message: error.message,
        data: error.response?.data,
      });
    }

    return Promise.reject(error);
  },
);

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Set authentication token
 */
export const setAuthToken = (token: string): void => {
  localStorage.setItem('auth-token', token);
};

/**
 * Set refresh token
 */
export const setRefreshToken = (token: string): void => {
  localStorage.setItem('refresh-token', token);
};

/**
 * Clear authentication tokens
 */
export const clearAuthTokens = (): void => {
  localStorage.removeItem('auth-token');
  localStorage.removeItem('refresh-token');
};

/**
 * Get current authentication token
 */
export const getAuthToken = (): string | null => {
  return localStorage.getItem('auth-token');
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return !!getAuthToken();
};

// ============================================================================
// EXPORTS
// ============================================================================

export default apiClient;
