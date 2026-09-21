import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useRegistration } from '../useRegistration';
import { ToastProvider } from '../../../../hooks/useToast';

// Mock the API
jest.mock('../../api/registration.api', () => ({
  registrationApi: {
    submitRegistration: jest.fn(),
  },
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

describe('useRegistration', () => {
  const mockRegistrationData = {
    student: {
      firstName: 'John',
      lastName: 'Doe',
      dateOfBirth: '2015-01-01',
      gender: 'male' as const,
      nationality: 'SA',
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

  it('submits registration successfully', async () => {
    const { registrationApi } = require('../../api/registration.api');
    registrationApi.submitRegistration.mockResolvedValue({
      requestId: 'REG-2026-000123',
      status: 'pending',
      submittedAt: '2026-01-01T00:00:00.000Z',
    });

    const { result } = renderHook(() => useRegistration(), { wrapper });

    await result.current.submitRegistration(mockRegistrationData);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
      expect(result.current.data).toEqual({
        requestId: 'REG-2026-000123',
        status: 'pending',
        submittedAt: '2026-01-01T00:00:00.000Z',
      });
    });

    expect(registrationApi.submitRegistration).toHaveBeenCalledWith(mockRegistrationData);
  });

  it('handles validation errors', async () => {
    const { registrationApi } = require('../../api/registration.api');
    registrationApi.submitRegistration.mockRejectedValue({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        fields: {
          'student.firstName': 'First name is required',
        },
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
      expect(result.current.error).toBeDefined();
    });
  });

  it('handles duplicate registration errors', async () => {
    const { registrationApi } = require('../../api/registration.api');
    registrationApi.submitRegistration.mockRejectedValue({
      error: {
        code: 'DUPLICATE_REGISTRATION',
        message: 'A registration with this mobile number already exists',
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
      expect(result.current.error?.error).toEqual({
        code: 'DUPLICATE_REGISTRATION',
        message: 'A registration with this mobile number already exists',
      });
    });
  });

  it('handles rate limit errors', async () => {
    const { registrationApi } = require('../../api/registration.api');
    registrationApi.submitRegistration.mockRejectedValue({
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests. Please try again later.',
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
      expect(result.current.error?.error).toEqual({
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests. Please try again later.',
      });
    });
  });

  it('handles grade full errors', async () => {
    const { registrationApi } = require('../../api/registration.api');
    registrationApi.submitRegistration.mockRejectedValue({
      error: {
        code: 'GRADE_FULL',
        message: 'The requested grade is currently full',
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
      expect(result.current.error?.error).toEqual({
        code: 'GRADE_FULL',
        message: 'The requested grade is currently full',
      });
    });
  });

  it('handles network errors', async () => {
    const { registrationApi } = require('../../api/registration.api');
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
    });
  });

  it('resets mutation state', async () => {
    const { result } = renderHook(() => useRegistration(), { wrapper });

    // Initially should not be in error state
    expect(result.current.isError).toBe(false);

    // Reset should clear any state
    result.current.reset();
    expect(result.current.isError).toBe(false);
    expect(result.current.isSuccess).toBe(false);
    expect(result.current.isSubmitting).toBe(false);
  });

  it('shows loading state during submission', async () => {
    const { registrationApi } = require('../../api/registration.api');
    let resolvePromise: (value: any) => void;
    const promise = new Promise((resolve) => {
      resolvePromise = resolve;
    });
    
    registrationApi.submitRegistration.mockReturnValue(promise);

    const { result } = renderHook(() => useRegistration(), { wrapper });

    // Start submission
    const submissionPromise = result.current.submitRegistration(mockRegistrationData);

    // Should be in loading state
    expect(result.current.isSubmitting).toBe(true);

    // Resolve the promise
    resolvePromise!({
      requestId: 'REG-2026-000123',
      status: 'pending',
      submittedAt: '2026-01-01T00:00:00.000Z',
    });

    await submissionPromise;

    await waitFor(() => {
      expect(result.current.isSubmitting).toBe(false);
      expect(result.current.isSuccess).toBe(true);
    });
  });
});