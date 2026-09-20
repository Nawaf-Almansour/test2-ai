export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
}

export enum Grade {
  KG1 = 'KG1',
  KG2 = 'KG2',
  KG3 = 'KG3',
  GRADE_1 = 'GRADE_1',
  GRADE_2 = 'GRADE_2',
  GRADE_3 = 'GRADE_3',
  GRADE_4 = 'GRADE_4',
  GRADE_5 = 'GRADE_5',
  GRADE_6 = 'GRADE_6',
  GRADE_7 = 'GRADE_7',
  GRADE_8 = 'GRADE_8',
  GRADE_9 = 'GRADE_9',
  GRADE_10 = 'GRADE_10',
  GRADE_11 = 'GRADE_11',
  GRADE_12 = 'GRADE_12',
}

export enum Relationship {
  FATHER = 'father',
  MOTHER = 'mother',
  LEGAL_GUARDIAN = 'legal_guardian',
  OTHER = 'other',
}

export enum ContactMethod {
  PHONE = 'phone',
  WHATSAPP = 'whatsapp',
  EMAIL = 'email',
}

export interface Student {
  firstName: string;
  middleName?: string;
  lastName: string;
  dateOfBirth: Date;
  gender: Gender;
  nationality: string;
  nationalId?: string;
  currentSchool?: string;
  currentGrade?: string;
  requestedGrade: Grade;
}

export interface Guardian {
  firstName: string;
  lastName: string;
  relationship: Relationship;
  mobile: string;
  alternativeMobile?: string;
  email: string;
  preferredContactMethod: ContactMethod;
}

export interface Academic {
  previousSchool?: string;
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
  marketingConsent: boolean;
}

export interface RegistrationResponse {
  success: boolean;
  requestId: string;
  status: string;
  message: string;
}

export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    fields?: Record<string, string>;
  };
}