/**
 * API Interceptors
 *
 * Additional request/response interceptors for logging, caching, and monitoring
 */
/* eslint-disable @typescript-eslint/no-explicit-any */

import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios';

// ============================================================================
// REQUEST INTERCEPTORS
// ============================================================================

/**
 * Add timestamp to request
 */
export const timestampInterceptor = (
  config: InternalAxiosRequestConfig,
): InternalAxiosRequestConfig => {
  // Add request timestamp to headers
  if (config.headers) {
    config.headers['X-Request-Time'] = new Date().toISOString();
  }

  // Store start time for performance monitoring
  (config as any).metadata = { startTime: Date.now() };

  return config;
};

/**
 * Add client version to request
 */
export const versionInterceptor = (
  config: InternalAxiosRequestConfig,
): InternalAxiosRequestConfig => {
  const version = import.meta.env.VITE_APP_VERSION || '1.0.0';

  if (config.headers) {
    config.headers['X-Client-Version'] = version;
  }

  return config;
};

/**
 * Add request ID for tracing
 */
export const requestIdInterceptor = (
  config: InternalAxiosRequestConfig,
): InternalAxiosRequestConfig => {
  // Generate unique request ID
  const requestId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  if (config.headers) {
    config.headers['X-Request-Id'] = requestId;
  }

  return config;
};

/**
 * Cache control interceptor
 */
export const cacheControlInterceptor = (
  config: InternalAxiosRequestConfig,
): InternalAxiosRequestConfig => {
  // Add cache control headers for GET requests
  if (config.method?.toLowerCase() === 'get' && config.headers) {
    // Check if cache is explicitly disabled
    const noCache = (config as any).noCache;

    if (noCache) {
      config.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
      config.headers['Pragma'] = 'no-cache';
      config.headers['Expires'] = '0';
    }
  }

  return config;
};

// ============================================================================
// RESPONSE INTERCEPTORS
// ============================================================================

/**
 * Performance monitoring interceptor
 */
export const performanceInterceptor = (response: AxiosResponse): AxiosResponse => {
  const config = response.config as any;

  if (config.metadata?.startTime) {
    const duration = Date.now() - config.metadata.startTime;

    // Log slow requests (> 3 seconds)
    if (duration > 3000) {
      console.warn(`[API] Slow request detected: ${config.url} took ${duration}ms`);
    }

    // Add duration to response for monitoring
    response.headers['X-Response-Time'] = `${duration}ms`;
  }

  return response;
};

/**
 * Cache response interceptor
 */
export const cacheResponseInterceptor = (response: AxiosResponse): AxiosResponse => {
  // Check if response should be cached
  const cacheControl = response.headers['cache-control'];

  if (cacheControl && cacheControl.includes('max-age')) {
    // Extract max-age value
    const maxAgeMatch = cacheControl.match(/max-age=(\d+)/);
    if (maxAgeMatch) {
      const maxAge = parseInt(maxAgeMatch[1]);

      // Add cache metadata to response
      (response as any).cacheMetadata = {
        cached: false,
        expiresAt: new Date(Date.now() + maxAge * 1000).toISOString(),
      };
    }
  }

  return response;
};

/**
 * Data transformation interceptor
 */
export const transformResponseInterceptor = (response: AxiosResponse): AxiosResponse => {
  // Transform date strings to Date objects
  if (response.data && typeof response.data === 'object') {
    response.data = transformDates(response.data);
  }

  return response;
};

/**
 * Recursively transform ISO date strings to Date objects
 */
const transformDates = <T>(obj: T): T => {
  if (obj === null || obj === undefined) return obj;

  if (typeof obj === 'string') {
    // Check if string is ISO date format
    const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;
    if (isoDateRegex.test(obj)) {
      return new Date(obj) as T;
    }
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(transformDates) as T;
  }

  if (typeof obj === 'object') {
    const transformed: Record<string, unknown> = {};
    for (const key in obj as Record<string, unknown>) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        transformed[key] = transformDates((obj as Record<string, unknown>)[key]);
      }
    }
    return transformed as T;
  }

  return obj;
};

// ============================================================================
// LOGGER INTERCEPTOR
// ============================================================================

/**
 * Detailed logging interceptor for development
 */
export const loggerInterceptor = {
  request: (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    if (import.meta.env.VITE_DEBUG_API === 'true') {
      console.group(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
      console.log('Headers:', config.headers);
      console.log('Data:', config.data);
      console.log('Params:', config.params);
      console.groupEnd();
    }
    return config;
  },

  response: (response: AxiosResponse): AxiosResponse => {
    if (import.meta.env.VITE_DEBUG_API === 'true') {
      const config = response.config;
      const duration = (config as any).metadata?.startTime
        ? Date.now() - (config as any).metadata.startTime
        : 0;

      console.group(`[API Response] ${response.status} ${config.url} (${duration}ms)`);
      console.log('Headers:', response.headers);
      console.log('Data:', response.data);
      console.groupEnd();
    }
    return response;
  },

  error: (error: unknown): Promise<never> => {
    if (import.meta.env.VITE_DEBUG_API === 'true') {
      const axiosError = error as { config?: { url?: string }; response?: { status?: number; data?: unknown }; message?: string };
      console.group('[API Error]');
      console.error('URL:', axiosError.config?.url);
      console.error('Status:', axiosError.response?.status);
      console.error('Message:', axiosError.message);
      console.error('Data:', axiosError.response?.data);
      console.groupEnd();
    }
    return Promise.reject(error);
  },
};

// ============================================================================
// ANALYTICS INTERCEPTOR
// ============================================================================

/**
 * Analytics tracking interceptor
 */
export const analyticsInterceptor = {
  request: (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    // Track API request events
    if (import.meta.env.VITE_ENABLE_ANALYTICS === 'true') {
      // Send analytics event (implementation depends on analytics provider)
      // Example: trackEvent('api_request', { url: config.url, method: config.method });
    }
    return config;
  },

  response: (response: AxiosResponse): AxiosResponse => {
    // Track successful API response
    if (import.meta.env.VITE_ENABLE_ANALYTICS === 'true') {
      // const config = response.config as Record<string, unknown>;
      // const duration = config.metadata?.startTime ? Date.now() - config.metadata.startTime : 0;
      // Example: trackEvent('api_response_success', {
      //   url: config.url,
      //   status: response.status,
      //   duration
      // });
    }
    return response;
  },

  error: (error: unknown): Promise<never> => {
    // Track API errors
    if (import.meta.env.VITE_ENABLE_ANALYTICS === 'true') {
      // Example: trackEvent('api_response_error', {
      //   url: error.config?.url,
      //   status: error.response?.status,
      //   message: error.message
      // });
    }
    return Promise.reject(error);
  },
};

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  request: {
    timestamp: timestampInterceptor,
    version: versionInterceptor,
    requestId: requestIdInterceptor,
    cacheControl: cacheControlInterceptor,
    logger: loggerInterceptor.request,
    analytics: analyticsInterceptor.request,
  },
  response: {
    performance: performanceInterceptor,
    cache: cacheResponseInterceptor,
    transform: transformResponseInterceptor,
    logger: loggerInterceptor.response,
    analytics: analyticsInterceptor.response,
  },
  error: {
    logger: loggerInterceptor.error,
    analytics: analyticsInterceptor.error,
  },
};
