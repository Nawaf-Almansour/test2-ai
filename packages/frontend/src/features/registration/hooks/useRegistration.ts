import { useMutation, useQueryClient } from '@tanstack/react-query';
import { registrationApi } from '../api/registration.api';
import { RegistrationRequest, RegistrationResponse } from '../types/registration.types';
import { useToast } from '../../../hooks/useToast';

export const useRegistration = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const mutation = useMutation<RegistrationResponse, Error, RegistrationRequest>({
    mutationFn: (data: RegistrationRequest) => registrationApi.submitRegistration(data),
    onSuccess: (data) => {
      // Show success toast
      showToast({
        type: 'success',
        title: 'Application Submitted Successfully',
        message: `Your reference number is ${data.requestId}. Please save it for your records.`,
        duration: 5000,
      });

      // Invalidate any related queries if needed
      queryClient.invalidateQueries({ queryKey: ['registration'] });
    },
    onError: (error: any) => {
      let title = 'Submission Failed';
      let message = 'An error occurred while submitting your application. Please try again.';

      // Handle specific error types
      if (error.error) {
        switch (error.error.code) {
          case 'VALIDATION_ERROR':
            title = 'Validation Error';
            message = 'Please check the form for errors and try again.';
            break;
          case 'DUPLICATE_REGISTRATION':
            title = 'Duplicate Registration';
            message = 'A registration with this information already exists. Please contact the school if you need assistance.';
            break;
          case 'RATE_LIMIT_EXCEEDED':
            title = 'Too Many Attempts';
            message = 'Please wait a moment before submitting another application.';
            break;
          case 'GRADE_FULL':
            title = 'Grade Full';
            message = 'The requested grade is currently full. Please contact admissions for alternatives.';
            break;
          case 'NETWORK_ERROR':
            title = 'Connection Error';
            message = 'Unable to connect to the server. Please check your internet connection and try again.';
            break;
          case 'UNEXPECTED_ERROR':
            title = 'Server Error';
            message = 'An unexpected error occurred. Please try again later.';
            break;
          default:
            if (error.error.message) {
              message = error.error.message;
            }
        }
      }

      // Show error toast
      showToast({
        type: 'error',
        title,
        message,
        duration: 5000,
      });

      // Log error for debugging
      console.error('Registration submission error:', error);
    },
    onSettled: () => {
      // Optional: Any cleanup that should happen regardless of success/failure
    },
  });

  const submitRegistration = async (data: RegistrationRequest): Promise<RegistrationResponse> => {
    return mutation.mutateAsync(data);
  };

  const reset = () => {
    mutation.reset();
  };

  return {
    submitRegistration,
    isSubmitting: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
    data: mutation.data,
    reset,
  };
};