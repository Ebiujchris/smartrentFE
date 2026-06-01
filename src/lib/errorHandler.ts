import { toast } from 'sonner';

export interface ApiError {
  statusCode: number;
  message: string | string[];
  error: string;
  timestamp?: string;
  path?: string;
}

export class ErrorHandler {
  /**
   * Handle API errors and show user-friendly messages
   */
  static handleApiError(error: any): void {
    if (!error) {
      toast.error('An unexpected error occurred');
      return;
    }

    // Network errors
    if (error.code === 'ERR_NETWORK' || !error.response) {
      toast.error('Network error. Please check your connection.');
      return;
    }

    const apiError: ApiError = error.response?.data;

    if (!apiError) {
      toast.error('An unexpected error occurred');
      return;
    }

    // Handle different status codes
    switch (apiError.statusCode) {
      case 400:
        this.handleBadRequest(apiError);
        break;
      case 401:
        this.handleUnauthorized(apiError);
        break;
      case 403:
        this.handleForbidden(apiError);
        break;
      case 404:
        this.handleNotFound(apiError);
        break;
      case 409:
        this.handleConflict(apiError);
        break;
      case 429:
        this.handleTooManyRequests(apiError);
        break;
      case 500:
      case 502:
      case 503:
        this.handleServerError(apiError);
        break;
      default:
        this.handleGenericError(apiError);
    }
  }

  private static handleBadRequest(error: ApiError): void {
    if (Array.isArray(error.message)) {
      error.message.forEach((msg) => toast.error(msg));
    } else {
      toast.error(error.message || 'Invalid request');
    }
  }

  private static handleUnauthorized(error: ApiError): void {
    toast.error('Session expired. Please login again.');
    // Redirect to login after a short delay
    setTimeout(() => {
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }, 2000);
  }

  private static handleForbidden(error: ApiError): void {
    toast.error('You do not have permission to perform this action.');
  }

  private static handleNotFound(error: ApiError): void {
    toast.error(error.message || 'Resource not found');
  }

  private static handleConflict(error: ApiError): void {
    toast.error(error.message || 'This resource already exists');
  }

  private static handleTooManyRequests(error: ApiError): void {
    toast.error('Too many requests. Please try again later.');
  }

  private static handleServerError(error: ApiError): void {
    toast.error('Server error. Please try again later.');
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Server Error:', error);
    }
  }

  private static handleGenericError(error: ApiError): void {
    toast.error(error.message || 'An error occurred. Please try again.');
  }

  /**
   * Sanitize error message to prevent XSS
   */
  static sanitizeMessage(message: string): string {
    if (typeof message !== 'string') return 'An error occurred';
    
    return message
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '');
  }

  /**
   * Log errors for debugging (only in development)
   */
  static logError(error: any, context?: string): void {
    if (process.env.NODE_ENV === 'development') {
      console.group(`Error${context ? ` in ${context}` : ''}`);
      console.error(error);
      if (error.response) {
        console.log('Response:', error.response);
      }
      console.groupEnd();
    }
  }
}

/**
 * Wrapper for async functions with error handling
 */
export async function withErrorHandling<T>(
  fn: () => Promise<T>,
  context?: string,
): Promise<T | null> {
  try {
    return await fn();
  } catch (error) {
    ErrorHandler.logError(error, context);
    ErrorHandler.handleApiError(error);
    return null;
  }
}
