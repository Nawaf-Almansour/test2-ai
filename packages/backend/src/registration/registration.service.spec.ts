import { Test, TestingModule } from '@nestjs/testing';
import { RegistrationService } from './registration.service';
import { RegistrationRepository } from './repositories';
import { CreateRegistrationRequestDto } from './dto/create-registration-request.dto';
import { RegistrationStatus } from './enums/registration-status.enum';
import { BadRequestException, ConflictException } from '@nestjs/common';

describe('RegistrationService', () => {
  let service: RegistrationService;
  let repository: jest.Mocked<RegistrationRepository>;

  const mockRepository = {
    findDuplicate: jest.fn(),
    create: jest.fn(),
    findByReferenceNumber: jest.fn(),
    findAll: jest.fn(),
    getNextSequenceValue: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegistrationService,
        {
          provide: RegistrationRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<RegistrationService>(RegistrationService);
    repository = module.get(RegistrationRepository);
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

    it('should create registration successfully', async () => {
      // Mock repository responses
      repository.findDuplicate.mockResolvedValue(null);
      repository.getNextSequenceValue.mockResolvedValue(1);
      repository.create.mockResolvedValue(undefined);

      const result = await service.createRegistrationRequest(validDto);

      expect(result).toEqual({
        requestId: 'REG-2024-000001',
        status: RegistrationStatus.SUBMITTED,
        isDuplicate: false,
      });

      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          referenceNumber: 'REG-2024-000001',
          student: expect.objectContaining({
            firstName: 'John',
            lastName: 'Doe',
          }),
          guardian: expect.objectContaining({
            mobile: '+966500000000',
          }),
          status: RegistrationStatus.SUBMITTED,
        })
      );
    });

    it('should throw BadRequestException when registration consent is missing', async () => {
      const invalidDto = { ...validDto, registrationConsent: false };

      await expect(service.createRegistrationRequest(invalidDto)).rejects.toThrow(
        new BadRequestException({
          code: 'VALIDATION_ERROR',
          message: 'Registration consent is required',
          fields: { registrationConsent: 'Registration consent must be true' },
        })
      );
    });

    it('should handle duplicate detection', async () => {
      const duplicateRegistration = {
        referenceNumber: 'REG-2024-000001',
        student: { firstName: 'John', lastName: 'Doe' },
      };

      repository.findDuplicate.mockResolvedValue(duplicateRegistration);
      repository.getNextSequenceValue.mockResolvedValue(2);
      repository.create.mockResolvedValue(undefined);

      const result = await service.createRegistrationRequest(validDto);

      expect(result.isDuplicate).toBe(true);
      expect(result.requestId).toBe('REG-2024-000002');
    });

    it('should normalize mobile numbers', async () => {
      const dtoWithVariousFormats = {
        ...validDto,
        guardian: {
          ...validDto.guardian,
          mobile: '0512345678', // Saudi format without +966
          alternativeMobile: '966509876543', // Saudi format without +
        },
      };

      repository.findDuplicate.mockResolvedValue(null);
      repository.getNextSequenceValue.mockResolvedValue(1);
      repository.create.mockResolvedValue(undefined);

      await service.createRegistrationRequest(dtoWithVariousFormats);

      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          guardian: expect.objectContaining({
            mobile: '+966512345678',
            alternativeMobile: '+966509876543',
          }),
        })
      );
    });

    it('should sanitize string inputs', async () => {
      const dtoWithDirtyData = {
        ...validDto,
        student: {
          ...validDto.student,
          firstName: '  John<script>alert("xss")</script>  ',
          lastName: '   Doe   ',
          nationality: '  sa  ',
        },
        guardian: {
          ...validDto.guardian,
          firstName: '  Jane  ',
          email: ' JANE@EXAMPLE.COM ',
        },
      };

      repository.findDuplicate.mockResolvedValue(null);
      repository.getNextSequenceValue.mockResolvedValue(1);
      repository.create.mockResolvedValue(undefined);

      await service.createRegistrationRequest(dtoWithVariousFormats);

      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          student: expect.objectContaining({
            firstName: 'Johnalert("xss")',
            lastName: 'Doe',
            nationality: 'SA',
          }),
          guardian: expect.objectContaining({
            firstName: 'Jane',
            email: 'jane@example.com',
          }),
        })
      );
    });

    it('should handle MongoDB duplicate key error', async () => {
      repository.findDuplicate.mockResolvedValue(null);
      repository.getNextSequenceValue
        .mockResolvedValueOnce(1)
        .mockResolvedValueOnce(2);
      
      // First call throws duplicate key error
      repository.create
        .mockRejectedValueOnce({ code: 11000 })
        .mockResolvedValueOnce(undefined);

      const result = await service.createRegistrationRequest(validDto);

      expect(result.requestId).toBe('REG-2024-000002');
      expect(repository.create).toHaveBeenCalledTimes(2);
    });

    it('should throw BadRequestException on retry failure', async () => {
      repository.findDuplicate.mockResolvedValue(null);
      repository.getNextSequenceValue.mockResolvedValue(1);
      repository.create
        .mockRejectedValueOnce({ code: 11000 })
        .mockRejectedValueOnce(new Error('Database error'));

      await expect(service.createRegistrationRequest(validDto)).rejects.toThrow(
        new BadRequestException({
          code: 'REGISTRATION_FAILED',
          message: 'Failed to submit registration request. Please try again.',
        })
      );
    });

    it('should handle repository errors', async () => {
      repository.findDuplicate.mockResolvedValue(null);
      repository.getNextSequenceValue.mockResolvedValue(1);
      repository.create.mockRejectedValue(new Error('Database connection failed'));

      await expect(service.createRegistrationRequest(validDto)).rejects.toThrow(
        new BadRequestException({
          code: 'REGISTRATION_FAILED',
          message: 'Failed to submit registration request. Please try again.',
        })
      );
    });

    it('should include metadata when provided', async () => {
      const metadata = {
        ipHash: 'hashed_ip',
        userAgent: 'Mozilla/5.0...',
        language: 'en-US',
      };

      repository.findDuplicate.mockResolvedValue(null);
      repository.getNextSequenceValue.mockResolvedValue(1);
      repository.create.mockResolvedValue(undefined);

      await service.createRegistrationRequest(validDto, metadata);

      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata,
        })
      );
    });
  });

  describe('findByReferenceNumber', () => {
    it('should return registration when found', async () => {
      const registration = { referenceNumber: 'REG-2024-000001', student: { firstName: 'John' } };
      repository.findByReferenceNumber.mockResolvedValue(registration);

      const result = await service.findByReferenceNumber('REG-2024-000001');

      expect(result).toEqual(registration);
      expect(repository.findByReferenceNumber).toHaveBeenCalledWith('REG-2024-000001');
    });

    it('should return null when not found', async () => {
      repository.findByReferenceNumber.mockResolvedValue(null);

      const result = await service.findByReferenceNumber('REG-2024-999999');

      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should return paginated results', async () => {
      const registrations = [
        { referenceNumber: 'REG-2024-000001' },
        { referenceNumber: 'REG-2024-000002' },
      ];
      repository.findAll.mockResolvedValue(registrations);

      const result = await service.findAll(10, 20);

      expect(result).toEqual(registrations);
      expect(repository.findAll).toHaveBeenCalledWith(10, 20);
    });

    it('should use default pagination parameters', async () => {
      repository.findAll.mockResolvedValue([]);

      await service.findAll();

      expect(repository.findAll).toHaveBeenCalledWith(50, 0);
    });
  });

  describe('mobile number normalization', () => {
    it('should normalize various Saudi mobile formats', async () => {
      const testCases = [
        { input: '+966500000000', expected: '+966500000000' },
        { input: '966500000000', expected: '+966500000000' },
        { input: '0512345678', expected: '+966512345678' },
        { input: '512345678', expected: '+966512345678' },
      ];

      for (const testCase of testCases) {
        const dto = {
          ...validDto,
          guardian: {
            ...validDto.guardian,
            mobile: testCase.input,
          },
        };

        repository.findDuplicate.mockResolvedValue(null);
        repository.getNextSequenceValue.mockResolvedValue(1);
        repository.create.mockResolvedValue(undefined);

        await service.createRegistrationRequest(dto);

        expect(repository.create).toHaveBeenCalledWith(
          expect.objectContaining({
            guardian: expect.objectContaining({
              mobile: testCase.expected,
            }),
          })
        );

        jest.clearAllMocks();
      }
    });

    it('should throw error for invalid mobile formats', async () => {
      const invalidMobiles = [
        '123456789',
        '+966123456789',
        'invalid',
        '+1234567890',
      ];

      for (const mobile of invalidMobiles) {
        const dto = {
          ...validDto,
          guardian: {
            ...validDto.guardian,
            mobile,
          },
        };

        await expect(service.createRegistrationRequest(dto)).rejects.toThrow(
          `Invalid mobile number format: ${mobile}`
        );
      }
    });
  });

  describe('reference number generation', () => {
    it('should generate sequential reference numbers', async () => {
      repository.findDuplicate.mockResolvedValue(null);
      repository.getNextSequenceValue.mockResolvedValue(42);
      repository.create.mockResolvedValue(undefined);

      const result = await service.createRegistrationRequest(validDto);

      expect(result.requestId).toBe('REG-2024-000042');
    });

    it('should use fallback reference generation when counter fails', async () => {
      repository.findDuplicate.mockResolvedValue(null);
      repository.getNextSequenceValue.mockRejectedValue(new Error('Counter unavailable'));
      repository.create.mockResolvedValue(undefined);

      const result = await service.createRegistrationRequest(validDto);

      expect(result.requestId).toMatch(/^REG-2024-\d{9}$/);
      expect(result.requestId).toHaveLength(16);
    });
  });
});