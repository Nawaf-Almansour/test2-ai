// API Request/Response Types - aligned with backend DTOs

// Grade enum matching backend
export type Grade = 
  | 'KG1' | 'KG2' | 'KG3'
  | 'GRADE_1' | 'GRADE_2' | 'GRADE_3' | 'GRADE_4' 
  | 'GRADE_5' | 'GRADE_6' | 'GRADE_7' | 'GRADE_8'
  | 'GRADE_9' | 'GRADE_10' | 'GRADE_11' | 'GRADE_12';

// Relationship enum matching backend
export type Relationship = 'father' | 'mother' | 'legal_guardian' | 'other';

// Gender enum matching backend
export type Gender = 'male' | 'female';

// Contact method enum matching backend
export type ContactMethod = 'whatsapp' | 'phone' | 'email';

export interface RegistrationRequest {
  student: {
    firstName: string;
    middleName?: string;
    lastName: string;
    dateOfBirth: string; // ISO date string
    gender: Gender;
    nationality: string; // ISO 3166-1 alpha-2 code (e.g., 'SA')
    nationalId?: string;
    currentSchool?: string;
    currentGrade?: Grade;
    requestedGrade: Grade;
  };
  guardian: {
    firstName: string;
    lastName: string;
    relationship: Relationship;
    mobile: string; // Format: +9665XXXXXXXX
    alternativeMobile?: string;
    email?: string;
    preferredContactMethod: ContactMethod;
  };
  academic?: {
    previousSchool?: string;
    currentGrade?: Grade;
    transferReason?: string;
  };
  transportationRequired?: boolean;
  siblingAtSchool?: boolean;
  source?: string;
  notes?: string;
  registrationConsent: boolean;
  marketingConsent?: boolean;
}

// Backend response format (from RegistrationResponseDto)
export interface RegistrationResponse {
  success: boolean;
  requestId: string; // Format: REG-2026-000123
  status: string; // 'submitted' initially
  message: string;
  warning?: string; // Present for duplicate registrations
}

// Error Types - aligned with backend ErrorResponseDto
export interface ApiError {
  code: string;
  message: string;
  fields?: Record<string, string>;
}

export interface ValidationError extends ApiError {
  code: 'VALIDATION_ERROR';
  fields: Record<string, string>;
}

export interface DuplicateRegistrationError extends ApiError {
  code: 'DUPLICATE_REGISTRATION';
  existingRequestId?: string;
}

export interface RateLimitError extends ApiError {
  code: 'RATE_LIMIT_EXCEEDED';
  retryAfter?: number; // seconds
}

export interface GradeFullError extends ApiError {
  code: 'GRADE_FULL';
  requestedGrade: string;
  waitlistPosition?: number;
}

// Form State Types
export interface FormState {
  values: RegistrationFormData;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
  isValid: boolean;
  currentStep: number;
}

export interface StepState {
  isValid: boolean;
  errors: Record<string, string>;
  isTouched: boolean;
}

// UI State Types
export interface LoadingState {
  isSubmitting: boolean;
  isValidating: boolean;
  isCheckingDuplicate: boolean;
}

export interface UIState {
  showReview: boolean;
  showSuccess: boolean;
  showErrors: boolean;
  scrollPosition: number;
}

// Toast Notification Types
export interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Validation Types
export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | undefined;
}

export interface FieldValidation {
  [fieldName: string]: ValidationRule;
}

export interface StepValidation {
  [stepNumber: number]: string[]; // array of field names
}

// Progress Tracking Types
export interface RegistrationProgress {
  currentStep: number;
  completedSteps: number[];
  totalSteps: number;
  canProceed: boolean;
  canGoBack: boolean;
}

// Contact Information Types
export interface ContactInfo {
  phone: string;
  email: string;
  address?: string;
  workingHours?: string;
}

// School Information Types
export interface SchoolInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  grades: Grade[];
}

// Grade Information Types
export interface GradeInfo {
  level: Grade;
  minAge: number;
  maxAge: number;
  capacity: number;
  available: boolean;
  waitlistCount?: number;
}

// File Upload Types (if needed for future enhancements)
export interface FileUpload {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
}

// Analytics Types (for tracking form completion)
export interface FormAnalytics {
  stepCompletionTimes: Record<number, number>; // step -> time in milliseconds
  totalFormTime: number;
  abandonedStep?: number;
  validationErrors: Record<string, number>; // field -> error count
}

// Browser/Device Types
export interface BrowserInfo {
  name: string;
  version: string;
  mobile: boolean;
  language: string;
  timezone: string;
}

// Import the form data type from schema
import { RegistrationFormData } from '../schemas/registration.schema';

// Re-export for convenience
export type { RegistrationFormData };