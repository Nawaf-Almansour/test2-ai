import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { RegistrationService } from '../src/registration/registration.service';
import { RegistrationRepository } from '../src/registration/repositories/registration.repository';
import { CreateRegistrationRequestDto } from '../src/registration/dto/create-registration-request.dto';
import { Gender, Grade, Relationship, ContactMethod, RegistrationStatus } from '../src/registration/enums';

describe('RegistrationService', () => {
  let service: RegistrationService;
  let repository: RegistrationRepository;

  const mockRepository = {
    create: jest.fn(),
    findByReferenceNumber: jest.fn(),
    findDuplicate: jest.fn(),
    getNextSequenceValue: jest.fn(),
    findAll: jest.fn(),
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
    repository = module.get<RegistrationRepository>(RegistrationRepository);
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
      const referenceNumber = 'REG-2026-000001';

      mockRepository.findDuplicate.mockResolvedValue(null);
      mockRepository.getNextSequenceValue.mockResolvedValue(1);
      mockRepository.create.mockResolvedValue({
        referenceNumber,
        status: RegistrationStatus.SUBMITTED,
      });

      const result = await service.createRegistrationRequest(dto);

      expect(result).toEqual({
        requestId: referenceNumber,
        status: RegistrationStatus.SUBMITTED,
        isDuplicate: false,
      });

      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          referenceNumber,
          student: expect.objectContaining({
            firstName: 'Ahmed',
            lastName: 'Ali',
            gender: Gender.MALE,
            nationality: 'SA',
            requestedGrade: Grade.GRADE_1,
          }),
          guardian: expect.objectContaining({
            firstName: 'Mohammed',
            lastName: 'Ali',
            mobile: '+966501234567',
            email: 'parent@example.com',
          }),
          registrationConsent: true,
          marketingConsent: false,
          status: RegistrationStatus.SUBMITTED,
        }),
      );
    });

    it('should detect duplicates and allow submission', async () => {
      const dto = createValidDto();
      const referenceNumber = 'REG-2026-000001';
      const duplicate = {
        referenceNumber: 'REG-2026-000001',
        status: RegistrationStatus.SUBMITTED,
      };

      mockRepository.findDuplicate.mockResolvedValue(duplicate as any);
      mockRepository.getNextSequenceValue.mockResolvedValue(2);
      mockRepository.create.mockResolvedValue({
        referenceNumber: 'REG-2026-000002',
        status: RegistrationStatus.SUBMITTED,
      });

      const result = await service.createRegistrationRequest(dto);

      expect(result.isDuplicate).toBe(true);
      expect(result.requestId).toBe('REG-2026-000002');
      expect(mockRepository.create).toHaveBeenCalled();
    });

    it('should throw error if registration consent is false', async () => {
      const dto = createValidDto();
      dto.registrationConsent = false;

      await expect(service.createRegistrationRequest(dto)).rejects.toThrow(
        new BadRequestException({
          code: 'VALIDATION_ERROR',
          message: 'Registration consent is required',
          fields: { registrationConsent: 'Registration consent must be true' },
        }),
      );

      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it('should handle mobile number normalization', async () => {
      const dto = createValidDto();
      dto.guardian.mobile = '0512345678'; // Local format

      mockRepository.findDuplicate.mockResolvedValue(null);
      mockRepository.getNextSequenceValue.mockResolvedValue(1);
      mockRepository.create.mockResolvedValue({
        referenceNumber: 'REG-2026-000001',
        status: RegistrationStatus.SUBMITTED,
      });

      await service.createRegistrationRequest(dto);

      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          guardian: expect.objectContaining({
            mobile: '+966512345678', // Should be normalized
          }),
        }),
      );
    });

    it('should handle alternative mobile number normalization', async () => {
      const dto = createValidDto();
      dto.guardian.alternativeMobile = '0598765432';
      dto.guardian.mobile = '+966501234567';

      mockRepository.findDuplicate.mockResolvedValue(null);
      mockRepository.getNextSequenceValue.mockResolvedValue(1);
      mockRepository.create.mockResolvedValue({
        referenceNumber: 'REG-2026-000001',
        status: RegistrationStatus.SUBMITTED,
      });

      await service.createRegistrationRequest(dto);

      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          guardian: expect.objectContaining({
            mobile: '+966501234567',
            alternativeMobile: '+966598765432', // Should be normalized
          }),
        }),
      );
    });

    it('should sanitize string inputs', async () => {
      const dto = createValidDto();
      dto.student.firstName = '  Ahmed<script>alert("xss")</script>  ';
      dto.notes = 'Some notes with <b>HTML</b> tags';

      mockRepository.findDuplicate.mockResolvedValue(null);
      mockRepository.getNextSequenceValue.mockResolvedValue(1);
      mockRepository.create.mockResolvedValue({
        referenceNumber: 'REG-2026-000001',
        status: RegistrationStatus.SUBMITTED,
      });

      await service.createRegistrationRequest(dto);

      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          student: expect.objectContaining({
            firstName: 'Ahmedalert("xss")', // HTML tags stripped, whitespace trimmed
          }),
          notes: 'Some notes with HTML tags', // HTML tags stripped
        }),
      );
    });

    it('should handle MongoDB duplicate key error with retry', async () => {
      const dto = createValidDto();

      mockRepository.findDuplicate.mockResolvedValue(null);
      mockRepository.getNextSequenceValue.mockResolvedValue(1);

      // First call throws duplicate key error
      mockRepository.create
        .mockRejectedValueOnce({ code: 11000 })
        .mockResolvedValueOnce({
          referenceNumber: 'REG-2026-000002',
          status: RegistrationStatus.SUBMITTED,
        });

      const result = await service.createRegistrationRequest(dto);

      expect(result.requestId).toBe('REG-2026-000002');
      expect(mockRepository.create).toHaveBeenCalledTimes(2);
    });

    it('should handle sequence counter fallback', async () => {
      const dto = createValidDto();

      mockRepository.findDuplicate.mockResolvedValue(null);
      mockRepository.getNextSequenceValue.mockRejectedValue(new Error('Counter unavailable'));
      mockRepository.create.mockResolvedValue({
        referenceNumber: 'REG-2026-000001',
        status: RegistrationStatus.SUBMITTED,
      });

      const result = await service.createRegistrationRequest(dto);

      expect(result.requestId).toMatch(/^REG-2026-\d+$/);
      expect(mockRepository.create).toHaveBeenCalled();
    });
  });

  describe('findByReferenceNumber', () => {
    it('should call repository with correct reference number', async () => {
      const referenceNumber = 'REG-2026-000001';
      const expected = { referenceNumber };

      mockRepository.findByReferenceNumber.mockResolvedValue(expected as any);

      const result = await service.findByReferenceNumber(referenceNumber);

      expect(result).toBe(expected);
      expect(mockRepository.findByReferenceNumber).toHaveBeenCalledWith(referenceNumber);
    });
  });

  describe('findAll', () => {
    it('should call repository with default parameters', async () => {
      const expected = [{ referenceNumber: 'REG-2026-000001' }];

      mockRepository.findAll.mockResolvedValue(expected as any);

      const result = await service.findAll();

      expect(result).toBe(expected);
      expect(mockRepository.findAll).toHaveBeenCalledWith(50, 0);
    });

    it('should call repository with custom parameters', async () => {
      const expected = [{ referenceNumber: 'REG-2026-000001' }];

      mockRepository.findAll.mockResolvedValue(expected as any);

      const result = await service.findAll(10, 20);

      expect(result).toBe(expected);
      expect(mockRepository.findAll).toHaveBeenCalledWith(10, 20);
    });
  });
});