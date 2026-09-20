import { z } from 'zod';

export const studentSchema = z.object({
  firstName: z.string()
    .min(2, 'First name must be at least 2 characters')
    .max(100, 'First name must be less than 100 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'First name can only contain letters, spaces, hyphens, and apostrophes'),
  middleName: z.string()
    .max(100, 'Middle name must be less than 100 characters')
    .regex(/^[a-zA-Z\s'-]*$/, 'Middle name can only contain letters, spaces, hyphens, and apostrophes')
    .optional(),
  lastName: z.string()
    .min(2, 'Last name must be at least 2 characters')
    .max(100, 'Last name must be less than 100 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'Last name can only contain letters, spaces, hyphens, and apostrophes'),
  dateOfBirth: z.string()
    .refine((date) => {
      const birthDate = new Date(date);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      return age >= 3 && age <= 18;
    }, 'Student must be between 3 and 18 years old'),
  gender: z.enum(['male', 'female'], {
    required_error: 'Please select gender',
  }),
  nationality: z.string()
    .min(2, 'Nationality is required')
    .max(50, 'Nationality must be less than 50 characters'),
  nationalId: z.string()
    .regex(/^[0-9]{10}$/, 'National ID must be exactly 10 digits')
    .optional(),
  currentSchool: z.string()
    .max(200, 'Current school name must be less than 200 characters')
    .optional(),
  currentGrade: z.string()
    .max(50, 'Current grade must be less than 50 characters')
    .optional(),
  requestedGrade: z.string({
    required_error: 'Please select requested grade',
  }),
});

export const guardianSchema = z.object({
  firstName: z.string()
    .min(2, 'First name must be at least 2 characters')
    .max(100, 'First name must be less than 100 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'First name can only contain letters, spaces, hyphens, and apostrophes'),
  lastName: z.string()
    .min(2, 'Last name must be at least 2 characters')
    .max(100, 'Last name must be less than 100 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'Last name can only contain letters, spaces, hyphens, and apostrophes'),
  relationship: z.enum(['father', 'mother', 'guardian'], {
    required_error: 'Please select relationship',
  }),
  mobile: z.string()
    .regex(/^(\+9665|05|5)[0-9]{8}$/, 'Please enter a valid Saudi mobile number'),
  alternativeMobile: z.string()
    .regex(/^(\+9665|05|5)[0-9]{8}$/, 'Please enter a valid Saudi mobile number')
    .optional()
    .or(z.literal('')),
  email: z.string()
    .email('Please enter a valid email address')
    .max(255, 'Email must be less than 255 characters')
    .optional()
    .or(z.literal('')),
  preferredContactMethod: z.enum(['whatsapp', 'phone', 'email'], {
    required_error: 'Please select preferred contact method',
  }),
});

export const academicSchema = z.object({
  currentSchool: z.string()
    .max(200, 'Current school name must be less than 200 characters')
    .optional(),
  currentGrade: z.string()
    .max(50, 'Current grade must be less than 50 characters')
    .optional(),
  requestedGrade: z.string({
    required_error: 'Please select requested grade',
  }),
  transferReason: z.string()
    .max(500, 'Transfer reason must be less than 500 characters')
    .optional(),
});

export const registrationSchema = z.object({
  student: studentSchema,
  guardian: guardianSchema,
  academic: academicSchema.optional(),
  transportationRequired: z.boolean().optional(),
  siblingAtSchool: z.boolean().optional(),
  source: z.string().max(100, 'Source must be less than 100 characters').optional(),
  notes: z.string().max(1000, 'Notes must be less than 1000 characters').optional(),
  registrationConsent: z.boolean()
    .refine((val) => val === true, 'You must consent to the registration terms'),
  marketingConsent: z.boolean().optional(),
});

export type RegistrationFormData = z.infer<typeof registrationSchema>;