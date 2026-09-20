import { Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import { ResponseTransformInterceptor } from './interceptors/response-transform.interceptor';
import { LoggingInterceptor } from './interceptors/logging.interceptor';
import { TurnstileService } from './security/turnstile.service';
import { SpamDetectionService } from './security/spam-detection.service';
import { InputSanitizationService } from './security/input-sanitization.service';

@Module({
  providers: [
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseTransformInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    TurnstileService,
    SpamDetectionService,
    InputSanitizationService,
  ],
  exports: [
    TurnstileService,
    SpamDetectionService,
    InputSanitizationService,
  ],
})
export class CommonModule {}