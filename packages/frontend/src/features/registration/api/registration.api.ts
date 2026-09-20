import { apiClient } from '../../../lib/api-client';
import { RegistrationRequest, RegistrationResponse } from '../types/registration.types';

export const registrationApi = {
  submitRegistration: async (data: RegistrationRequest): Promise<RegistrationResponse> => {
    const response = await apiClient.post<RegistrationResponse>('/v1/registration-requests', data);
    return response.data;
  },

  // Optional: Add other registration-related API calls
  getRegistrationStatus: async (requestId: string): Promise<RegistrationResponse> => {
    const response = await apiClient.get<RegistrationResponse>(`/v1/registration-requests/${requestId}`);
    return response.data;
  },

  // Check for duplicate registrations
  checkDuplicate: async (mobile: string, email?: string): Promise<{ exists: boolean }> => {
    const response = await apiClient.get<{ exists: boolean }>('/v1/registration-requests/check-duplicate', {
      params: { mobile, email },
    });
    return response.data;
  },
};