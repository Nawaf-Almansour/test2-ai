import { Test, TestingModule } from '@nestjs/testing';
import { RegistrationRepository } from './registration.repository';
import { CreateRegistrationData, DuplicateCheckCriteria } from './registration.repository';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';

describe('RegistrationRepository', () => {
  let repository: RegistrationRepository;
  let registrationModel: jest.Mocked<Model<any>>;

  const mockRegistrationModel = {
    create: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    limit: jest.fn(),
    skip: jest.fn(),
    lean: jest.fn(),
    exec: jest.fn(),
    countDocuments: jest.fn(),
    findOneAndUpdate: jest.fn(),
    bulkWrite: jest.fn(),
    collection: {
      findOneAndUpdate: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegistrationRepository,
        {
          provide: getModelToken('Registration'),
          useValue: mockRegistrationModel,
        },
      ],
    }).compile();

    repository = module.get<RegistrationRepository>(RegistrationRepository);
    registrationModel = module.get(getModelToken('Registration'));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const validData: CreateRegistrationData = {
      referenceNumber: 'REG-2024-000001',
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
      status: 'submitted',
      registrationConsent: true,
      metadata: {},
    };

    it('should create registration successfully', async () => {
      const createdRegistration = { ...validData, _id: 'some-id' };
      mockRegistrationModel.create.mockResolvedValue(createdRegistration);

      const result = await repository.create(validData);

      expect(result).toEqual(createdRegistration);
      expect(mockRegistrationModel.create).toHaveBeenCalledWith(validData);
    });

    it('should handle MongoDB duplicate key error', async () => {
      const duplicateError = new Error('Duplicate key');
      (duplicateError as any).code = 11000;
      mockRegistrationModel.create.mockRejectedValue(duplicateError);

      await expect(repository.create(validData)).rejects.toThrow(duplicateError);
    });

    it('should handle database connection errors', async () => {
      const dbError = new Error('Database connection failed');
      mockRegistrationModel.create.mockRejectedValue(dbError);

      await expect(repository.create(validData)).rejects.toThrow(dbError);
    });
  });

  describe('findDuplicate', () => {
    const criteria: DuplicateCheckCriteria = {
      guardianMobile: '+966500000000',
      studentFirstName: 'john',
      studentLastName: 'doe',
      dateOfBirth: '2015-05-15',
      requestedGrade: '1',
    };

    it('should find duplicate registration', async () => {
      const duplicate = {
        referenceNumber: 'REG-2024-000001',
        student: { firstName: 'John', lastName: 'Doe' },
      };
      
      mockRegistrationModel.findOne.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(duplicate),
        }),
      } as any);

      const result = await repository.findDuplicate(criteria);

      expect(result).toEqual(duplicate);
      expect(mockRegistrationModel.findOne).toHaveBeenCalledWith({
        'guardian.mobile': criteria.guardianMobile,
        'student.firstName': criteria.studentFirstName,
        'student.lastName': criteria.studentLastName,
        'student.dateOfBirth': criteria.dateOfBirth,
        'student.requestedGrade': criteria.requestedGrade,
      });
    });

    it('should return null when no duplicate found', async () => {
      mockRegistrationModel.findOne.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        }),
      } as any);

      const result = await repository.findDuplicate(criteria);

      expect(result).toBeNull();
    });

    it('should handle database errors during duplicate search', async () => {
      const dbError = new Error('Database query failed');
      mockRegistrationModel.findOne.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockRejectedValue(dbError),
        }),
      } as any);

      await expect(repository.findDuplicate(criteria)).rejects.toThrow(dbError);
    });
  });

  describe('findByReferenceNumber', () => {
    const referenceNumber = 'REG-2024-000001';

    it('should find registration by reference number', async () => {
      const registration = {
        referenceNumber,
        student: { firstName: 'John' },
      };
      
      mockRegistrationModel.findOne.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(registration),
        }),
      } as any);

      const result = await repository.findByReferenceNumber(referenceNumber);

      expect(result).toEqual(registration);
      expect(mockRegistrationModel.findOne).toHaveBeenCalledWith({
        referenceNumber,
      });
    });

    it('should return null when registration not found', async () => {
      mockRegistrationModel.findOne.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        }),
      } as any);

      const result = await repository.findByReferenceNumber(referenceNumber);

      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should return paginated results', async () => {
      const registrations = [
        { referenceNumber: 'REG-2024-000001' },
        { referenceNumber: 'REG-2024-000002' },
      ];

      const mockQuery = {
        limit: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(registrations),
      };

      mockRegistrationModel.find.mockReturnValue(mockQuery as any);

      const result = await repository.findAll(10, 20);

      expect(result).toEqual(registrations);
      expect(mockQuery.limit).toHaveBeenCalledWith(10);
      expect(mockQuery.skip).toHaveBeenCalledWith(20);
      expect(mockQuery.lean).toHaveBeenCalled();
      expect(mockQuery.exec).toHaveBeenCalled();
    });

    it('should use default pagination parameters', async () => {
      const mockQuery = {
        limit: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      };

      mockRegistrationModel.find.mockReturnValue(mockQuery as any);

      await repository.findAll();

      expect(mockQuery.limit).toHaveBeenCalledWith(50);
      expect(mockQuery.skip).toHaveBeenCalledWith(0);
    });

    it('should handle database errors during findAll', async () => {
      const dbError = new Error('Database query failed');
      const mockQuery = {
        limit: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockRejectedValue(dbError),
      };

      mockRegistrationModel.find.mockReturnValue(mockQuery as any);

      await expect(repository.findAll()).rejects.toThrow(dbError);
    });
  });

  describe('getNextSequenceValue', () => {
    const sequenceName = 'registration_2024';

    it('should get next sequence value', async () => {
      const updatedCounter = { _id: sequenceName, sequence_value: 42 };
      
      mockRegistrationModel.collection.findOneAndUpdate.mockReturnValue({
        value: updatedCounter,
      });

      const result = await repository.getNextSequenceValue(sequenceName);

      expect(result).toBe(42);
      expect(mockRegistrationModel.collection.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: sequenceName },
        { $inc: { sequence_value: 1 } },
        { upsert: true, returnDocument: 'after' }
      );
    });

    it('should handle MongoDB collection errors', async () => {
      const dbError = new Error('Collection operation failed');
      mockRegistrationModel.collection.findOneAndUpdate.mockImplementation(() => {
        throw dbError;
      });

      await expect(repository.getNextSequenceValue(sequenceName)).rejects.toThrow(dbError);
    });

    it('should handle counter initialization', async () => {
      const newCounter = { _id: sequenceName, sequence_value: 1 };
      
      mockRegistrationModel.collection.findOneAndUpdate.mockReturnValue({
        value: newCounter,
      });

      const result = await repository.getNextSequenceValue(sequenceName);

      expect(result).toBe(1);
    });
  });

  describe('countDocuments', () => {
    it('should count documents with filter', async () => {
      const filter = { status: 'submitted' };
      const count = 25;
      
      mockRegistrationModel.countDocuments.mockResolvedValue(count);

      const result = await repository.countDocuments(filter);

      expect(result).toBe(count);
      expect(mockRegistrationModel.countDocuments).toHaveBeenCalledWith(filter);
    });

    it('should count all documents when no filter provided', async () => {
      const count = 100;
      
      mockRegistrationModel.countDocuments.mockResolvedValue(count);

      const result = await repository.countDocuments();

      expect(result).toBe(count);
      expect(mockRegistrationModel.countDocuments).toHaveBeenCalledWith({});
    });

    it('should handle counting errors', async () => {
      const dbError = new Error('Count operation failed');
      mockRegistrationModel.countDocuments.mockRejectedValue(dbError);

      await expect(repository.countDocuments()).rejects.toThrow(dbError);
    });
  });

  describe('updateStatus', () => {
    const referenceNumber = 'REG-2024-000001';
    const newStatus = 'approved';

    it('should update registration status', async () => {
      const updatedRegistration = {
        referenceNumber,
        status: newStatus,
        updatedAt: new Date(),
      };
      
      mockRegistrationModel.findOneAndUpdate.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(updatedRegistration),
        }),
      } as any);

      const result = await repository.updateStatus(referenceNumber, newStatus);

      expect(result).toEqual(updatedRegistration);
      expect(mockRegistrationModel.findOneAndUpdate).toHaveBeenCalledWith(
        { referenceNumber },
        { 
          status: newStatus,
          updatedAt: expect.any(Date),
        },
        { new: true }
      );
    });

    it('should return null when registration not found for status update', async () => {
      mockRegistrationModel.findOneAndUpdate.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        }),
      } as any);

      const result = await repository.updateStatus(referenceNumber, newStatus);

      expect(result).toBeNull();
    });
  });

  describe('bulk operations', () => {
    it('should handle bulk write operations', async () => {
      const operations = [
        {
          updateOne: {
            filter: { referenceNumber: 'REG-2024-000001' },
            update: { $set: { status: 'approved' } },
          },
        },
      ];
      
      const bulkResult = {
        acknowledged: true,
        modifiedCount: 1,
        insertedCount: 0,
        deletedCount: 0,
      };
      
      mockRegistrationModel.bulkWrite.mockResolvedValue(bulkResult);

      const result = await repository.bulkWrite(operations);

      expect(result).toEqual(bulkResult);
      expect(mockRegistrationModel.bulkWrite).toHaveBeenCalledWith(operations);
    });

    it('should handle bulk write errors', async () => {
      const operations = [];
      const bulkError = new Error('Bulk write failed');
      mockRegistrationModel.bulkWrite.mockRejectedValue(bulkError);

      await expect(repository.bulkWrite(operations)).rejects.toThrow(bulkError);
    });
  });
});