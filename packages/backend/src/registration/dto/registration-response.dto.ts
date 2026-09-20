export class RegistrationResponseDto {
  success: boolean;
  requestId: string;
  status: string;
  message: string;
}

export class ErrorResponseDto {
  success: false;
  error: {
    code: string;
    message: string;
    fields?: Record<string, string>;
  };
}