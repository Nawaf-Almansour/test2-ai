// API endpoints
export const API_ENDPOINTS = {
  REGISTRATION_REQUESTS: '/v1/registration-requests',
  CHECK_DUPLICATE: '/v1/registration-requests/check-duplicate',
  GET_REGISTRATION: (id: string) => `/v1/registration-requests/${id}`,
} as const;

// Error codes
export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  DUPLICATE_REGISTRATION: 'DUPLICATE_REGISTRATION',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  GRADE_FULL: 'GRADE_FULL',
  NETWORK_ERROR: 'NETWORK_ERROR',
  UNEXPECTED_ERROR: 'UNEXPECTED_ERROR',
} as const;

// Form steps
export const FORM_STEPS = {
  STUDENT_INFO: 1,
  GUARDIAN_INFO: 2,
  ACADEMIC_INFO: 3,
  ADDITIONAL_INFO: 4,
  REVIEW: 5,
} as const;

// Contact information
export const CONTACT_INFO = {
  PHONE: '+966 50 123 4567',
  EMAIL: 'admissions@school.edu.sa',
  ADDRESS: 'Riyadh, Saudi Arabia',
} as const;

// Grade levels
export const GRADE_LEVELS = [
  'Kindergarten',
  'Grade 1',
  'Grade 2',
  'Grade 3',
  'Grade 4',
  'Grade 5',
  'Grade 6',
  'Grade 7',
  'Grade 8',
  'Grade 9',
  'Grade 10',
  'Grade 11',
  'Grade 12',
] as const;

// Nationalities (common ones for Saudi schools)
export const NATIONALITIES = [
  'Saudi Arabian',
  'Egyptian',
  'Yemeni',
  'Pakistani',
  'Indian',
  'Filipino',
  'Bangladeshi',
  'Sudanese',
  'Syrian',
  'Jordanian',
  'Palestinian',
  'Lebanese',
  'Omani',
  'Kuwaiti',
  'Bahraini',
  'Qatari',
  'Emirati',
  'Turkish',
  'Indonesian',
  'Sri Lankan',
  'Ethiopian',
  'Somali',
  'Iraqi',
  'Afghan',
  'Other',
] as const;

// Contact methods
export const CONTACT_METHODS = [
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'phone', label: 'Phone Call' },
  { value: 'email', label: 'Email' },
] as const;

// Guardian relationships
export const GUARDIAN_RELATIONSHIPS = [
  { value: 'father', label: 'Father' },
  { value: 'mother', label: 'Mother' },
  { value: 'guardian', label: 'Legal Guardian' },
] as const;

// Genders
export const GENDERS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
] as const;

// Registration sources
export const REGISTRATION_SOURCES = [
  { value: 'website', label: 'Website' },
  { value: 'social_media', label: 'Social Media' },
  { value: 'referral', label: 'Referral' },
  { value: 'advertisement', label: 'Advertisement' },
  { value: 'school_event', label: 'School Event' },
  { value: 'other', label: 'Other' },
] as const;

// Toast durations (in milliseconds)
export const TOAST_DURATIONS = {
  SHORT: 3000,
  MEDIUM: 5000,
  LONG: 10000,
  PERSISTENT: 0, // Won't auto-dismiss
} as const;

// Form validation messages
export const VALIDATION_MESSAGES = {
  REQUIRED: 'This field is required',
  INVALID_EMAIL: 'Please enter a valid email address',
  INVALID_MOBILE: 'Please enter a valid Saudi mobile number',
  INVALID_DATE: 'Please enter a valid date',
  MAX_LENGTH: (max: number) => `Must be less than ${max} characters`,
  MIN_LENGTH: (min: number) => `Must be at least ${min} characters`,
  INVALID_FORMAT: 'Invalid format',
} as const;

// Loading states
export const LOADING_STATES = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error',
} as const;

// Mobile number patterns
export const MOBILE_PATTERNS = {
  SAUDI: /^(\+9665|05|5)\d{8}$/,
  INTERNATIONAL: /^\+\d{1,3}\d{6,14}$/,
} as const;