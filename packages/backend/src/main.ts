import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import * as cors from 'cors';
import * as mongoSanitize from 'express-mongo-sanitize';
import { AppModule } from './app.module';
import { ipRateLimit, mobileRateLimit, payloadSizeLimit } from './common/security/security.middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Get configuration
  const config = app.get('ConfigService');
  const securityConfig = config.get('security');

  // Apply security middleware based on configuration
  if (securityConfig?.helmetEnabled !== false) {
    app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },
    }));
  }

  // CORS configuration
  const corsOptions = config.get('cors');
  app.use(cors(corsOptions));

  // MongoDB injection protection
  app.use(mongoSanitize());

  // Payload size limits
  const payloadLimit = securityConfig?.payloadLimit || '10mb';
  app.use(payloadSizeLimit(payloadLimit));

  // Rate limiting
  if (securityConfig?.rateLimitEnabled !== false) {
    // Apply IP-based rate limiting to all routes
    app.use('/api/v1/registration-requests', ipRateLimit);
    
    // Apply mobile-specific rate limiting to registration endpoint
    app.use('/api/v1/registration-requests', mobileRateLimit);
  }

  // Global validation pipe with strict settings
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      validationError: {
        target: false,
        value: false,
      },
    }),
  );

  // Swagger documentation (only in non-production)
  if (config.get('swagger.enabled')) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('School Platform API')
      .setDescription(
        'School Registration Platform API documentation. Provides endpoints for registration requests and health monitoring.',
      )
      .setVersion('1.0')
      .addTag('health', 'Health check endpoints')
      .addTag('registration', 'Registration request endpoints')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document);
  }

  const port = config.get('port') || 3001;
  await app.listen(port);
  
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`Environment: ${config.get('nodeEnv')}`);
  console.log(`Security features enabled: ${JSON.stringify({
    helmet: securityConfig?.helmetEnabled !== false,
    rateLimit: securityConfig?.rateLimitEnabled !== false,
    turnstile: securityConfig?.turnstile?.enabled,
    spamDetection: securityConfig?.spamDetection?.enabled,
  })}`);
  
  if (config.get('swagger.enabled')) {
    console.log(`Swagger docs available at: http://localhost:${port}/api/docs`);
  }
}

bootstrap();