import { Test, TestingModule } from '@nestjs/testing';
import { InputSanitizationService } from './input-sanitization.service';
import { CreateRegistrationRequestDto } from '../../registration/dto/create-registration-request.dto';

describe('InputSanitizationService', () => {
  let service: InputSanitizationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InputSanitizationService],
    }).compile();

    service = module.get<InputSanitizationService>(InputSanitizationService);
  });

  describe('sanitizeInput', () => {
    const validDto: CreateRegistrationRequestDto = {
      student: {
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: '2015-05-15',
        gender: 'M',
        nationality: 'SA',
        requestedGrade: '1',
      },
      guardian: {
        firstName: 'Jane',
        lastName: 'Doe',
        relationship: 'mother',
        mobile: '+966500000000',
        email: 'jane@example.com',
        preferredContactMethod: 'mobile',
      },
      registrationConsent: true,
    };

    it('should return sanitized DTO unchanged when valid', () => {
      const result = service.sanitizeInput(validDto);

      expect(result).toEqual(validDto);
    });

    it('should trim whitespace from string fields', () => {
      const dirtyDto = {
        ...validDto,
        student: {
          ...validDto.student,
          firstName: '  John  ',
          lastName: '   Doe   ',
          nationality: '  SA  ',
        },
        guardian: {
          ...validDto.guardian,
          firstName: '  Jane  ',
          lastName: '   Doe   ',
          email: '  jane@example.com  ',
        },
      };

      const result = service.sanitizeInput(dirtyDto);

      expect(result.student.firstName).toBe('John');
      expect(result.student.lastName).toBe('Doe');
      expect(result.student.nationality).toBe('SA');
      expect(result.guardian.firstName).toBe('Jane');
      expect(result.guardian.lastName).toBe('Doe');
      expect(result.guardian.email).toBe('jane@example.com');
    });

    it('should strip HTML tags from string fields', () => {
      const xssDto = {
        ...validDto,
        student: {
          ...validDto.student,
          firstName: 'John<script>alert("xss")</script>',
          lastName: 'Doe<b>bold</b>',
        },
        guardian: {
          ...validDto.guardian,
          firstName: 'Jane<img src="x" onerror="alert(1)">',
        },
        notes: '<p>This is <strong>important</strong></p>',
      };

      const result = service.sanitizeInput(xssDto);

      expect(result.student.firstName).toBe('Johnalert("xss")');
      expect(result.student.lastName).toBe('Doebold');
      expect(result.guardian.firstName).toBe('Jane');
      expect(result.notes).toBe('This is important');
    });

    it('should limit string length to prevent buffer overflow', () => {
      const longString = 'a'.repeat(1000);
      const longDto = {
        ...validDto,
        student: {
          ...validDto.student,
          firstName: longString,
          lastName: longString,
        },
        guardian: {
          ...validDto.guardian,
          firstName: longString,
          lastName: longString,
        },
        notes: longString,
      };

      const result = service.sanitizeInput(longDto);

      expect(result.student.firstName).toHaveLength(200);
      expect(result.student.lastName).toHaveLength(200);
      expect(result.guardian.firstName).toHaveLength(200);
      expect(result.guardian.lastName).toHaveLength(200);
      expect(result.notes).toHaveLength(500);
    });

    it('should handle null and undefined values', () => {
      const dtoWithNulls = {
        ...validDto,
        student: {
          ...validDto.student,
          middleName: null as any,
          nationalId: undefined as any,
        },
        guardian: {
          ...validDto.guardian,
          alternativeMobile: null as any,
          email: undefined as any,
        },
        academic: null as any,
        notes: undefined as any,
      };

      const result = service.sanitizeInput(dtoWithNulls);

      expect(result.student.middleName).toBeUndefined();
      expect(result.student.nationalId).toBeUndefined();
      expect(result.guardian.alternativeMobile).toBeUndefined();
      expect(result.guardian.email).toBeUndefined();
      expect(result.academic).toBeNull();
      expect(result.notes).toBeUndefined();
    });

    it('should sanitize nested objects', () => {
      const nestedDto = {
        ...validDto,
        academic: {
          previousSchool: '  <script>alert("xss")</script> School  ',
          currentGrade: '  Grade 5  ',
          transferReason: '  <b>Reason</b>  ',
        },
      };

      const result = service.sanitizeInput(nestedDto);

      expect(result.academic.previousSchool).toBe('alert("xss") School');
      expect(result.academic.currentGrade).toBe('Grade 5');
      expect(result.academic.transferReason).toBe('Reason');
    });
  });

  describe('validateAndSanitizeEmail', () => {
    it('should validate and sanitize valid emails', () => {
      const validEmails = [
        'user@example.com',
        'test.email+tag@domain.co.uk',
        'user123@sub.domain.com',
      ];

      for (const email of validEmails) {
        const result = service.validateAndSanitizeEmail(email);
        expect(result).toBe(email.toLowerCase().trim());
      }
    });

    it('should handle uppercase emails', () => {
      const result = service.validateAndSanitizeEmail('USER@EXAMPLE.COM');
      expect(result).toBe('user@example.com');
    });

    it('should reject invalid email formats', () => {
      const invalidEmails = [
        'invalid-email',
        '@domain.com',
        'user@',
        'user..name@domain.com',
        'user@domain',
        '',
        'user@.com',
        'user@domain.',
      ];

      for (const email of invalidEmails) {
        expect(() => {
          service.validateAndSanitizeEmail(email);
        }).toThrow();
      }
    });

    it('should handle null and undefined', () => {
      expect(service.validateAndSanitizeEmail(null as any)).toBeUndefined();
      expect(service.validateAndSanitizeEmail(undefined as any)).toBeUndefined();
    });

    it('should prevent email injection', () => {
      const injectionAttempts = [
        'user@example.com\r\nBcc: victim@evil.com',
        'user@example.com\nCc: admin@domain.com',
        'user@example.com%0d%0aContent-Type: text/html',
      ];

      for (const email of injectionAttempts) {
        const result = service.validateAndSanitizeEmail(email);
        expect(result).not.toContain('\r');
        expect(result).not.toContain('\n');
        expect(result).not.toContain('%0d');
        expect(result).not.toContain('%0a');
      }
    });
  });

  describe('validateAndSanitizeMobile', () => {
    it('should validate and sanitize Saudi mobile numbers', () => {
      const validMobiles = [
        '+966500000000',
        '966500000000',
        '0512345678',
        '512345678',
      ];

      for (const mobile of validMobiles) {
        const result = service.validateAndSanitizeMobile(mobile);
        expect(result).toMatch(/^\+9665\d{8}$/);
      }
    });

    it('should reject invalid mobile formats', () => {
      const invalidMobiles = [
        '123456789',
        '+1234567890',
        'invalid',
        '',
        '+966123456789',
        '05123456789',
        '5123456789',
      ];

      for (const mobile of invalidMobiles) {
        expect(() => {
          service.validateAndSanitizeMobile(mobile);
        }).toThrow();
      }
    });

    it('should handle null and undefined', () => {
      expect(service.validateAndSanitizeMobile(null as any)).toBeUndefined();
      expect(service.validateAndSanitizeMobile(undefined as any)).toBeUndefined();
    });
  });

  describe('sanitizeNationalId', () => {
    it('should sanitize valid Saudi national IDs', () => {
      const validIds = [
        '1234567890',
        '1 2 3 4 5 6 7 8 9 0',
        '123-456-7890',
      ];

      for (const id of validIds) {
        const result = service.sanitizeNationalId(id);
        expect(result).toBe('1234567890');
      }
    });

    it('should reject invalid national ID formats', () => {
      const invalidIds = [
        '123456789', // Too short
        '12345678901', // Too long
        'abcdefghij', // Non-numeric
        '',
        '123 456 789 01', // Too many spaces
      ];

      for (const id of invalidIds) {
        expect(() => {
          service.sanitizeNationalId(id);
        }).toThrow();
      }
    });

    it('should handle null and undefined', () => {
      expect(service.sanitizeNationalId(null as any)).toBeUndefined();
      expect(service.sanitizeNationalId(undefined as any)).toBeUndefined();
    });
  });

  describe('sanitizeName', () => {
    it('should sanitize valid names', () => {
      const validNames = [
        'John Doe',
        'Mohammed Ahmed',
        'Mary-Jane Smith',
        "O'Connor",
      ];

      for (const name of validNames) {
        const result = service.sanitizeName(name);
        expect(result).toBe(name.trim());
      }
    });

    it('should remove special characters from names', () => {
      const specialNames = [
        'John<script>alert("xss")</script>',
        'Jane@#$%',
        'Test\nUser',
        'User\tUser',
        'Admin<>',
      ];

      const expectedResults = [
        'Johnalert("xss")',
        'Jane',
        'TestUser',
        'UserUser',
        'Admin',
      ];

      for (let i = 0; i < specialNames.length; i++) {
        const result = service.sanitizeName(specialNames[i]);
        expect(result).toBe(expectedResults[i]);
      }
    });

    it('should handle null and undefined', () => {
      expect(service.sanitizeName(null as any)).toBeUndefined();
      expect(service.sanitizeName(undefined as any)).toBeUndefined();
    });

    it('should limit name length', () => {
      const longName = 'a'.repeat(100);
      const result = service.sanitizeName(longName);
      expect(result).toHaveLength(50);
    });
  });

  describe('sanitizeNotes', () => {
    it('should sanitize valid notes', () => {
      const validNotes = [
        'This is a note about the student.',
        'Special requirements: wheelchair access needed.',
        'Previous school: International School.',
      ];

      for (const notes of validNotes) {
        const result = service.sanitizeNotes(notes);
        expect(result).toBe(notes.trim());
      }
    });

    it('should strip HTML from notes', () => {
      const htmlNotes = '<p>This is <strong>important</strong></p>';
      const result = service.sanitizeNotes(htmlNotes);
      expect(result).toBe('This is important');
    });

    it('should limit notes length', () => {
      const longNotes = 'a'.repeat(1000);
      const result = service.sanitizeNotes(longNotes);
      expect(result).toHaveLength(500);
    });

    it('should handle null and undefined', () => {
      expect(service.sanitizeNotes(null as any)).toBeUndefined();
      expect(service.sanitizeNotes(undefined as any)).toBeUndefined();
    });
  });

  describe('sanitizeForMongoQuery', () => {
    it('should remove MongoDB operators from strings', () => {
      const maliciousStrings = [
        '{"$gt": ""}',
        '{"$ne": null}',
        '{"$in": ["admin"]}',
        '{"$where": "this.password == \'password\'"}',
      ];

      for (const malicious of maliciousStrings) {
        const result = service.sanitizeForMongoQuery(malicious);
        expect(result).not.toContain('$');
      }
    });

    it('should handle nested objects', () => {
      const maliciousObject = {
        firstName: 'John',
        lastName: '{"$ne": null}',
        notes: 'Test {$gt: ""}',
      };

      const result = service.sanitizeForMongoQuery(maliciousObject);

      expect(result.firstName).toBe('John');
      expect(result.lastName).toBe('{"": null}');
      expect(result.notes).toBe('Test {gt: ""}');
    });

    it('should preserve valid data while removing operators', () => {
      const validObject = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        amount: 100,
        active: true,
      };

      const result = service.sanitizeForMongoQuery(validObject);

      expect(result).toEqual(validObject);
    });
  });

  describe('edge cases', () => {
    it('should handle empty objects', () => {
      const result = service.sanitizeInput({});
      expect(result).toEqual({});
    });

    it('should handle deeply nested objects', () => {
      const deepObject = {
        level1: {
          level2: {
            level3: {
              data: '<script>alert("xss")</script>',
            },
          },
        },
      };

      const result = service.sanitizeForMongoQuery(deepObject);
      expect(result.level1.level2.level3.data).not.toContain('<script>');
    });

    it('should handle arrays in objects', () => {
      const objectWithArray = {
        tags: ['tag1', '<script>alert("xss")</script>', 'tag3'],
        nested: {
          array: ['item1', '{$ne: null}', 'item3'],
        },
      };

      const result = service.sanitizeForMongoQuery(objectWithArray);
      expect(result.tags[1]).not.toContain('<script>');
      expect(result.nested.array[1]).not.toContain('$');
    });

    it('should handle circular references gracefully', () => {
      const circular: any = { name: 'test' };
      circular.self = circular;

      expect(() => {
        service.sanitizeForMongoQuery(circular);
      }).not.toThrow();
    });
  });
});