import api from './api';
import { ErrorHandler } from './errorHandler';

/**
 * Setup API interceptors for request/response handling
 */
export function setupApiInterceptors() {
  // Request interceptor
  api.interceptors.request.use(
    (config) => {
      // Add timestamp to prevent caching
      if (config.method === 'get') {
        config.params = {
          ...config.params,
          _t: Date.now(),
        };
      }

      // Sanitize request data
      if (config.data) {
        config.data = sanitizeData(config.data);
      }

      return config;
    },
    (error) => {
      ErrorHandler.logError(error, 'Request Interceptor');
      return Promise.reject(error);
    },
  );

  // Response interceptor
  api.interceptors.response.use(
    (response) => {
      // Sanitize response data
      if (response.data) {
        response.data = sanitizeData(response.data);
      }
      return response;
    },
    (error) => {
      // Don't show error toast here - let individual handlers decide
      ErrorHandler.logError(error, 'Response Interceptor');
      return Promise.reject(error);
    },
  );
}

/**
 * Sanitize data to prevent XSS attacks
 */
function sanitizeData(data: any): any {
  if (typeof data === 'string') {
    return sanitizeString(data);
  }

  if (Array.isArray(data)) {
    return data.map((item) => sanitizeData(item));
  }

  if (typeof data === 'object' && data !== null) {
    const sanitized: any = {};
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        sanitized[key] = sanitizeData(data[key]);
      }
    }
    return sanitized;
  }

  return data;
}

/**
 * Sanitize string to prevent XSS
 */
function sanitizeString(str: string): string {
  if (typeof str !== 'string') return str;

  return str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
}
