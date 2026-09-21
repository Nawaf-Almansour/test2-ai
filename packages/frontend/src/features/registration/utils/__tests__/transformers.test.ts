import { 
  transformFormDataToApiRequest, 
  transformApiErrorToFormErrors, 
  generateRequestId,
  formatReferenceNumber 
} from '../transformers';
import { RegistrationFormData } from '../../schemas/registration.schema';

describe('transformers', () => {
  describe('transformFormDataToApiRequest', () => {
    const mockFormData: RegistrationFormData = {
      student: {
        firstName: ' John ',
        middleName: ' Michael ',
        lastName: ' Doe ',
        dateOfBirth: '2015-01-01',
        gender: 'male',
        nationality: 'SA',
        requestedGrade: 'Grade 1',
      },
      guardian: {
        firstName: ' Jane ',
        lastName: ' Doe ',
        relationship: 'mother',
        mobile: '0512345678',
        alternativeMobile: '+966508765432',
        email: ' jane.doe@example.com ',
        preferredContactMethod: 'whatsapp',
      },
      academic: {
        currentSchool: ' Old School ',
        currentGrade: 'Kindergarten',
        requestedGrade: 'Grade 1',
        transferReason: ' Better education ',
      },
      transportationRequired: true,
      siblingAtSchool: false,
      source: 'website',
      notes: ' Special requirements ',
      registrationConsent: true,
      marketingConsent: false,
    };

    it('transforms form data to API request format', () => {
      const result = transformFormDataToApiRequest(mockFormData);

      expect(result).toEqual({
        student: {
          firstName: 'John',
          middleName: 'Michael',
          lastName: 'Doe',
          dateOfBirth: '2015-01-01',
          gender: 'male',
          nationality: 'SA',
          requestedGrade: 'Grade 1',
          nationalId: undefined,
        },
        guardian: {
          firstName: 'Jane',
          lastName: 'Doe',
          relationship: 'mother',
          mobile: '+966512345678',
          alternativeMobile: '+966508765432',
          email: 'jane.doe@example.com',
          preferredContactMethod: 'whatsapp',
        },
        academic: {
          currentSchool: 'Old School',
          currentGrade: 'Kindergarten',
          requestedGrade: 'Grade 1',
          transferReason: 'Better education',
        },
        transportationRequired: true,
        siblingAtSchool: false,
        source: 'website',
        notes: 'Special requirements',
        registrationConsent: true,
        marketingConsent: false,
      });
    });

    it('handles optional fields correctly', () => {
      const minimalFormData: Partial<RegistrationFormData> = {
        student: {
          firstName: 'John',
          lastName: 'Doe',
          dateOfBirth: '2015-01-01',
          gender: 'male',
          nationality: 'SA',
          requestedGrade: 'Grade 1',
        },
        guardian: {
          firstName: 'Jane',
          lastName: 'Doe',
          relationship: 'mother',
          mobile: '0512345678',
          preferredContactMethod: 'whatsapp',
        },
        transportationRequired: false,
        siblingAtSchool: false,
        source: 'website',
        registrationConsent: true,
        marketingConsent: false,
      };

      const result = transformFormDataToApiRequest(minimalFormData as RegistrationFormData);

      expect(result.student.middleName).toBeUndefined();
      expect(result.student.nationalId).toBeUndefined();
      expect(result.guardian.alternativeMobile).toBeUndefined();
      expect(result.guardian.email).toBeUndefined();
      expect(result.academic?.currentSchool).toBeUndefined();
      expect(result.notes).toBeUndefined();
    });

    it('formats mobile numbers correctly', () => {
      const testCases = [
        { input: '0512345678', expected: '+966512345678' },
        { input: '+966512345678', expected: '+966512345678' },
        { input: '512345678', expected: '+966512345678' },
        { input: '05-123-45678', expected: '+966512345678' },
      ];

      testCases.forEach(({ input, expected }) => {
        const formData = {
          ...mockFormData,
          guardian: {
            ...mockFormData.guardian,
            mobile: input,
          },
        };

        const result = transformFormDataToApiRequest(formData);
        expect(result.guardian.mobile).toBe(expected);
      });
    });

    it('handles academic grade fallback', () => {
      const formDataWithoutAcademicGrade = {
        ...mockFormData,
        academic: {
          currentSchool: 'Old School',
          currentGrade: 'Kindergarten',
          transferReason: 'Better education',
        },
      };

      const result = transformFormDataToApiRequest(formDataWithoutAcademicGrade);
      expect(result.academic?.requestedGrade).toBe('Grade 1'); // Should fall back to student.requestedGrade
    });
  });

  describe('transformApiErrorToFormErrors', () => {
    it('transforms API error fields to form field names', () => {
      const apiError = {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          fields: {
            'student.firstName': 'First name is required',
            'guardian.mobile': 'Invalid mobile number',
            'registrationConsent': 'Consent is required',
          },
        },
      };

      const result = transformApiErrorToFormErrors(apiError);

      expect(result).toEqual({
        'student.firstName': 'First name is required',
        'guardian.mobile': 'Invalid mobile number',
        'registrationConsent': 'Consent is required',
      });
    });

    it('handles empty or undefined error fields', () => {
      expect(transformApiErrorToFormErrors(null)).toEqual({});
      expect(transformApiErrorToFormErrors({})).toEqual({});
      expect(transformApiErrorToFormErrors({ error: {} })).toEqual({});
      expect(transformApiErrorToFormErrors({ error: { fields: {} } })).toEqual({});
    });

    it('handles unknown field names', () => {
      const apiError = {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          fields: {
            'unknownField': 'This field is invalid',
          },
        },
      };

      const result = transformApiErrorToFormErrors(apiError);
      expect(result).toEqual({
        'unknownField': 'This field is invalid',
      });
    });
  });

  describe('generateRequestId', () => {
    it('generates request ID in correct format', () => {
      const requestId = generateRequestId();
      const currentYear = new Date().getFullYear();
      
      expect(requestId).toMatch(/^REG-\d{4}-\d{6}$/);
      expect(requestId).toContain(`REG-${currentYear}-`);
    });

    it('generates unique IDs', () => {
      const id1 = generateRequestId();
      const id2 = generateRequestId();
      
      expect(id1).not.toBe(id2);
    });
  });

  describe('formatReferenceNumber', () => {
    it('formats correctly formatted reference numbers', () => {
      const testCases = [
        'REG-2026-000123',
        'REG-2025-999999',
      ];

      testCases.forEach((input) => {
        expect(formatReferenceNumber(input)).toBe(input);
      });
    });

    it('formats incorrectly formatted reference numbers', () => {
      const testCases = [
        { input: '123456', expected: 'REG-2026-123456' },
        { input: '000123', expected: 'REG-2026-000123' },
        { input: '123', expected: 'REG-2026-000123' },
      ];

      testCases.forEach(({ input, expected }) => {
        expect(formatReferenceNumber(input)).toBe(expected);
      });
    });

    it('handles edge cases', () => {
      expect(formatReferenceNumber('')).toBe('REG-2026-000000');
      expect(formatReferenceNumber('REG-2026-ABCDEF')).toBe('REG-2026-000000');
    });
  });
});