import { RegistrationRequest, RegistrationResponse, ApiError } from '../types/registration.types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

class RegistrationApi {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${API_BASE_URL}/api/v1`;
  }

  async submitRegistration(request: RegistrationRequest): Promise<RegistrationResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/registration-requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      const data = await response.json();

      if (!response.ok) {
        throw data as ApiError;
      }

      return data as RegistrationResponse;
    } catch (error) {
      if (error && typeof error === 'object' && 'error' in error) {
        throw error as ApiError;
      }
      
      // Network or other errors
      throw {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: 'Unable to connect to the server. Please check your internet connection and try again.',
        },
      } as ApiError;
    }
  }
}

export const registrationApi = new RegistrationApi();