import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { RegistrationController } from '../src/registration/registration.controller';
import { RegistrationService } from '../src/registration/registration.service';
import { CreateRegistrationRequestDto } from '../src/registration/dto/create-registration-request.dto';
import { Gender, Grade, Relationship, ContactMethod } from '../src/registration/enums';

describe('RegistrationController', () => {
  let controller: RegistrationController;
  let service: RegistrationService;

  const mockService = {
    createRegistrationRequest: jest.fn(),
    findByReferenceNumber: jest.fn(),
    findAll: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RegistrationController],
      providers: [
        {
          provide: RegistrationService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<RegistrationController>(RegistrationController);
    service = module.get<RegistrationService>(RegistrationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const createValidDto = (): CreateRegistrationRequestDto => ({
    student: {
      firstName: 'Ahmed',
      lastName: 'Ali',
      dateOfBirth: new Date('2018-04-15'),
      gender: Gender.MALE,
      nationality: 'SA',
      requestedGrade: Grade.GRADE_1,
    },
    guardian: {
      firstName: 'Mohammed',
      lastName: 'Ali',
      relationship: Relationship.FATHER,
      mobile: '+966501234567',
      email: 'parent@example.com',
      preferredContactMethod: ContactMethod.WHATSAPP,
    },
    registrationConsent: true,
    marketingConsent: false,
  });

  describe('createRegistrationRequest', () => {
    it('should create registration successfully', async () => {
      const dto = createValidDto();
      const expectedResult = {
        requestId: 'REG-2026-000001',
        status: 'SUBMITTED',
        isDuplicate: false,
      };

      mockService.createRegistrationRequest.mockResolvedValue(expectedResult);

      const result = await controller.createRegistrationRequest(
        dto,
        '127.0.0.1',
        { 'user-agent': 'test-agent', 'accept-language': 'en-US,en;q=0.9' },
      );

      expect(result).toEqual({
        success: true,
        requestId: 'REG-2026-000001',
        status: 'submitted',
        message: 'Registration request submitted successfully.',
      });

      expect(mockService.createRegistrationRequest).toHaveBeenCalledWith(
        dto,
        {
          ipHash: expect.any(String), // Hashed IP
          userAgent: 'test-agent',
          language: 'en-US',
        },
      );
    });

    it('should include warning for duplicate registration', async () => {
      const dto = createValidDto();
      const expectedResult = {
        requestId: 'REG-2026-000001',
        status: 'SUBMITTED',
        isDuplicate: true,
      };

      mockService.createRegistrationRequest.mockResolvedValue(expectedResult);

      const result = await controller.createRegistrationRequest(dto, '127.0.0.1', {});

      expect(result).toEqual({
        success: true,
        requestId: 'REG-2026-000001',
        status: 'submitted',
        message: 'Registration request submitted successfully.',
        warning:
          'A registration with similar details already exists. This may be a sibling or a resubmission. Our team will review it.',
      });
    });

    it('should handle validation errors', async () => {
      const dto = createValidDto();
      const error = new BadRequestException({
        code: 'VALIDATION_ERROR',
        message: 'Invalid data',
        fields: { 'student.firstName': 'First name is required' },
      });

      mockService.createRegistrationRequest.mockRejectedValue(error);

      await expect(controller.createRegistrationRequest(dto, '127.0.0.1', {})).rejects.toThrow(
        error,
      );

      expect(mockService.createRegistrationRequest).toHaveBeenCalledWith(
        dto,
        {
          ipHash: expect.any(String),
          userAgent: undefined,
          language: undefined,
        },
      );
    });

    it('should handle service errors', async () => {
      const dto = createValidDto();
      const error = new Error('Database error');

      mockService.createRegistrationRequest.mockRejectedValue(error);

      await expect(controller.createRegistrationRequest(dto, '127.0.0.1', {})).rejects.toThrow(
        new BadRequestException({
          success: false,
          error: {
            code: 'REGISTRATION_FAILED',
            message: 'Failed to submit registration request. Please try again.',
          },
        }),
      );
    });

    it('should hash IP address for privacy', async () => {
      const dto = createValidDto();
      const ip = '192.168.1.1';

      mockService.createRegistrationRequest.mockResolvedValue({
        requestId: 'REG-2026-000001',
        status: 'SUBMITTED',
        isDuplicate: false,
      });

      await controller.createRegistrationRequest(ip, {}, {});

      expect(mockService.createRegistrationRequest).toHaveBeenCalledWith(
        dto,
        expect.objectContaining({
          ipHash: expect.not.stringContaining(ip), // Should not contain raw IP
        }),
      );
    });

    it('should limit user agent length', async () => {
      const dto = createValidDto();
      const longUserAgent = 'a'.repeat(1000);

      mockService.createRegistrationRequest.mockResolvedValue({
        requestId: 'REG-2026-000001',
        status: 'SUBMITTED',
        isDuplicate: false,
      });

      await controller.createRegistrationRequest(dto, '127.0.0.1', {
        'user-agent': longUserAgent,
      });

      expect(mockService.createRegistrationRequest).toHaveBeenCalledWith(
        dto,
        expect.objectContaining({
          userAgent: 'a'.repeat(500), // Should be truncated
        }),
      );
    });

    it('should handle missing IP address', async () => {
      const dto = createValidDto();

      mockService.createRegistrationRequest.mockResolvedValue({
        requestId: 'REG-2026-000001',
        status: 'SUBMITTED',
        isDuplicate: false,
      });

      await controller.createRegistrationRequest(dto, undefined, {});

      expect(mockService.createRegistrationRequest).toHaveBeenCalledWith(
        dto,
        expect.objectContaining({
          ipHash: expect.any(String), // Should still hash 'unknown'
        }),
      );
    });
  });
});