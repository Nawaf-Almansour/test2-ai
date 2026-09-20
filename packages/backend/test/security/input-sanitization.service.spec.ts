import { Test, TestingModule } from '@nestjs/testing';
import { InputSanitizationService } from '../../src/common/security/input-sanitization.service';

describe('InputSanitizationService', () => {
  let service: InputSanitizationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InputSanitizationService],
    }).compile();

    service = module.get<InputSanitizationService>(InputSanitizationService);
  });

  describe('sanitizeInput', () => {
    it('should sanitize strings', () => {
      const input = '<script>alert("xss")</script>Hello';
      const result = service.sanitizeInput(input);
      expect(result).toBe('Hello');
    });

    it('should sanitize arrays', () => {
      const input = ['<script>alert("xss")</script>Hello', 'World'];
      const result = service.sanitizeInput(input);
      expect(result).toEqual(['Hello', 'World']);
    });

    it('should sanitize objects', () => {
      const input = {
        name: '<script>alert("xss")</script>Hello',
        nested: {
          value: '<iframe>malicious</iframe>World'
        }
      };
      const result = service.sanitizeInput(input);
      expect(result.name).toBe('Hello');
      expect(result.nested.value).toBe('World');
    });

    it('should pass through primitive values', () => {
      expect(service.sanitizeInput(123)).toBe(123);
      expect(service.sanitizeInput(true)).toBe(true);
      expect(service.sanitizeInput(null)).toBe(null);
    });
  });

  describe('sanitizeForMongoQuery', () => {
    it('should remove MongoDB operators', () => {
      const input = {
        name: 'John',
        $where: 'this.name == "admin"',
        $ne: null,
        valid: 'data'
      };
      const result = service.sanitizeForMongoQuery(input);
      expect(result).toEqual({
        name: 'John',
        valid: 'data'
      });
    });

    it('should handle nested objects', () => {
      const input = {
        user: {
          name: 'John',
          $in: ['admin', 'root']
        }
      };
      const result = service.sanitizeForMongoQuery(input);
      expect(result.user).toEqual({
        name: 'John'
      });
    });
  });

  describe('validateAndSanitizeEmail', () => {
    it('should validate and sanitize valid email', () => {
      const result = service.validateAndSanitizeEmail('Test@EXAMPLE.COM');
      expect(result).toBe('test@example.com');
    });

    it('should remove dangerous characters from email', () => {
      const result = service.validateAndSanitizeEmail('test<script>@example.com');
      expect(result).toBe('testscript@example.com');
    });

    it('should throw error for invalid email', () => {
      expect(() => service.validateAndSanitizeEmail('invalid-email')).toThrow('Invalid email format');
    });
  });

  describe('validateAndSanitizeMobile', () => {
    it('should validate and sanitize Saudi mobile number', () => {
      const result = service.validateAndSanitizeMobile('966501234567');
      expect(result).toBe('+966501234567');
    });

    it('should throw error for invalid mobile format', () => {
      expect(() => service.validateAndSanitizeMobile('0501234567')).toThrow('Invalid Saudi mobile number format');
      expect(() => service.validateAndSanitizeMobile('96650123456')).toThrow('Invalid Saudi mobile number format');
    });
  });

  describe('sanitizeNationalId', () => {
    it('should sanitize valid Saudi national ID', () => {
      const result = service.sanitizeNationalId('1234567890');
      expect(result).toBe('1234567890');
    });

    it('should return undefined for invalid national ID', () => {
      expect(service.sanitizeNationalId('12345')).toBeUndefined();
      expect(service.sanitizeNationalId('abcdefghij')).toBeUndefined();
    });

    it('should remove non-alphanumeric characters', () => {
      const result = service.sanitizeNationalId('1234-567-890');
      expect(result).toBe('1234567890');
    });
  });

  describe('sanitizeNotes', () => {
    it('should sanitize and limit notes', () => {
      const longNote = 'A'.repeat(1500);
      const result = service.sanitizeNotes(longNote);
      expect(result.length).toBe(1000);
    });

    it('should return undefined for empty notes', () => {
      expect(service.sanitizeNotes('')).toBe('');
      expect(service.sanitizeNotes(undefined)).toBeUndefined();
    });
  });

  describe('sanitizeName', () => {
    it('should sanitize names properly', () => {
      expect(service.sanitizeName('John-Doe\'s')).toBe('John-Doe\'s');
      expect(service.sanitizeName('John123')).toBe('John');
      expect(service.sanitizeName('John@Doe')).toBe('JohnDoe');
    });

    it('should trim whitespace', () => {
      expect(service.sanitizeName('  John Doe  ')).toBe('John Doe');
    });
  });

  describe('sanitizeString', () => {
    it('should remove script tags', () => {
      const result = service['sanitizeString']('<script>alert("xss")</script>Hello');
      expect(result).toBe('Hello');
    });

    it('should remove iframe tags', () => {
      const result = service['sanitizeString']('<iframe src="malicious"></iframe>Hello');
      expect(result).toBe('Hello');
    });

    it('should remove event handlers', () => {
      const result = service['sanitizeString']('<div onclick="alert(1)">Hello</div>');
      expect(result).toBe('<div >Hello</div>');
    });

    it('should remove javascript protocol', () => {
      const result = service['sanitizeString']('<a href="javascript:alert(1)">Link</a>');
      expect(result).toBe('<a href=":alert(1)">Link</a>');
    });

    it('should normalize whitespace', () => {
      const result = service['sanitizeString']('Hello    World');
      expect(result).toBe('Hello World');
    });

    it('should remove control characters', () => {
      const result = service['sanitizeString']('Hello\x00World');
      expect(result).toBe('HelloWorld');
    });
  });
});