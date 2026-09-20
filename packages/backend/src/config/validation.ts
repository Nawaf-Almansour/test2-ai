import { plainToClass, Transform } from 'class-transformer';
import { IsString, IsNumber, IsOptional, IsBoolean, Min, Max } from 'class-validator';

export class EnvironmentVariables {
  @IsString()
  @IsOptional()
  NODE_ENV: string;

  @IsNumber()
  @Min(3000)
  @Max(9999)
  @IsOptional()
  PORT: number;

  @IsString()
  @IsOptional()
  MONGODB_URI: string;

  @IsString()
  @IsOptional()
  FRONTEND_URL: string;

  @IsNumber()
  @Min(60000)
  @Max(3600000)
  @IsOptional()
  THROTTLER_TTL: number;

  @IsNumber()
  @Min(1)
  @Max(100)
  @IsOptional()
  THROTTLER_LIMIT: number;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  SWAGGER_ENABLED: boolean;

  // Security configuration
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  HELMET_ENABLED: boolean;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  RATE_LIMIT_ENABLED: boolean;

  @IsNumber()
  @Min(60000)
  @Max(3600000)
  @IsOptional()
  IP_RATE_WINDOW_MS: number;

  @IsNumber()
  @Min(1)
  @Max(50)
  @IsOptional()
  IP_RATE_MAX: number;

  @IsNumber()
  @Min(3600000)
  @Max(86400000)
  @IsOptional()
  MOBILE_RATE_WINDOW_MS: number;

  @IsNumber()
  @Min(1)
  @Max(100)
  @IsOptional()
  MOBILE_RATE_MAX: number;

  @IsString()
  @IsOptional()
  PAYLOAD_LIMIT: string;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  TURNSTILE_ENABLED: boolean;

  @IsString()
  @IsOptional()
  TURNSTILE_SECRET_KEY: string;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  SPAM_DETECTION_ENABLED: boolean;

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  SPAM_RISK_THRESHOLD: number;
}