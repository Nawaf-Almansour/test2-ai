import axios from 'axios';
import type { InternalAxiosRequestConfig, AxiosError } from 'axios';

type AxiosInstance = ReturnType<typeof axios.create>;
import { ApiError } from '../features/registration/types/registration.types';

// Create axios instance with default configuration
export const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Add any request preprocessing here
    // For example: add auth token, logging, etc.
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    // Transform error responses to our standard format
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const { status } = error.response;
      const data = (error.response.data ?? {}) as Record<string, unknown>;
      const readStr = (key: string): string | undefined =>
        typeof (data as Record<string, unknown>)?.[key] === 'string'
          ? String((data as Record<string, unknown>)[key])
          : undefined;
      const readFields = (): Record<string, string> =>
        ((data as Record<string, unknown>)?.fields as Record<string, string> | undefined) ?? {};
      
      // Transform different error formats to our standard ApiError format
      const apiError: ApiError = {
        code: 'UNEXPECTED_ERROR',
        message: readStr('message') || 'An unexpected error occurred',
        fields: readFields(),
      };

      // Handle specific HTTP status codes
      switch (status) {
        case 400:
          if (readStr('code') === 'VALIDATION_ERROR') {
            apiError.code = 'VALIDATION_ERROR';
            apiError.message = readStr('message') || 'Validation failed';
            apiError.fields = readFields();
          } else if (readStr('code') === 'DUPLICATE_REGISTRATION') {
            apiError.code = 'DUPLICATE_REGISTRATION';
            apiError.message = readStr('message') || 'Duplicate registration detected';
          } else if (readStr('code') === 'GRADE_FULL') {
            apiError.code = 'GRADE_FULL';
            apiError.message = readStr('message') || 'Requested grade is full';
          } else {
            apiError.code = 'VALIDATION_ERROR';
            apiError.message = readStr('message') || 'Bad request';
          }
          break;
          
        case 429:
          apiError.code = 'RATE_LIMIT_EXCEEDED';
          apiError.message = readStr('message') || 'Too many requests. Please try again later.';
          break;
          
        case 500:
        case 502:
        case 503:
        case 504:
          apiError.code = 'UNEXPECTED_ERROR';
          apiError.message = readStr('message') || 'Server error. Please try again later.';
          break;
          
        default:
          apiError.message = readStr('message') || `Request failed with status ${status}`;
      }

      // Create a new error with our standardized format
      const enhancedError = new Error(apiError.message) as any;
      enhancedError.response = error.response;
      enhancedError.status = status;
      enhancedError.error = apiError;
      
      return Promise.reject(enhancedError);
    } else if (error.request) {
      // The request was made but no response was received
      const networkError: ApiError = {
        code: 'NETWORK_ERROR',
        message: 'Network error. Please check your internet connection.',
      };
      
      const enhancedError = new Error(networkError.message) as any;
      enhancedError.request = error.request;
      enhancedError.error = networkError;
      
      return Promise.reject(enhancedError);
    } else {
      // Something happened in setting up the request that triggered an Error
      const unexpectedError: ApiError = {
        code: 'UNEXPECTED_ERROR',
        message: error.message || 'An unexpected error occurred',
      };
      
      const enhancedError = new Error(unexpectedError.message) as any;
      enhancedError.error = unexpectedError;
      
      return Promise.reject(enhancedError);
    }
  }
);

// Export types for use in components
export type { ApiError };