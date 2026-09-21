import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Ip,
  Headers,
  BadRequestException,
  Logger,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { ApiTags, ApiOperation, ApiResponse, ApiHeader } from '@nestjs/swagger';
import * as crypto from 'crypto';
import { RegistrationService } from './registration.service';
import { CreateRegistrationRequestDto } from './dto/create-registration-request.dto';
import { RegistrationResponseDto, DuplicateRegistrationResponseDto, ErrorResponseDto } from './dto/registration-response.dto';
import { TurnstileService } from '../common/security/turnstile.service';
import { SpamDetectionService, RequestMetadata } from '../common/security/spam-detection.service';
import { InputSanitizationService } from '../common/security/input-sanitization.service';

@ApiTags('registration')
@Controller('api/v1/registration-requests')
@UseGuards(ThrottlerGuard)
export class RegistrationController {
  private readonly logger = new Logger(RegistrationController.name);

  constructor(
    private readonly registrationService: RegistrationService,
    private readonly turnstileService: TurnstileService,
    private readonly spamDetectionService: SpamDetectionService,
    private readonly inputSanitizationService: InputSanitizationService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Submit a registration request',
    description:
      'Public endpoint to submit a new school registration request. No authentication required. Protected by rate limiting, bot detection, and spam filtering.',
  })
  @ApiHeader({
    name: 'X-Turnstile-Token',
    description: 'Cloudflare Turnstile token for bot protection (optional if not configured)',
    required: false,
  })
  @ApiResponse({
    status: 201,
    description: 'Registration request submitted successfully',
    type: RegistrationResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request data or security violation',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Bot detected or spam detected',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 429,
    description: 'Too many requests',
    type: ErrorResponseDto,
  })
  async createRegistrationRequest(
    @Body() createDto: CreateRegistrationRequestDto,
    @Ip() ip: string,
    @Headers() headers: Record<string, string>,
  ) {
    const startTime = Date.now();

    try {
      // Extract metadata for security and analytics (no sensitive data logged)
      const metadata: RequestMetadata = {
        ipHash: this.hashIp(ip || 'unknown'),
        userAgent: headers['user-agent']?.substring(0, 500),
        language: headers['accept-language']?.split(',')[0],
        timestamp: new Date().toISOString(),
      };

      // 1. Bot protection with Cloudflare Turnstile
      if (this.turnstileService.isEnabled()) {
        const turnstileToken = headers['x-turnstile-token'];
        if (!turnstileToken) {
          this.logger.warn(`Missing Turnstile token: ipHash=${metadata.ipHash}`);
          throw new ForbiddenException({
            success: false,
            error: {
              code: 'BOT_PROTECTION_REQUIRED',
              message: 'Bot protection verification required. Please refresh the page and try again.',
            },
          });
        }

        const isValidBot = await this.turnstileService.verifyToken(turnstileToken, ip);
        if (!isValidBot) {
          this.logger.warn(`Invalid Turnstile token: ipHash=${metadata.ipHash}`);
          throw new ForbiddenException({
            success: false,
            error: {
              code: 'BOT_DETECTED',
              message: 'Bot protection verification failed. Please refresh the page and try again.',
            },
          });
        }
      }

      // 2. Input sanitization
      const sanitizedDto = this.sanitizeInput(createDto);

      // 3. Spam detection
      const spamResult = await this.spamDetectionService.detectSpam(sanitizedDto, metadata);
      if (spamResult.isSpam) {
        this.logger.warn(`Spam detected: ipHash=${metadata.ipHash} score=${spamResult.riskScore} reasons=${spamResult.reasons.join(',')}`);
        throw new ForbiddenException({
          success: false,
          error: {
            code: 'SPAM_DETECTED',
            message: 'Request flagged as spam. Please contact support if you believe this is an error.',
          },
        });
      }

      // 4. Create registration request
      const result = await this.registrationService.createRegistrationRequest(
        sanitizedDto,
        metadata,
      );

      const duration = Date.now() - startTime;
      this.logger.log(
        `Registration created: ref=${result.requestId} status=${result.status} duplicate=${result.isDuplicate} duration=${duration}ms riskScore=${spamResult.riskScore}`,
      );

      const response: any = {
        success: true,
        requestId: result.requestId,
        status: result.status.toLowerCase(),
        message: 'Registration request submitted successfully.',
      };

      // Per spec: do NOT auto-reject duplicates, but inform about possible duplicate
      if (result.isDuplicate) {
        response.warning =
          'A registration with similar details already exists. This may be a sibling or a resubmission. Our team will review it.';
      }

      return response;
    } catch (error: any) {
      const duration = Date.now() - startTime;

      if (error instanceof BadRequestException || error instanceof ForbiddenException) {
        const exceptionResponse = error.getResponse();
        this.logger.warn(
          `Security violation in ${duration}ms: ${JSON.stringify(exceptionResponse)}`,
        );
        throw error;
      }

      this.logger.error(
        `Registration request failed in ${duration}ms: ${error.message || error}`,
      );

      throw new BadRequestException({
        success: false,
        error: {
          code: 'REGISTRATION_FAILED',
          message:
            'Failed to submit registration request. Please try again.',
        },
      });
    }
  }

  /**
   * Sanitize input data to prevent XSS and injection attacks
   */
  private sanitizeInput(createDto: CreateRegistrationRequestDto): CreateRegistrationRequestDto {
    // Sanitize all input fields
    const sanitized = this.inputSanitizationService.sanitizeInput(createDto);
    
    // Additional validation for specific fields
    if (sanitized.guardian.email) {
      sanitized.guardian.email = this.inputSanitizationService.validateAndSanitizeEmail(sanitized.guardian.email);
    }
    
    if (sanitized.guardian.mobile) {
      sanitized.guardian.mobile = this.inputSanitizationService.validateAndSanitizeMobile(sanitized.guardian.mobile);
    }
    
    if (sanitized.guardian.alternativeMobile) {
      sanitized.guardian.alternativeMobile = this.inputSanitizationService.validateAndSanitizeMobile(sanitized.guardian.alternativeMobile);
    }
    
    if (sanitized.student.nationalId) {
      sanitized.student.nationalId = this.inputSanitizationService.sanitizeNationalId(sanitized.student.nationalId);
    }
    
    if (sanitized.notes) {
      sanitized.notes = this.inputSanitizationService.sanitizeNotes(sanitized.notes);
    }
    
    // Sanitize names
    sanitized.student.firstName = this.inputSanitizationService.sanitizeName(sanitized.student.firstName);
    sanitized.student.lastName = this.inputSanitizationService.sanitizeName(sanitized.student.lastName);
    if (sanitized.student.middleName) {
      sanitized.student.middleName = this.inputSanitizationService.sanitizeName(sanitized.student.middleName);
    }
    sanitized.guardian.firstName = this.inputSanitizationService.sanitizeName(sanitized.guardian.firstName);
    sanitized.guardian.lastName = this.inputSanitizationService.sanitizeName(sanitized.guardian.lastName);
    
    // Sanitize for MongoDB injection
    return this.inputSanitizationService.sanitizeForMongoQuery(sanitized);
  }

  /**
   * Hash IP address for privacy — never store raw IPs
   */
  private hashIp(ip: string): string {
    return crypto
      .createHash('sha256')
      .update(ip)
      .digest('hex')
      .substring(0, 16);
  }
}