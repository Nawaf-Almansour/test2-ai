import { z } from 'zod';

// Saudi mobile number validation - must match backend format +9665XXXXXXXX
const saudiMobileRegex = /^\+9665[0-9]{8}$/;

// Grade enum matching backend
const gradeValues = [
  'KG1', 'KG2', 'KG3',
  'GRADE_1', 'GRADE_2', 'GRADE_3', 'GRADE_4',
  'GRADE_5', 'GRADE_6', 'GRADE_7', 'GRADE_8',
  'GRADE_9', 'GRADE_10', 'GRADE_11', 'GRADE_12',
] as const;

// Relationship enum matching backend
const relationshipValues = ['father', 'mother', 'legal_guardian', 'other'] as const;

// Grade display labels for UI
export const gradeLabels: Record<string, string> = {
  KG1: 'KG 1',
  KG2: 'KG 2',
  KG3: 'KG 3',
  GRADE_1: 'Grade 1',
  GRADE_2: 'Grade 2',
  GRADE_3: 'Grade 3',
  GRADE_4: 'Grade 4',
  GRADE_5: 'Grade 5',
  GRADE_6: 'Grade 6',
  GRADE_7: 'Grade 7',
  GRADE_8: 'Grade 8',
  GRADE_9: 'Grade 9',
  GRADE_10: 'Grade 10',
  GRADE_11: 'Grade 11',
  GRADE_12: 'Grade 12',
};

// Relationship display labels for UI
export const relationshipLabels: Record<string, string> = {
  father: 'Father',
  mother: 'Mother',
  legal_guardian: 'Legal Guardian',
  other: 'Other',
};

// Base schemas for nested objects - aligned with backend DTOs
const studentSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters').max(100, 'First name cannot exceed 100 characters'),
  middleName: z.string().max(100, 'Middle name cannot exceed 100 characters').optional(),
  lastName: z.string().min(2, 'Last name must be at least 2 characters').max(100, 'Last name cannot exceed 100 characters'),
  dateOfBirth: z.string().min(1, 'Date of Birth is required'),
  gender: z.enum(['male', 'female'], { required_error: 'Gender is required' }),
  nationality: z.string().min(2, 'Nationality code is required').max(2, 'Nationality must be ISO 3166-1 alpha-2 code'),
  nationalId: z.string().optional(),
  currentSchool: z.string().optional(),
  currentGrade: z.enum(gradeValues).optional(),
  requestedGrade: z.enum(gradeValues, { required_error: 'Requested Grade is required' }),
});

const guardianSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters').max(100, 'First name cannot exceed 100 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters').max(100, 'Last name cannot exceed 100 characters'),
  relationship: z.enum(relationshipValues, { required_error: 'Relationship is required' }),
  mobile: z.string()
    .min(1, 'Mobile number is required')
    .regex(saudiMobileRegex, 'Mobile number must be in format +9665XXXXXXXX'),
  alternativeMobile: z.string()
    .regex(saudiMobileRegex, 'Mobile number must be in format +9665XXXXXXXX')
    .optional()
    .or(z.literal('')),
  email: z.string()
    .email('Please enter a valid email address')
    .max(255, 'Email cannot exceed 255 characters')
    .optional()
    .or(z.literal('')),
  preferredContactMethod: z.enum(['whatsapp', 'phone', 'email'], { required_error: 'Preferred contact method is required' }),
});

const academicSchema = z.object({
  previousSchool: z.string().optional(),
  currentGrade: z.enum(gradeValues).optional(),
  transferReason: z.string().max(500, 'Transfer reason cannot exceed 500 characters').optional(),
}).optional();

// Main registration form schema - aligned with backend CreateRegistrationRequestDto
export const registrationSchema = z.object({
  student: studentSchema,
  guardian: guardianSchema,
  academic: academicSchema,
  transportationRequired: z.boolean().optional(),
  siblingAtSchool: z.boolean().optional(),
  source: z.string().optional(),
  notes: z.string().max(1000, 'Notes cannot exceed 1000 characters').optional(),
  registrationConsent: z.boolean().refine((val) => val === true, {
    message: 'You must consent to the registration terms',
  }),
  marketingConsent: z.boolean().optional(),
});

// Type inference
export type RegistrationFormData = z.infer<typeof registrationSchema>;

// Validation helpers for multi-step form
export const validateStudentStep = (data: Partial<RegistrationFormData>) => {
  const studentStepSchema = z.object({
    student: z.object({
      firstName: z.string().min(2, 'First name must be at least 2 characters'),
      lastName: z.string().min(2, 'Last name must be at least 2 characters'),
      dateOfBirth: z.string().min(1, 'Date of Birth is required'),
      gender: z.enum(['male', 'female']),
      nationality: z.string().min(2).max(2),
      requestedGrade: z.enum(gradeValues),
    }),
  });

  return studentStepSchema.safeParse(data);
};

export const validateGuardianStep = (data: Partial<RegistrationFormData>) => {
  const guardianStepSchema = z.object({
    guardian: z.object({
      firstName: z.string().min(2, 'First name must be at least 2 characters'),
      lastName: z.string().min(2, 'Last name must be at least 2 characters'),
      relationship: z.enum(relationshipValues),
      mobile: z.string().regex(saudiMobileRegex, 'Mobile number must be in format +9665XXXXXXXX'),
      preferredContactMethod: z.enum(['whatsapp', 'phone', 'email']),
    }),
  });

  return guardianStepSchema.safeParse(data);
};

export const validateAcademicStep = (data: Partial<RegistrationFormData>) => {
  const academicStepSchema = z.object({
    student: z.object({
      requestedGrade: z.enum(gradeValues),
    }),
  });

  return academicStepSchema.safeParse(data);
};

export const validateAdditionalStep = (data: Partial<RegistrationFormData>) => {
  const additionalStepSchema = z.object({
    registrationConsent: z.boolean().refine((val) => val === true, {
      message: 'You must consent to the registration terms',
    }),
  });

  return additionalStepSchema.safeParse(data);
};