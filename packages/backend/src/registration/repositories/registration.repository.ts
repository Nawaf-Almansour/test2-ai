import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  RegistrationRequest,
  RegistrationRequestDocument,
} from '../schemas/registration-request.schema';

export interface CreateRegistrationData {
  referenceNumber: string;
  student: any;
  guardian: any;
  academic: any;
  transportationRequired?: boolean;
  siblingAtSchool?: boolean;
  source?: string;
  notes?: string;
  registrationConsent: boolean;
  marketingConsent: boolean;
  status: string;
  metadata?: any;
}

export interface DuplicateCheckCriteria {
  guardianMobile: string;
  studentFirstName: string;
  studentLastName: string;
  dateOfBirth: Date;
  requestedGrade: string;
}

@Injectable()
export class RegistrationRepository {
  private readonly logger = new Logger(RegistrationRepository.name);

  constructor(
    @InjectModel(RegistrationRequest.name)
    private readonly registrationModel: Model<RegistrationRequestDocument>,
  ) {}

  async create(data: CreateRegistrationData): Promise<RegistrationRequestDocument> {
    const registration = new this.registrationModel(data);
    return registration.save();
  }

  async findByReferenceNumber(
    referenceNumber: string,
  ): Promise<RegistrationRequestDocument | null> {
    return this.registrationModel.findOne({ referenceNumber }).exec();
  }

  async findDuplicate(criteria: DuplicateCheckCriteria): Promise<RegistrationRequestDocument | null> {
    return this.registrationModel
      .findOne({
        'guardian.mobile': criteria.guardianMobile,
        'student.firstName': criteria.studentFirstName,
        'student.lastName': criteria.studentLastName,
        'student.dateOfBirth': criteria.dateOfBirth,
        'student.requestedGrade': criteria.requestedGrade,
      })
      .exec();
  }

  async getNextSequenceValue(sequenceName: string): Promise<number> {
    const result = await (this.registrationModel.db as any)
      .collection('counters')
      .findOneAndUpdate(
        { _id: sequenceName },
        { $inc: { sequence_value: 1 } },
        { upsert: true, returnDocument: 'after' },
      );
    return result.value?.sequence_value ?? 1;
  }

  async findAll(
    limit = 50,
    offset = 0,
  ): Promise<RegistrationRequestDocument[]> {
    return this.registrationModel
      .find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(offset)
      .exec();
  }

  async findByStatus(
    status: string,
    limit = 50,
    offset = 0,
  ): Promise<RegistrationRequestDocument[]> {
    return this.registrationModel
      .find({ status })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(offset)
      .exec();
  }

  async countByStatus(status: string): Promise<number> {
    return this.registrationModel.countDocuments({ status }).exec();
  }
}
