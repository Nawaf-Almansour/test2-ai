import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  HealthCheck,
  HealthCheckService,
  HealthCheckResult,
} from '@nestjs/terminus';
import { MongoHealthIndicator } from './mongo.health';

@ApiTags('health')
@Controller('api/v1/health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private mongo: MongoHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  @ApiOperation({ summary: 'Check API health status' })
  @ApiResponse({
    status: 200,
    description: 'Health check result',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', enum: ['ok', 'error', 'degraded'] },
        info: { type: 'object' },
        error: { type: 'object' },
        details: { type: 'object' },
      },
    },
  })
  check(): Promise<HealthCheckResult> {
    return this.health.check([() => this.mongo.isHealthy('mongodb')]);
  }
}
