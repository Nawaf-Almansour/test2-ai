import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosError } from 'axios';

export interface TurnstileVerificationResponse {
  success: boolean;
  'error-codes'?: string[];
  challenge_ts?: string;
  hostname?: string;
}

@Injectable()
export class TurnstileService {
  private readonly logger = new Logger(TurnstileService.name);
  private readonly verifyUrl: string;
  private readonly secretKey: string;

  constructor(private configService: ConfigService) {
    this.verifyUrl = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
    this.secretKey = this.configService.get<string>('turnstile.secretKey') || '';
    
    if (!this.secretKey) {
      this.logger.warn('Turnstile secret key not configured. Bot protection will be disabled.');
    }
  }

  async verifyToken(token: string, ip?: string): Promise<boolean> {
    if (!this.secretKey) {
      // If no secret key configured, skip verification (development mode)
      return true;
    }

    try {
      const formData = new FormData();
      formData.append('secret', this.secretKey);
      formData.append('response', token);
      
      if (ip) {
        formData.append('remoteip', ip);
      }

      const response = await axios.post<TurnstileVerificationResponse>(
        this.verifyUrl,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 10000, // 10 second timeout
        }
      );

      const result = response.data;
      
      if (!result.success) {
        this.logger.warn(`Turnstile verification failed: ${JSON.stringify(result['error-codes'])}`);
        return false;
      }

      this.logger.debug('Turnstile verification successful');
      return true;
    } catch (error) {
      if (error instanceof AxiosError) {
        this.logger.error(`Turnstile verification error: ${error.message}`, error.stack);
      } else {
        this.logger.error('Unexpected error during Turnstile verification', error);
      }
      
      // Fail closed - if verification fails, block the request
      return false;
    }
  }

  isEnabled(): boolean {
    return !!this.secretKey;
  }
}