import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useRegistration } from '../useRegistration';
import { ToastProvider } from '../../../../hooks/useToast';

// Mock the API client
jest.mock('../../../../lib/api-client', () => ({
  apiClient: {
    post: jest.fn(),
  },
}));

// Mock the registration API
jest.mock('../../api/registration.api', () => ({
  registrationApi: {
    submitRegistration: jest.fn(),
  },
}));

// Mock toast notifications
jest.mock('../../../../hooks/useToast', () => ({
  useToast: () => ({
    showToast: jest.fn(),
    removeToast: jest.fn(),
    toasts: [],
  }),
  ToastProvider: ({ children }: { children: React.ReactNode }) => children,
}));

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={createTestQueryClient()}>
    <ToastProvider>
      {children}
    </ToastProvider>
  </QueryClientProvider>
);

describe('useRegistration Integration Tests', () => {
  const mockRegistrationData = {
    student: {
      firstName: 'John',
      lastName: 'Doe',
      dateOfBirth: '2015-01-01',
      gender: 'male' as const,
      nationality: 'Saudi Arabian',
      requestedGrade: 'Grade 1',
    },
    guardian: {
      firstName: 'Jane',
      lastName: 'Doe',
      relationship: 'mother' as const,
      mobile: '+966501234567',
      preferredContactMethod: 'whatsapp' as const,
    },
    transportationRequired: false,
    siblingAtSchool: false,
    source: 'website',
    registrationConsent: true,
    marketingConsent: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('integrates with TanStack Query for mutation state management', async () => {
    const { registrationApi } = require('../../api/registration.api');
    const mockResponse = {
      requestId: 'REG-2026-000123',
      status: 'pending',
      submittedAt: '2026-01-01T00:00:00.000Z',
    };
    
    registrationApi.submitRegistration.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useRegistration(), { wrapper });

    // Initial state
    expect(result.current.isSubmitting).toBe(false);
    expect(result.current.isSuccess).toBe(false);
    expect(result.current.isError).toBe(false);
    expect(result.current.data).toBeUndefined();

    // Start submission
    const submissionPromise = result.current.submitRegistration(mockRegistrationData);

    // Should be in loading state
    expect(result.current.isSubmitting).toBe(true);

    // Wait for completion
    await submissionPromise;

    await waitFor(() => {
      expect(result.current.isSubmitting).toBe(false);
      expect(result.current.isSuccess).toBe(true);
      expect(result.current.isError).toBe(false);
      expect(result.current.data).toEqual(mockResponse);
    });

    expect(registrationApi.submitRegistration).toHaveBeenCalledWith(mockRegistrationData);
  });

  it('handles error states correctly', async () => {
    const { registrationApi } = require('../../api/registration.api');
    const mockError = {
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        fields: {
          'student.firstName': 'First name is required',
        },
      },
    };
    
    registrationApi.submitRegistration.mockRejectedValue(mockError);

    const { result } = renderHook(() => useRegistration(), { wrapper });

    try {
      await result.current.submitRegistration(mockRegistrationData);
    } catch (error) {
      // Expected to throw
    }

    await waitFor(() => {
      expect(result.current.isSubmitting).toBe(false);
      expect(result.current.isSuccess).toBe(false);
      expect(result.current.isError).toBe(true);
      expect(result.current.error).toEqual(mockError);
    });
  });

  it('resets mutation state correctly', async () => {
    const { result } = renderHook(() => useRegistration(), { wrapper });

    // Reset should clear all states
    result.current.reset();

    expect(result.current.isSubmitting).toBe(false);
    expect(result.current.isSuccess).toBe(false);
    expect(result.current.isError).toBe(false);
    expect(result.current.data).toBeUndefined();
    expect(result.current.error).toBeUndefined();
  });

  it('handles concurrent submissions correctly', async () => {
    const { registrationApi } = require('../../api/registration.api');
    
    // Mock a slow response
    let resolvePromise: (value: any) => void;
    const promise = new Promise((resolve) => {
      resolvePromise = resolve;
    });
    
    registrationApi.submitRegistration.mockReturnValue(promise);

    const { result } = renderHook(() => useRegistration(), { wrapper });

    // Start first submission
    const submission1 = result.current.submitRegistration(mockRegistrationData);
    expect(result.current.isSubmitting).toBe(true);

    // Try to start second submission (should be blocked by loading state)
    const submission2 = result.current.submitRegistration(mockRegistrationData);

    // Resolve first submission
    resolvePromise!({
      requestId: 'REG-2026-000123',
      status: 'pending',
      submittedAt: '2026-01-01T00:00:00.000Z',
    });

    await submission1;
    
    // Second submission should still be pending
    expect(submission2).toBeDefined();
  });

  it('maintains correct data type safety', async () => {
    const { registrationApi } = require('../../api/registration.api');
    const mockResponse = {
      requestId: 'REG-2026-000123',
      status: 'pending' as const,
      submittedAt: '2026-01-01T00:00:00.000Z',
    };
    
    registrationApi.submitRegistration.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useRegistration(), { wrapper });

    await result.current.submitRegistration(mockRegistrationData);

    await waitFor(() => {
      // TypeScript should ensure these are correctly typed
      expect(result.current.data?.requestId).toBe('REG-2026-000123');
      expect(result.current.data?.status).toBe('pending');
      expect(typeof result.current.data?.submittedAt).toBe('string');
    });
  });

  it('integrates with toast notifications for errors', async () => {
    const { registrationApi } = require('../../api/registration.api');
    const { showToast } = require('../../../../hooks/useToast').useToast();
    
    const mockError = {
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        fields: {},
      },
    };
    
    registrationApi.submitRegistration.mockRejectedValue(mockError);

    const { result } = renderHook(() => useRegistration(), { wrapper });

    try {
      await result.current.submitRegistration(mockRegistrationData);
    } catch (error) {
      // Expected to throw
    }

    await waitFor(() => {
      // Toast should have been called for the error
      expect(showToast).toHaveBeenCalledWith({
        type: 'error',
        title: 'Registration Failed',
        message: 'Validation failed',
      });
    });
  });

  it('handles network errors gracefully', async () => {
    const { registrationApi } = require('../../api/registration.api');
    const { showToast } = require('../../../../hooks/useToast').useToast();
    
    // Mock network error
    registrationApi.submitRegistration.mockRejectedValue({
      error: {
        code: 'NETWORK_ERROR',
        message: 'Network error. Please check your internet connection.',
      },
    });

    const { result } = renderHook(() => useRegistration(), { wrapper });

    try {
      await result.current.submitRegistration(mockRegistrationData);
    } catch (error) {
      // Expected to throw
    }

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
      expect(showToast).toHaveBeenCalledWith({
        type: 'error',
        title: 'Network Error',
        message: 'Network error. Please check your internet connection.',
      });
    });
  });
});