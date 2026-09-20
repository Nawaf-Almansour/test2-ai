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
} from '@nestjs/common';
import { ThrottlerGuard, ThrottlerRateLimitExceptions } from '@nestjs/throttler';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import * as crypto from 'crypto';
import { RegistrationService } from './registration.service';
import { CreateRegistrationRequestDto } from './dto/create-registration-request.dto';
import { RegistrationResponseDto, DuplicateRegistrationResponseDto, ErrorResponseDto } from './dto/registration-response.dto';

@ApiTags('registration')
@Controller('api/v1/registration-requests')
@UseGuards(ThrottlerGuard)
export class RegistrationController {
  private readonly logger = new Logger(RegistrationController.name);

  constructor(private readonly registrationService: RegistrationService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Submit a registration request',
    description:
      'Public endpoint to submit a new school registration request. No authentication required.',
  })
  @ApiResponse({
    status: 201,
    description: 'Registration request submitted successfully',
    type: RegistrationResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request data',
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
      const metadata = {
        ipHash: this.hashIp(ip || 'unknown'),
        userAgent: headers['user-agent']?.substring(0, 500),
        language: headers['accept-language']?.split(',')[0],
      };

      // Create registration request
      const result = await this.registrationService.createRegistrationRequest(
        createDto,
        metadata,
      );

      const duration = Date.now() - startTime;
      this.logger.log(
        `Registration created: ref=${result.requestId} status=${result.status} duplicate=${result.isDuplicate} duration=${duration}ms`,
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

      if (error instanceof BadRequestException) {
        const exceptionResponse = error.getResponse();
        this.logger.warn(
          `Invalid registration request in ${duration}ms: ${JSON.stringify(exceptionResponse)}`,
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
