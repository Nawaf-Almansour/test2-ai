import { Test, TestingModule } from '@nestjs/testing';
import { Model } from 'mongoose';
import { RegistrationRepository } from '../src/registration/repositories/registration.repository';
import { RegistrationRequest } from '../src/registration/schemas/registration-request.schema';
import { Gender, Grade, Relationship } from '../src/registration/enums';

describe('RegistrationRepository', () => {
  let repository: RegistrationRepository;
  let model: Model<RegistrationRequest>;

  const mockRegistration = {
    referenceNumber: 'REG-2026-000001',
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
      preferredContactMethod: 'whatsapp',
    },
    registrationConsent: true,
    marketingConsent: false,
    status: 'SUBMITTED',
    save: jest.fn().mockResolvedValue(true),
  };

  const mockModel = {
    constructor: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    countDocuments: jest.fn(),
    db: {
      collection: {
        findOneAndUpdate: jest.fn(),
      },
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegistrationRepository,
        {
          provide: 'RegistrationRequestModel',
          useValue: mockModel,
        },
      ],
    }).compile();

    repository = module.get<RegistrationRepository>(RegistrationRepository);
    model = module.get<Model<RegistrationRequest>>('RegistrationRequestModel');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a registration successfully', async () => {
      const mockModelInstance = { ...mockRegistration };
      (mockModel.constructor as jest.Mock).mockImplementation(() => mockModelInstance);

      const result = await repository.create(mockRegistration);

      expect(mockModel.constructor).toHaveBeenCalledWith(mockRegistration);
      expect(mockModelInstance.save).toHaveBeenCalled();
      expect(result).toBe(mockModelInstance);
    });
  });

  describe('findByReferenceNumber', () => {
    it('should find registration by reference number', async () => {
      const referenceNumber = 'REG-2026-000001';
      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockRegistration),
      });

      const result = await repository.findByReferenceNumber(referenceNumber);

      expect(mockModel.findOne).toHaveBeenCalledWith({ referenceNumber });
      expect(result).toBe(mockRegistration);
    });

    it('should return null when not found', async () => {
      const referenceNumber = 'REG-999999';
      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await repository.findByReferenceNumber(referenceNumber);

      expect(result).toBeNull();
    });
  });

  describe('findDuplicate', () => {
    it('should find duplicate registration', async () => {
      const criteria = {
        guardianMobile: '+966501234567',
        studentFirstName: 'ahmed',
        studentLastName: 'ali',
        dateOfBirth: new Date('2018-04-15'),
        requestedGrade: Grade.GRADE_1,
      };

      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockRegistration),
      });

      const result = await repository.findDuplicate(criteria);

      expect(mockModel.findOne).toHaveBeenCalledWith({
        'guardian.mobile': criteria.guardianMobile,
        'student.firstName': criteria.studentFirstName,
        'student.lastName': criteria.studentLastName,
        'student.dateOfBirth': criteria.dateOfBirth,
        'student.requestedGrade': criteria.requestedGrade,
      });
      expect(result).toBe(mockRegistration);
    });

    it('should return null when no duplicate found', async () => {
      const criteria = {
        guardianMobile: '+966501234567',
        studentFirstName: 'ahmed',
        studentLastName: 'ali',
        dateOfBirth: new Date('2018-04-15'),
        requestedGrade: Grade.GRADE_1,
      };

      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await repository.findDuplicate(criteria);

      expect(result).toBeNull();
    });
  });

  describe('getNextSequenceValue', () => {
    it('should get next sequence value', async () => {
      const sequenceName = 'registration_2026';
      const mockResult = {
        value: { sequence_value: 5 },
      };

      mockModel.db.collection.findOneAndUpdate.mockResolvedValue(mockResult);

      const result = await repository.getNextSequenceValue(sequenceName);

      expect(mockModel.db.collection.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: sequenceName },
        { $inc: { sequence_value: 1 } },
        { upsert: true, returnDocument: 'after' },
      );
      expect(result).toBe(5);
    });

    it('should return 1 for new sequence', async () => {
      const sequenceName = 'registration_2026';
      const mockResult = {
        value: null,
      };

      mockModel.db.collection.findOneAndUpdate.mockResolvedValue(mockResult);

      const result = await repository.getNextSequenceValue(sequenceName);

      expect(result).toBe(1);
    });
  });

  describe('findAll', () => {
    it('should find all registrations with default parameters', async () => {
      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockRegistration]),
      };

      mockModel.find.mockReturnValue(mockQuery);

      const result = await repository.findAll();

      expect(mockModel.find).toHaveBeenCalled();
      expect(mockQuery.sort).toHaveBeenCalledWith({ createdAt: -1 });
      expect(mockQuery.limit).toHaveBeenCalledWith(50);
      expect(mockQuery.skip).toHaveBeenCalledWith(0);
      expect(result).toEqual([mockRegistration]);
    });

    it('should find all registrations with custom parameters', async () => {
      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockRegistration]),
      };

      mockModel.find.mockReturnValue(mockQuery);

      await repository.findAll(10, 20);

      expect(mockQuery.limit).toHaveBeenCalledWith(10);
      expect(mockQuery.skip).toHaveBeenCalledWith(20);
    });
  });

  describe('findByStatus', () => {
    it('should find registrations by status', async () => {
      const status = 'SUBMITTED';
      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockRegistration]),
      };

      mockModel.find.mockReturnValue(mockQuery);

      const result = await repository.findByStatus(status);

      expect(mockModel.find).toHaveBeenCalledWith({ status });
      expect(mockQuery.sort).toHaveBeenCalledWith({ createdAt: -1 });
      expect(result).toEqual([mockRegistration]);
    });
  });

  describe('countByStatus', () => {
    it('should count registrations by status', async () => {
      const status = 'SUBMITTED';
      const count = 10;

      mockModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(count),
      });

      const result = await repository.countByStatus(status);

      expect(mockModel.countDocuments).toHaveBeenCalledWith({ status });
      expect(result).toBe(count);
    });
  });
});