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
import { ThrottlerGuard } from '@nestjs/throttler';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import * as crypto from 'crypto';
import { RegistrationService } from './registration.service';
import { CreateRegistrationRequestDto } from './dto/create-registration-request.dto';
import { RegistrationResponseDto, ErrorResponseDto } from './dto/registration-response.dto';

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
    description: 'Public endpoint to submit a new school registration request. No authentication required.'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Registration request submitted successfully',
    type: RegistrationResponseDto 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Invalid request data',
    type: ErrorResponseDto 
  })
  @ApiResponse({ 
    status: 429, 
    description: 'Too many requests',
    type: ErrorResponseDto 
  })
  async createRegistrationRequest(
    @Body() createDto: CreateRegistrationRequestDto,
    @Ip() ip: string,
    @Headers() headers: Record<string, string>,
  ) {
    const startTime = Date.now();
    
    try {
      // Extract metadata for security and analytics
      const metadata = {
        ipHash: this.hashIp(ip),
        userAgent: headers['user-agent']?.substring(0, 500), // Limit length
        language: headers['accept-language']?.split(',')[0],
      };

      // Create registration request
      const result = await this.registrationService.createRegistrationRequest(
        createDto,
        metadata
      );

      const duration = Date.now() - startTime;
      this.logger.log(`Registration request created: ${result.requestId} in ${duration}ms`);

      return {
        success: true,
        requestId: result.requestId,
        status: result.status,
        message: 'Registration request submitted successfully.',
      };
    } catch (error: any) {
      const duration = Date.now() - startTime;
      
      if (error instanceof BadRequestException) {
        this.logger.warn(`Invalid registration request: ${error.message} in ${duration}ms`);
        throw error;
      }

      this.logger.error(`Registration request failed: ${error.message || error} in ${duration}ms`);
      
      throw new BadRequestException({
        success: false,
        error: {
          code: 'REGISTRATION_FAILED',
          message: 'Failed to submit registration request. Please try again.',
        },
      });
    }
  }

  private hashIp(ip: string): string {
    return crypto.createHash('sha256').update(ip).digest('hex').substring(0, 16);
  }
}