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
}