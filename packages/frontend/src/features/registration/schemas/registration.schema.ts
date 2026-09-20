import { z } from 'zod';

// Saudi mobile number validation
const saudiMobileRegex = /^(\+9665|05|5)\d{8}$/;

// Base schemas for nested objects
const studentSchema = z.object({
  firstName: z.string().min(1, 'First Name is required').max(50, 'First Name must be less than 50 characters'),
  middleName: z.string().max(50, 'Middle Name must be less than 50 characters').optional(),
  lastName: z.string().min(1, 'Last Name is required').max(50, 'Last Name must be less than 50 characters'),
  dateOfBirth: z.string().min(1, 'Date of Birth is required'),
  gender: z.enum(['male', 'female'], { required_error: 'Gender is required' }),
  nationality: z.string().min(1, 'Nationality is required'),
  nationalId: z.string().optional(),
  requestedGrade: z.string().min(1, 'Requested Grade is required'),
});

const guardianSchema = z.object({
  firstName: z.string().min(1, 'First Name is required').max(50, 'First Name must be less than 50 characters'),
  lastName: z.string().min(1, 'Last Name is required').max(50, 'Last Name must be less than 50 characters'),
  relationship: z.enum(['father', 'mother', 'guardian'], { required_error: 'Relationship is required' }),
  mobile: z.string()
    .min(1, 'Mobile number is required')
    .regex(saudiMobileRegex, 'Please enter a valid Saudi mobile number'),
  alternativeMobile: z.string()
    .regex(saudiMobileRegex, 'Please enter a valid Saudi mobile number')
    .optional()
    .or(z.literal('')),
  email: z.string()
    .email('Please enter a valid email address')
    .optional()
    .or(z.literal('')),
  preferredContactMethod: z.enum(['whatsapp', 'phone', 'email'], { required_error: 'Preferred contact method is required' }),
});

const academicSchema = z.object({
  currentSchool: z.string().max(100, 'School name must be less than 100 characters').optional(),
  currentGrade: z.string().optional(),
  requestedGrade: z.string().optional(),
  transferReason: z.string().max(500, 'Transfer reason must be less than 500 characters').optional(),
}).optional();

// Main registration form schema
export const registrationSchema = z.object({
  student: studentSchema,
  guardian: guardianSchema,
  academic: academicSchema,
  transportationRequired: z.boolean(),
  siblingAtSchool: z.boolean(),
  source: z.string().min(1, 'Source is required'),
  notes: z.string().max(1000, 'Notes must be less than 1000 characters').optional(),
  registrationConsent: z.boolean().refine((val) => val === true, {
    message: 'You must consent to the registration terms',
  }),
  marketingConsent: z.boolean(),
});

// Type inference
export type RegistrationFormData = z.infer<typeof registrationSchema>;

// Validation helpers
export const validateStudentStep = (data: Partial<RegistrationFormData>) => {
  const studentSchema = z.object({
    student: z.object({
      firstName: z.string().min(1, 'First Name is required'),
      lastName: z.string().min(1, 'Last Name is required'),
      dateOfBirth: z.string().min(1, 'Date of Birth is required'),
      gender: z.enum(['male', 'female']),
      nationality: z.string().min(1, 'Nationality is required'),
      requestedGrade: z.string().min(1, 'Requested Grade is required'),
    }),
  });

  return studentSchema.safeParse(data);
};

export const validateGuardianStep = (data: Partial<RegistrationFormData>) => {
  const guardianSchema = z.object({
    guardian: z.object({
      firstName: z.string().min(1, 'First Name is required'),
      lastName: z.string().min(1, 'Last Name is required'),
      relationship: z.enum(['father', 'mother', 'guardian']),
      mobile: z.string().regex(saudiMobileRegex, 'Please enter a valid Saudi mobile number'),
      preferredContactMethod: z.enum(['whatsapp', 'phone', 'email']),
    }),
  });

  return guardianSchema.safeParse(data);
};

export const validateAcademicStep = (data: Partial<RegistrationFormData>) => {
  const academicSchema = z.object({
    academic: z.object({
      requestedGrade: z.string().min(1, 'Requested Grade is required'),
    }).optional().refine(val => val?.requestedGrade, {
      message: 'Requested Grade is required',
    }),
  });

  return academicSchema.safeParse(data);
};

export const validateAdditionalStep = (data: Partial<RegistrationFormData>) => {
  const additionalSchema = z.object({
    registrationConsent: z.boolean().refine((val) => val === true, {
      message: 'You must consent to the registration terms',
    }),
  });

  return additionalSchema.safeParse(data);
};