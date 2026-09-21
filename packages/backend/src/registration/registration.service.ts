import { Injectable, BadRequestException, ConflictException, Logger } from '@nestjs/common';
import { RegistrationRepository, CreateRegistrationData, DuplicateCheckCriteria } from './repositories';
import { CreateRegistrationRequestDto } from './dto/create-registration-request.dto';
import { RegistrationStatus } from './enums/registration-status.enum';

@Injectable()
export class RegistrationService {
  private readonly logger = new Logger(RegistrationService.name);

  constructor(private readonly registrationRepository: RegistrationRepository) {}

  async createRegistrationRequest(
    createDto: CreateRegistrationRequestDto,
    metadata?: { ipHash?: string; userAgent?: string; language?: string },
  ): Promise<{ requestId: string; status: string; isDuplicate: boolean }> {
    // Validate required consent
    if (!createDto.registrationConsent) {
      throw new BadRequestException({
        code: 'VALIDATION_ERROR',
        message: 'Registration consent is required',
        fields: { registrationConsent: 'Registration consent must be true' },
      });
    }

    // Normalize mobile numbers
    const normalizedMobile = this.normalizeMobileNumber(createDto.guardian.mobile);
    const normalizedAltMobile = createDto.guardian.alternativeMobile
      ? this.normalizeMobileNumber(createDto.guardian.alternativeMobile)
      : undefined;

    // Check for duplicates (guardian.mobile + student name + DOB + requested grade)
    const duplicateCriteria: DuplicateCheckCriteria = {
      guardianMobile: normalizedMobile,
      studentFirstName: createDto.student.firstName.trim().toLowerCase(),
      studentLastName: createDto.student.lastName.trim().toLowerCase(),
      dateOfBirth: createDto.student.dateOfBirth,
      requestedGrade: createDto.student.requestedGrade,
    };

    const duplicate = await this.registrationRepository.findDuplicate(duplicateCriteria);
    const isDuplicate = !!duplicate;

    if (duplicate) {
      this.logger.warn(
        `Possible duplicate registration detected for reference: ${duplicate.referenceNumber}`,
      );
      // Per spec: do NOT auto-reject duplicates — siblings and legitimate resubmissions exist
    }

    // Generate sequential reference number (REG-2026-000123)
    const referenceNumber = await this.generateReferenceNumber();

    // Build the registration data
    const registrationData: CreateRegistrationData = {
      referenceNumber,
      student: {
        firstName: this.sanitizeString(createDto.student.firstName),
        middleName: createDto.student.middleName
          ? this.sanitizeString(createDto.student.middleName)
          : undefined,
        lastName: this.sanitizeString(createDto.student.lastName),
        dateOfBirth: createDto.student.dateOfBirth,
        gender: createDto.student.gender,
        nationality: createDto.student.nationality?.trim().toUpperCase(),
        nationalId: createDto.student.nationalId?.trim(),
        currentSchool: createDto.student.currentSchool?.trim(),
        currentGrade: createDto.student.currentGrade,
        requestedGrade: createDto.student.requestedGrade,
      },
      guardian: {
        firstName: this.sanitizeString(createDto.guardian.firstName),
        lastName: this.sanitizeString(createDto.guardian.lastName),
        relationship: createDto.guardian.relationship,
        mobile: normalizedMobile,
        alternativeMobile: normalizedAltMobile,
        email: createDto.guardian.email?.trim().toLowerCase() || undefined,
        preferredContactMethod: createDto.guardian.preferredContactMethod,
      },
      academic: createDto.academic
        ? {
            previousSchool: createDto.academic.previousSchool?.trim(),
            currentGrade: createDto.academic.currentGrade,
            transferReason: createDto.academic.transferReason?.trim(),
          }
        : {},
      transportationRequired: createDto.transportationRequired ?? false,
      siblingAtSchool: createDto.siblingAtSchool ?? false,
      source: createDto.source?.trim(),
      notes: createDto.notes?.trim(),
      registrationConsent: createDto.registrationConsent,
      marketingConsent: createDto.marketingConsent ?? false,
      status: RegistrationStatus.SUBMITTED,
      metadata: metadata || {},
    };

    try {
      await this.registrationRepository.create(registrationData);

      this.logger.log(
        `Registration request created: ref=${referenceNumber} status=${RegistrationStatus.SUBMITTED} duplicate=${isDuplicate}`,
      );

      return {
        requestId: referenceNumber,
        status: RegistrationStatus.SUBMITTED,
        isDuplicate,
      };
    } catch (error: any) {
      // Handle MongoDB duplicate key error
      if (error.code === 11000) {
        this.logger.warn(`Duplicate reference number collision, retrying...`);
        // Retry with a new reference number
        const retryRef = await this.generateReferenceNumber();
        registrationData.referenceNumber = retryRef;
        try {
          await this.registrationRepository.create(registrationData);
          return {
            requestId: retryRef,
            status: RegistrationStatus.SUBMITTED,
            isDuplicate,
          };
        } catch (retryError: any) {
          this.logger.error(
            `Failed to create registration request on retry: ${retryError.message}`,
          );
          throw new BadRequestException({
            code: 'REGISTRATION_FAILED',
            message: 'Failed to submit registration request. Please try again.',
          });
        }
      }

      this.logger.error(
        `Failed to create registration request: ${error.message || error}`,
      );
      throw new BadRequestException({
        code: 'REGISTRATION_FAILED',
        message: 'Failed to submit registration request. Please try again.',
      });
    }
  }

  async findByReferenceNumber(referenceNumber: string): Promise<any | null> {
    return this.registrationRepository.findByReferenceNumber(referenceNumber);
  }

  async findAll(limit = 50, offset = 0): Promise<any[]> {
    return this.registrationRepository.findAll(limit, offset);
  }

  /**
   * Generate a sequential reference number in format REG-YYYY-NNNNNN
   * Uses an atomic counter in MongoDB for concurrency safety
   */
  private async generateReferenceNumber(): Promise<string> {
    const year = new Date().getFullYear();
    try {
      const sequence = await this.registrationRepository.getNextSequenceValue(
        `registration_${year}`,
      );
      const padded = sequence.toString().padStart(6, '0');
      return `REG-${year}-${padded}`;
    } catch {
      // Fallback: timestamp-based unique number if counter collection unavailable
      const timestamp = Date.now().toString().slice(-6);
      const random = Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, '0');
      this.logger.warn(
        'Using fallback reference number generation (counter unavailable)',
      );
      return `REG-${year}-${timestamp}${random}`.substring(0, 16);
    }
  }

  /**
   * Normalize Saudi mobile number to +9665XXXXXXXX format
   */
  private normalizeMobileNumber(mobile: string): string {
    const digits = mobile.replace(/\D/g, '');

    if (digits.startsWith('9665') && digits.length === 12) {
      return `+${digits}`;
    } else if (digits.startsWith('05') && digits.length === 10) {
      return `+966${digits.substring(1)}`;
    } else if (digits.startsWith('5') && digits.length === 9) {
      return `+966${digits}`;
    }

    // Already in normalized format
    if (mobile.startsWith('+9665') && digits.length === 12) {
      return mobile;
    }

    throw new Error(`Invalid mobile number format: ${mobile}`);
  }

  /**
   * Sanitize string input: trim whitespace, strip HTML tags
   */
  private sanitizeString(value: string): string {
    return value
      .trim()
      .replace(/<[^>]*>/g, '') // Strip HTML tags
      .substring(0, 200); // Limit length as safety measure
  }
}
