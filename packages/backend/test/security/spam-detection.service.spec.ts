import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { SpamDetectionService, RequestMetadata } from '../../src/common/security/spam-detection.service';

describe('SpamDetectionService', () => {
  let service: SpamDetectionService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SpamDetectionService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<SpamDetectionService>(SpamDetectionService);
    configService = module.get<ConfigService>(ConfigService);
  });

  describe('detectSpam', () => {
    const metadata: RequestMetadata = {
      ipHash: 'abcd1234efgh5678',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      language: 'en-US',
      timestamp: '2023-12-01T10:00:00Z',
    };

    it('should detect spam with suspicious patterns', async () => {
      const suspiciousData = {
        student: { firstName: 'test', lastName: 'user' },
        guardian: { mobile: '+966501234567' },
      };

      const result = await service.detectSpam(suspiciousData, metadata);

      expect(result.isSpam).toBe(true);
      expect(result.riskScore).toBeGreaterThan(0);
      expect(result.reasons).toContain('Suspicious content patterns detected');
    });

    it('should detect spam with disposable email', async () => {
      const disposableEmailData = {
        student: { firstName: 'John', lastName: 'Doe' },
        guardian: { email: 'test@10minutemail.com', mobile: '+966501234567' },
      };

      const result = await service.detectSpam(disposableEmailData, metadata);

      expect(result.isSpam).toBe(true);
      expect(result.reasons).toContain('Disposable email domain detected');
    });

    it('should detect spam with suspicious user agent', async () => {
      const suspiciousAgentMetadata = {
        ...metadata,
        userAgent: 'curl/7.68.0',
      };

      const normalData = {
        student: { firstName: 'John', lastName: 'Doe' },
        guardian: { mobile: '+966501234567' },
      };

      const result = await service.detectSpam(normalData, suspiciousAgentMetadata);

      expect(result.isSpam).toBe(true);
      expect(result.reasons).toContain('Suspicious user agent');
    });

    it('should detect spam with suspicious name patterns', async () => {
      const suspiciousNameData = {
        student: { firstName: 'aaa', lastName: 'Doe' },
        guardian: { mobile: '+966501234567' },
      };

      const result = await service.detectSpam(suspiciousNameData, metadata);

      expect(result.isSpam).toBe(true);
      expect(result.reasons).toContain('Suspicious name patterns');
    });

    it('should detect spam with suspicious mobile patterns', async () => {
      const suspiciousMobileData = {
        student: { firstName: 'John', lastName: 'Doe' },
        guardian: { mobile: '+966512345678' }, // Sequential numbers
      };

      const result = await service.detectSpam(suspiciousMobileData, metadata);

      expect(result.isSpam).toBe(true);
      expect(result.reasons).toContain('Suspicious mobile number pattern');
    });

    it('should not flag legitimate data as spam', async () => {
      const legitimateData = {
        student: { firstName: 'Mohammed', lastName: 'Ali' },
        guardian: { 
          firstName: 'Ahmed',
          lastName: 'Ali',
          mobile: '+966501234567',
          email: 'parent@example.com'
        },
      };

      const result = await service.detectSpam(legitimateData, metadata);

      expect(result.isSpam).toBe(false);
      expect(result.riskScore).toBe(0);
      expect(result.reasons).toHaveLength(0);
    });

    it('should accumulate risk score from multiple violations', async () => {
      const multiViolationData = {
        student: { firstName: 'test', lastName: 'user' },
        guardian: { 
          mobile: '+966512345678', // Sequential
          email: 'test@10minutemail.com' // Disposable
        },
      };

      const suspiciousAgentMetadata = {
        ...metadata,
        userAgent: 'python-requests/2.25.1', // Suspicious
      };

      const result = await service.detectSpam(multiViolationData, suspiciousAgentMetadata);

      expect(result.isSpam).toBe(true);
      expect(result.riskScore).toBeGreaterThan(50);
      expect(result.reasons.length).toBeGreaterThan(1);
    });
  });

  describe('helper methods', () => {
    it('should extract email correctly', () => {
      const data = { guardian: { email: 'test@example.com' } };
      const email = service['extractEmail'](data);
      expect(email).toBe('test@example.com');
    });

    it('should extract mobile correctly', () => {
      const data = { guardian: { mobile: '+966501234567' } };
      const mobile = service['extractMobile'](data);
      expect(mobile).toBe('+966501234567');
    });

    it('should extract names correctly', () => {
      const data = { 
        student: { firstName: 'John', lastName: 'Doe' },
        guardian: { firstName: 'Jane', lastName: 'Doe' }
      };
      const names = service['extractNames'](data);
      expect(names).toContain('John');
      expect(names).toContain('Doe');
      expect(names).toContain('Jane');
    });

    it('should identify disposable emails', () => {
      expect(service['isDisposableEmail']('test@10minutemail.com')).toBe(true);
      expect(service['isDisposableEmail']('test@gmail.com')).toBe(false);
    });

    it('should identify suspicious user agents', () => {
      expect(service['isSuspiciousUserAgent']('curl/7.68.0')).toBe(true);
      expect(service['isSuspiciousUserAgent']('Mozilla/5.0...')).toBe(false);
    });

    it('should identify suspicious name patterns', () => {
      expect(service['hasSuspiciousNamePatterns'](['aaa'])).toBe(true); // All same character
      expect(service['hasSuspiciousNamePatterns'](['John123'])).toBe(true); // Contains numbers
      expect(service['hasSuspiciousNamePatterns'](['John'])).toBe(false);
    });

    it('should identify suspicious mobile patterns', () => {
      expect(service['isSuspiciousMobile']('+966512345678')).toBe(true); // Sequential
      expect(service['isSuspiciousMobile']('+966511111111')).toBe(true); // All same
      expect(service['isSuspiciousMobile']('+966501234567')).toBe(false);
    });
  });
});