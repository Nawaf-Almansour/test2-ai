import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RegistrationRequest, RegistrationRequestDocument } from './schemas/registration-request.schema';
import { CreateRegistrationRequestDto } from './dto/create-registration-request.dto';
import { RegistrationStatus } from './enums/registration-status.enum';
import * as crypto from 'crypto';

@Injectable()
export class RegistrationService {
  private readonly logger = new Logger(RegistrationService.name);

  constructor(
    @InjectModel(RegistrationRequest.name)
    private registrationModel: Model<RegistrationRequestDocument>,
  ) {}

  async createRegistrationRequest(
    createDto: CreateRegistrationRequestDto,
    metadata?: { ipHash?: string; userAgent?: string; language?: string },
  ): Promise<{ requestId: string; status: string }> {
    // Validate required consent
    if (!createDto.registrationConsent) {
      throw new BadRequestException('Registration consent is required');
    }

    // Check for duplicates
    const duplicate = await this.checkForDuplicates(createDto);
    if (duplicate) {
      this.logger.warn(`Possible duplicate registration detected: ${duplicate.referenceNumber}`);
      // Don't reject duplicates, just log them for admin review
    }

    // Generate reference number
    const referenceNumber = this.generateReferenceNumber();

    // Create registration request
    const registrationRequest = new this.registrationModel({
      referenceNumber,
      student: createDto.student,
      guardian: {
        ...createDto.guardian,
        mobile: this.normalizeMobileNumber(createDto.guardian.mobile),
        alternativeMobile: createDto.guardian.alternativeMobile 
          ? this.normalizeMobileNumber(createDto.guardian.alternativeMobile) 
          : undefined,
      },
      academic: createDto.academic || {},
      transportationRequired: createDto.transportationRequired,
      siblingAtSchool: createDto.siblingAtSchool,
      source: createDto.source,
      notes: createDto.notes,
      registrationConsent: createDto.registrationConsent,
      marketingConsent: createDto.marketingConsent,
      status: RegistrationStatus.SUBMITTED,
      metadata: metadata || {},
    });

    try {
      await registrationRequest.save();
      
      this.logger.log(`Registration request created: ${referenceNumber}`);
      
      return {
        requestId: referenceNumber,
        status: RegistrationStatus.SUBMITTED,
      };
    } catch (error: any) {
      this.logger.error(`Failed to create registration request: ${error.message || error}`);
      throw new BadRequestException('Failed to create registration request');
    }
  }

  private async checkForDuplicates(createDto: CreateRegistrationRequestDto): Promise<RegistrationRequestDocument | null> {
    const normalizedMobile = this.normalizeMobileNumber(createDto.guardian.mobile);
    
    // Check for registration with same guardian mobile, student name, and date of birth
    const duplicate = await this.registrationModel.findOne({
      'guardian.mobile': normalizedMobile,
      'student.firstName': createDto.student.firstName.trim().toLowerCase(),
      'student.lastName': createDto.student.lastName.trim().toLowerCase(),
      'student.dateOfBirth': createDto.student.dateOfBirth,
    }).exec();

    return duplicate;
  }

  private normalizeMobileNumber(mobile: string): string {
    // Remove all non-digit characters
    const digits = mobile.replace(/\D/g, '');
    
    // Handle different formats
    if (digits.startsWith('9665')) {
      return `+${digits}`;
    } else if (digits.startsWith('05')) {
      return `+966${digits.substring(1)}`;
    } else if (digits.startsWith('5') && digits.length === 9) {
      return `+966${digits}`;
    }
    
    // Return as-is if it already starts with +966
    if (mobile.startsWith('+9665')) {
      return mobile;
    }
    
    throw new Error(`Invalid mobile number format: ${mobile}`);
  }

  private generateReferenceNumber(): string {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 999999).toString().padStart(6, '0');
    return `REG-${year}-${random}`;
  }

  async findByReferenceNumber(referenceNumber: string): Promise<RegistrationRequestDocument | null> {
    return this.registrationModel.findOne({ referenceNumber }).exec();
  }

  async findAll(limit = 50, offset = 0): Promise<RegistrationRequestDocument[]> {
    return this.registrationModel
      .find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(offset)
      .exec();
  }
}