import { Test, TestingModule } from '@nestjs/testing';
import { RegistrationController } from './registration.controller';
import { RegistrationService } from './registration.service';
import { TurnstileService } from '../common/security/turnstile.service';
import { SpamDetectionService } from '../common/security/spam-detection.service';
import { InputSanitizationService } from '../common/security/input-sanitization.service';
import { CreateRegistrationRequestDto } from './dto/create-registration-request.dto';
import { BadRequestException, ForbiddenException } from '@nestjs/common';

describe('RegistrationController', () => {
  let controller: RegistrationController;
  let registrationService: jest.Mocked<RegistrationService>;
  let turnstileService: jest.Mocked<TurnstileService>;
  let spamDetectionService: jest.Mocked<SpamDetectionService>;
  let inputSanitizationService: jest.Mocked<InputSanitizationService>;

  const mockRegistrationService = {
    createRegistrationRequest: jest.fn(),
  };

  const mockTurnstileService = {
    isEnabled: jest.fn(),
    verifyToken: jest.fn(),
  };

  const mockSpamDetectionService = {
    detectSpam: jest.fn(),
  };

  const mockInputSanitizationService = {
    sanitizeInput: jest.fn(),
    validateAndSanitizeEmail: jest.fn(),
    validateAndSanitizeMobile: jest.fn(),
    sanitizeNationalId: jest.fn(),
    sanitizeNotes: jest.fn(),
    sanitizeName: jest.fn(),
    sanitizeForMongoQuery: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RegistrationController],
      providers: [
        {
          provide: RegistrationService,
          useValue: mockRegistrationService,
        },
        {
          provide: TurnstileService,
          useValue: mockTurnstileService,
        },
        {
          provide: SpamDetectionService,
          useValue: mockSpamDetectionService,
        },
        {
          provide: InputSanitizationService,
          useValue: mockInputSanitizationService,
        },
      ],
    }).compile();

    controller = module.get<RegistrationController>(RegistrationController);
    registrationService = module.get(RegistrationService);
    turnstileService = module.get(TurnstileService);
    spamDetectionService = module.get(SpamDetectionService);
    inputSanitizationService = module.get(InputSanitizationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createRegistrationRequest', () => {
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

    const mockHeaders = {
      'user-agent': 'Mozilla/5.0...',
      'accept-language': 'en-US,en;q=0.9',
    };

    const mockIp = '192.168.1.1';

    it('should create registration successfully', async () => {
      // Mock all security services to pass
      turnstileService.isEnabled.mockReturnValue(false);
      inputSanitizationService.sanitizeInput.mockReturnValue(validDto);
      spamDetectionService.detectSpam.mockResolvedValue({
        isSpam: false,
        riskScore: 0.1,
        reasons: [],
      });
      registrationService.createRegistrationRequest.mockResolvedValue({
        requestId: 'REG-2024-000001',
        status: 'submitted',
        isDuplicate: false,
      });

      const result = await controller.createRegistrationRequest(validDto, mockIp, mockHeaders);

      expect(result).toEqual({
        success: true,
        requestId: 'REG-2024-000001',
        status: 'submitted',
        message: 'Registration request submitted successfully.',
      });

      expect(registrationService.createRegistrationRequest).toHaveBeenCalledWith(
        validDto,
        expect.objectContaining({
          ipHash: expect.any(String),
          userAgent: 'Mozilla/5.0...',
          language: 'en-US',
          timestamp: expect.any(String),
        })
      );
    });

    it('should handle duplicate detection', async () => {
      turnstileService.isEnabled.mockReturnValue(false);
      inputSanitizationService.sanitizeInput.mockReturnValue(validDto);
      spamDetectionService.detectSpam.mockResolvedValue({
        isSpam: false,
        riskScore: 0.1,
        reasons: [],
      });
      registrationService.createRegistrationRequest.mockResolvedValue({
        requestId: 'REG-2024-000002',
        status: 'submitted',
        isDuplicate: true,
      });

      const result = await controller.createRegistrationRequest(validDto, mockIp, mockHeaders);

      expect(result).toEqual({
        success: true,
        requestId: 'REG-2024-000002',
        status: 'submitted',
        message: 'Registration request submitted successfully.',
        warning: 'A registration with similar details already exists. This may be a sibling or a resubmission. Our team will review it.',
      });
    });

    it('should require Turnstile token when bot protection is enabled', async () => {
      turnstileService.isEnabled.mockReturnValue(true);

      await expect(
        controller.createRegistrationRequest(validDto, mockIp, mockHeaders)
      ).rejects.toThrow(
        new ForbiddenException({
          success: false,
          error: {
            code: 'BOT_PROTECTION_REQUIRED',
            message: 'Bot protection verification required. Please refresh the page and try again.',
          },
        })
      );
    });

    it('should reject invalid Turnstile token', async () => {
      turnstileService.isEnabled.mockReturnValue(true);
      turnstileService.verifyToken.mockResolvedValue(false);

      const headersWithToken = {
        ...mockHeaders,
        'x-turnstile-token': 'invalid-token',
      };

      await expect(
        controller.createRegistrationRequest(validDto, mockIp, headersWithToken)
      ).rejects.toThrow(
        new ForbiddenException({
          success: false,
          error: {
            code: 'BOT_DETECTED',
            message: 'Bot protection verification failed. Please refresh the page and try again.',
          },
        })
      );
    });

    it('should reject spam requests', async () => {
      turnstileService.isEnabled.mockReturnValue(false);
      inputSanitizationService.sanitizeInput.mockReturnValue(validDto);
      spamDetectionService.detectSpam.mockResolvedValue({
        isSpam: true,
        riskScore: 0.9,
        reasons: ['suspicious_pattern', 'high_frequency'],
      });

      await expect(
        controller.createRegistrationRequest(validDto, mockIp, mockHeaders)
      ).rejects.toThrow(
        new ForbiddenException({
          success: false,
          error: {
            code: 'SPAM_DETECTED',
            message: 'Request flagged as spam. Please contact support if you believe this is an error.',
          },
        })
      );
    });

    it('should sanitize input data', async () => {
      turnstileService.isEnabled.mockReturnValue(false);
      
      const sanitizedDto = { ...validDto, student: { ...validDto.student, firstName: 'John' } };
      inputSanitizationService.sanitizeInput.mockReturnValue(sanitizedDto);
      inputSanitizationService.validateAndSanitizeEmail.mockReturnValue('jane@example.com');
      inputSanitizationService.validateAndSanitizeMobile.mockReturnValue('+966500000000');
      inputSanitizationService.sanitizeName.mockReturnValue('John');
      inputSanitizationService.sanitizeForMongoQuery.mockReturnValue(sanitizedDto);
      
      spamDetectionService.detectSpam.mockResolvedValue({
        isSpam: false,
        riskScore: 0.1,
        reasons: [],
      });
      registrationService.createRegistrationRequest.mockResolvedValue({
        requestId: 'REG-2024-000001',
        status: 'submitted',
        isDuplicate: false,
      });

      await controller.createRegistrationRequest(validDto, mockIp, mockHeaders);

      expect(inputSanitizationService.sanitizeInput).toHaveBeenCalledWith(validDto);
      expect(inputSanitizationService.validateAndSanitizeEmail).toHaveBeenCalledWith('jane@example.com');
      expect(inputSanitizationService.validateAndSanitizeMobile).toHaveBeenCalledWith('+966500000000');
      expect(inputSanitizationService.sanitizeName).toHaveBeenCalledWith('John');
    });

    it('should handle service errors gracefully', async () => {
      turnstileService.isEnabled.mockReturnValue(false);
      inputSanitizationService.sanitizeInput.mockReturnValue(validDto);
      spamDetectionService.detectSpam.mockResolvedValue({
        isSpam: false,
        riskScore: 0.1,
        reasons: [],
      });
      registrationService.createRegistrationRequest.mockRejectedValue(
        new BadRequestException('Validation failed')
      );

      await expect(
        controller.createRegistrationRequest(validDto, mockIp, mockHeaders)
      ).rejects.toThrow(BadRequestException);
    });

    it('should hash IP address for privacy', async () => {
      turnstileService.isEnabled.mockReturnValue(false);
      inputSanitizationService.sanitizeInput.mockReturnValue(validDto);
      spamDetectionService.detectSpam.mockResolvedValue({
        isSpam: false,
        riskScore: 0.1,
        reasons: [],
      });
      registrationService.createRegistrationRequest.mockResolvedValue({
        requestId: 'REG-2024-000001',
        status: 'submitted',
        isDuplicate: false,
      });

      await controller.createRegistrationRequest(validDto, mockIp, mockHeaders);

      expect(registrationService.createRegistrationRequest).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          ipHash: expect.any(String),
        })
      );

      const callArgs = registrationService.createRegistrationRequest.mock.calls[0][1];
      expect(callArgs.ipHash).toHaveLength(16); // SHA-256 truncated to 16 chars
      expect(callArgs.ipHash).not.toBe(mockIp); // Should not be the raw IP
    });

    it('should handle missing IP address', async () => {
      turnstileService.isEnabled.mockReturnValue(false);
      inputSanitizationService.sanitizeInput.mockReturnValue(validDto);
      spamDetectionService.detectSpam.mockResolvedValue({
        isSpam: false,
        riskScore: 0.1,
        reasons: [],
      });
      registrationService.createRegistrationRequest.mockResolvedValue({
        requestId: 'REG-2024-000001',
        status: 'submitted',
        isDuplicate: false,
      });

      await controller.createRegistrationRequest(validDto, '', mockHeaders);

      expect(registrationService.createRegistrationRequest).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          ipHash: expect.any(String),
        })
      );
    });

    it('should truncate user agent string', async () => {
      turnstileService.isEnabled.mockReturnValue(false);
      inputSanitizationService.sanitizeInput.mockReturnValue(validDto);
      spamDetectionService.detectSpam.mockResolvedValue({
        isSpam: false,
        riskScore: 0.1,
        reasons: [],
      });
      registrationService.createRegistrationRequest.mockResolvedValue({
        requestId: 'REG-2024-000001',
        status: 'submitted',
        isDuplicate: false,
      });

      const longUserAgent = 'A'.repeat(600);
      await controller.createRegistrationRequest(
        validDto,
        mockIp,
        { ...mockHeaders, 'user-agent': longUserAgent }
      );

      const callArgs = registrationService.createRegistrationRequest.mock.calls[0][1];
      expect(callArgs.userAgent).toHaveLength(500); // Truncated to 500 chars
    });

    it('should extract language from accept-language header', async () => {
      turnstileService.isEnabled.mockReturnValue(false);
      inputSanitizationService.sanitizeInput.mockReturnValue(validDto);
      spamDetectionService.detectSpam.mockResolvedValue({
        isSpam: false,
        riskScore: 0.1,
        reasons: [],
      });
      registrationService.createRegistrationRequest.mockResolvedValue({
        requestId: 'REG-2024-000001',
        status: 'submitted',
        isDuplicate: false,
      });

      await controller.createRegistrationRequest(
        validDto,
        mockIp,
        { ...mockHeaders, 'accept-language': 'fr-FR,fr;q=0.9,en;q=0.8' }
      );

      const callArgs = registrationService.createRegistrationRequest.mock.calls[0][1];
      expect(callArgs.language).toBe('fr-FR');
    });
  });
});