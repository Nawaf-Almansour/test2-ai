import { Test, TestingModule } from '@nestjs/testing';
import { SpamDetectionService } from './spam-detection.service';
import { CreateRegistrationRequestDto } from '../../registration/dto/create-registration-request.dto';
import { RequestMetadata } from './spam-detection.service';

describe('SpamDetectionService', () => {
  let service: SpamDetectionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SpamDetectionService],
    }).compile();

    service = module.get<SpamDetectionService>(SpamDetectionService);
  });

  describe('detectSpam', () => {
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

    const validMetadata: RequestMetadata = {
      ipHash: 'hashed_ip_123',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      language: 'en-US',
      timestamp: '2024-01-01T00:00:00Z',
    };

    it('should not flag legitimate registration as spam', async () => {
      const result = await service.detectSpam(validDto, validMetadata);

      expect(result.isSpam).toBe(false);
      expect(result.riskScore).toBeLessThan(0.5);
      expect(result.reasons).toHaveLength(0);
    });

    it('should flag suspicious email patterns', async () => {
      const suspiciousDto = {
        ...validDto,
        guardian: {
          ...validDto.guardian,
          email: 'test12345@tempmail.com',
        },
      };

      const result = await service.detectSpam(suspiciousDto, validMetadata);

      expect(result.isSpam).toBe(true);
      expect(result.riskScore).toBeGreaterThan(0.5);
      expect(result.reasons).toContain('suspicious_email_domain');
    });

    it('should flag disposable email domains', async () => {
      const disposableEmails = [
        'test@10minutemail.com',
        'user@tempmail.org',
        'spam@guerrillamail.com',
        'fake@yopmail.com',
      ];

      for (const email of disposableEmails) {
        const dto = {
          ...validDto,
          guardian: {
            ...validDto.guardian,
            email,
          },
        };

        const result = await service.detectSpam(dto, validMetadata);

        expect(result.isSpam).toBe(true);
        expect(result.reasons).toContain('disposable_email');
      }
    });

    it('should flag suspicious phone patterns', async () => {
      const suspiciousPhones = [
        '+12345678901', // Non-Saudi number
        '555-0000', // Too short
        '+966000000000', // Invalid Saudi format
        '12345', // Too short
      ];

      for (const phone of suspiciousPhones) {
        const dto = {
          ...validDto,
          guardian: {
            ...validDto.guardian,
            mobile: phone,
          },
        };

        const result = await service.detectSpam(dto, validMetadata);

        expect(result.isSpam).toBe(true);
        expect(result.reasons).toContain('suspicious_phone');
      }
    });

    it('should flag bot-like user agents', async () => {
      const botUserAgents = [
        'bot',
        'crawler',
        'spider',
        'scraper',
        'curl',
        'wget',
        'python-requests',
        'postman',
      ];

      for (const botUA of botUserAgents) {
        const metadata = {
          ...validMetadata,
          userAgent: botUA,
        };

        const result = await service.detectSpam(validDto, metadata);

        expect(result.isSpam).toBe(true);
        expect(result.reasons).toContain('bot_user_agent');
      }
    });

    it('should flag missing user agent', async () => {
      const metadata = {
        ...validMetadata,
        userAgent: '',
      };

      const result = await service.detectSpam(validDto, metadata);

      expect(result.isSpam).toBe(true);
      expect(result.reasons).toContain('missing_user_agent');
    });

    it('should flag suspicious name patterns', async () => {
      const suspiciousNames = [
        'Test User',
        'John Doe',
        'Admin Admin',
        'User User',
        'Test Test',
        'asdfghjkl',
        'qwertyuiop',
        '123456789',
      ];

      for (const name of suspiciousNames) {
        const dto = {
          ...validDto,
          student: {
            ...validDto.student,
            firstName: name,
            lastName: 'Doe',
          },
        };

        const result = await service.detectSpam(dto, validMetadata);

        expect(result.isSpam).toBe(true);
        expect(result.reasons).toContain('suspicious_name_pattern');
      }
    });

    it('should flag names with special characters', async () => {
      const suspiciousNames = [
        'John<script>alert("xss")</script>',
        'Admin@#$%',
        'Test\nUser',
        'User\tUser',
      ];

      for (const name of suspiciousNames) {
        const dto = {
          ...validDto,
          student: {
            ...validDto.student,
            firstName: name,
            lastName: 'Doe',
          },
        };

        const result = await service.detectSpam(dto, validMetadata);

        expect(result.isSpam).toBe(true);
        expect(result.reasons).toContain('suspicious_characters');
      }
    });

    it('should flag unrealistic dates', async () => {
      const unrealisticDates = [
        '1900-01-01', // Too old
        '2030-01-01', // Future date
        '2010-13-45', // Invalid date
        '2015-02-30', // Invalid date
      ];

      for (const date of unrealisticDates) {
        const dto = {
          ...validDto,
          student: {
            ...validDto.student,
            dateOfBirth: date,
          },
        };

        const result = await service.detectSpam(dto, validMetadata);

        expect(result.isSpam).toBe(true);
        expect(result.reasons).toContain('unrealistic_date');
      }
    });

    it('should flag high frequency submissions from same IP', async () => {
      // Simulate multiple submissions from same IP in short time
      const metadata = {
        ...validMetadata,
        ipHash: 'same_ip_hash',
        timestamp: new Date().toISOString(),
      };

      // First submission should be fine
      const result1 = await service.detectSpam(validDto, metadata);
      expect(result1.isSpam).toBe(false);

      // Multiple rapid submissions should be flagged
      const result2 = await service.detectSpam(validDto, metadata);
      expect(result2.isSpam).toBe(true);
      expect(result2.reasons).toContain('high_frequency');
    });

    it('should flag suspicious notes content', async () => {
      const suspiciousNotes = [
        'test test test test',
        'spam spam spam',
        'hello world',
        'click here http://spam.com',
        'buy now!!!',
        'free money',
      ];

      for (const notes of suspiciousNotes) {
        const dto = {
          ...validDto,
          notes,
        };

        const result = await service.detectSpam(dto, validMetadata);

        expect(result.isSpam).toBe(true);
        expect(result.reasons).toContain('suspicious_notes');
      }
    });

    it('should calculate cumulative risk score', async () => {
      const highRiskDto = {
        ...validDto,
        guardian: {
          ...validDto.guardian,
          email: 'test@10minutemail.com', // Disposable email
          mobile: '+12345678901', // Suspicious phone
        },
        student: {
          ...validDto.student,
          firstName: 'Test User', // Suspicious name
          dateOfBirth: '2030-01-01', // Unrealistic date
        },
        notes: 'test test test', // Suspicious notes
      };

      const result = await service.detectSpam(highRiskDto, validMetadata);

      expect(result.isSpam).toBe(true);
      expect(result.riskScore).toBeGreaterThan(0.8);
      expect(result.reasons.length).toBeGreaterThan(3);
    });

    it('should handle edge cases gracefully', async () => {
      const edgeCaseDtos = [
        // Empty optional fields
        { ...validDto, guardian: { ...validDto.guardian, email: undefined } },
        { ...validDto, notes: undefined },
        // Minimal valid data
        {
          student: {
            firstName: 'A',
            lastName: 'B',
            dateOfBirth: '2015-01-01',
            gender: 'M',
            nationality: 'SA',
            requestedGrade: '1',
          },
          guardian: {
            firstName: 'C',
            lastName: 'D',
            relationship: 'mother',
            mobile: '+966500000000',
            preferredContactMethod: 'mobile',
          },
          registrationConsent: true,
        },
      ];

      for (const dto of edgeCaseDtos) {
        const result = await service.detectSpam(dto, validMetadata);
        expect(result).toHaveProperty('isSpam');
        expect(result).toHaveProperty('riskScore');
        expect(result).toHaveProperty('reasons');
        expect(Array.isArray(result.reasons)).toBe(true);
      }
    });

    it('should handle malformed metadata', async () => {
      const malformedMetadata = [
        { ipHash: '', userAgent: 'valid', language: 'en', timestamp: '2024-01-01T00:00:00Z' },
        { ipHash: 'valid', userAgent: '', language: 'en', timestamp: '2024-01-01T00:00:00Z' },
        { ipHash: 'valid', userAgent: 'valid', language: '', timestamp: '2024-01-01T00:00:00Z' },
        { ipHash: 'valid', userAgent: 'valid', language: 'en', timestamp: '' },
      ];

      for (const metadata of malformedMetadata) {
        const result = await service.detectSpam(validDto, metadata);
        expect(result).toHaveProperty('isSpam');
        expect(result).toHaveProperty('riskScore');
        expect(result).toHaveProperty('reasons');
      }
    });

    it('should maintain detection state across calls', async () => {
      const metadata = {
        ...validMetadata,
        ipHash: 'persistent_ip',
      };

      // First call
      const result1 = await service.detectSpam(validDto, metadata);
      expect(result1.isSpam).toBe(false);

      // Second call with same IP but different data
      const suspiciousDto = {
        ...validDto,
        guardian: {
          ...validDto.guardian,
          email: 'test@spam.com',
        },
      };

      const result2 = await service.detectSpam(suspiciousDto, metadata);
      expect(result2.isSpam).toBe(true);
      expect(result2.reasons).toContain('suspicious_email_domain');
    });
  });
});