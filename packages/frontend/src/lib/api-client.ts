import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { ApiError } from '../features/registration/types/registration.types';

// Create axios instance with default configuration
export const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add any request preprocessing here
    // For example: add auth token, logging, etc.
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    // Transform error responses to our standard format
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const { status, data } = error.response;
      
      // Transform different error formats to our standard ApiError format
      const apiError: ApiError = {
        code: 'UNEXPECTED_ERROR',
        message: data?.message || 'An unexpected error occurred',
        fields: data?.fields || {},
      };

      // Handle specific HTTP status codes
      switch (status) {
        case 400:
          if (data?.code === 'VALIDATION_ERROR') {
            apiError.code = 'VALIDATION_ERROR';
            apiError.message = data.message || 'Validation failed';
            apiError.fields = data.fields || {};
          } else if (data?.code === 'DUPLICATE_REGISTRATION') {
            apiError.code = 'DUPLICATE_REGISTRATION';
            apiError.message = data.message || 'Duplicate registration detected';
          } else if (data?.code === 'GRADE_FULL') {
            apiError.code = 'GRADE_FULL';
            apiError.message = data.message || 'Requested grade is full';
          } else {
            apiError.code = 'VALIDATION_ERROR';
            apiError.message = data?.message || 'Bad request';
          }
          break;
          
        case 429:
          apiError.code = 'RATE_LIMIT_EXCEEDED';
          apiError.message = data?.message || 'Too many requests. Please try again later.';
          break;
          
        case 500:
        case 502:
        case 503:
        case 504:
          apiError.code = 'UNEXPECTED_ERROR';
          apiError.message = data?.message || 'Server error. Please try again later.';
          break;
          
        default:
          apiError.message = data?.message || `Request failed with status ${status}`;
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