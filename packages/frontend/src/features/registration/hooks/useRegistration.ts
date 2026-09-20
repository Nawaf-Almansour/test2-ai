import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { registrationApi } from '../api/registration.api';
import { RegistrationRequest, RegistrationResponse, ApiError } from '../types/registration.types';

export const useRegistration = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const mutation = useMutation<RegistrationResponse, ApiError, RegistrationRequest>({
    mutationFn: (request: RegistrationRequest) => registrationApi.submitRegistration(request),
    onMutate: () => {
      setIsSubmitting(true);
    },
    onSuccess: (data) => {
      setIsSubmitting(false);
      return data;
    },
    onError: (error) => {
      setIsSubmitting(false);
      console.error('Registration submission error:', error);
      throw error;
    },
  });

  const submitRegistration = async (request: RegistrationRequest): Promise<RegistrationResponse> => {
    return mutation.mutateAsync(request);
  };

  return {
    submitRegistration,
    isSubmitting,
    error: mutation.error,
    reset: mutation.reset,
  };
};