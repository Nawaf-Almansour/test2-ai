export interface Student {
  firstName: string;
  middleName?: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'male' | 'female';
  nationality: string;
  nationalId?: string;
  currentSchool?: string;
  currentGrade?: string;
  requestedGrade: string;
}

export interface Guardian {
  firstName: string;
  lastName: string;
  relationship: 'father' | 'mother' | 'guardian';
  mobile: string;
  alternativeMobile?: string;
  email?: string;
  preferredContactMethod: 'whatsapp' | 'phone' | 'email';
}

export interface Academic {
  currentSchool?: string;
  currentGrade?: string;
  requestedGrade: string;
  transferReason?: string;
}

export interface RegistrationRequest {
  student: Student;
  guardian: Guardian;
  academic?: Academic;
  transportationRequired?: boolean;
  siblingAtSchool?: boolean;
  source?: string;
  notes?: string;
  registrationConsent: boolean;
  marketingConsent?: boolean;
}

export interface RegistrationResponse {
  success: boolean;
  requestId: string;
  status: string;
  message: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    fields?: Record<string, string>;
  };
}