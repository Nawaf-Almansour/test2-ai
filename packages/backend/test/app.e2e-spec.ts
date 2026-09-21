import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { Gender, Grade, Relationship, ContactMethod } from '../src/registration/enums';

describe('Registration API (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  const validRegistration = {
    student: {
      firstName: 'Ahmed',
      lastName: 'Ali',
      dateOfBirth: '2018-04-15',
      gender: Gender.MALE,
      nationality: 'SA',
      requestedGrade: Grade.GRADE_1,
    },
    guardian: {
      firstName: 'Mohammed',
      lastName: 'Ali',
      relationship: Relationship.FATHER,
      mobile: '+966501234567',
      email: 'parent@example.com',
      preferredContactMethod: ContactMethod.WHATSAPP,
    },
    registrationConsent: true,
    marketingConsent: false,
  };

  describe('POST /api/v1/registration-requests', () => {
    it('should create registration successfully', async () => {
      return request(app.getHttpServer())
        .post('/api/v1/registration-requests')
        .send(validRegistration)
        .expect(201)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.requestId).toMatch(/^REG-\d{4}-\d{6}$/);
          expect(res.body.status).toBe('submitted');
          expect(res.body.message).toBe('Registration request submitted successfully.');
        });
    });

    it('should handle invalid mobile number', async () => {
      const invalidRegistration = {
        ...validRegistration,
        guardian: {
          ...validRegistration.guardian,
          mobile: '123456789', // Invalid format
        },
      };

      return request(app.getHttpServer())
        .post('/api/v1/registration-requests')
        .send(invalidRegistration)
        .expect(400)
        .expect((res) => {
          expect(res.body.success).toBe(false);
          expect(res.body.error.code).toBe('VALIDATION_ERROR');
          expect(res.body.error.fields['guardian.mobile']).toContain('Mobile number must be a valid');
        });
    });

    it('should handle missing consent', async () => {
      const invalidRegistration = {
        ...validRegistration,
        registrationConsent: false,
      };

      return request(app.getHttpServer())
        .post('/api/v1/registration-requests')
        .send(invalidRegistration)
        .expect(400)
        .expect((res) => {
          expect(res.body.success).toBe(false);
          expect(res.body.error.code).toBe('VALIDATION_ERROR');
          expect(res.body.error.fields['registrationConsent']).toContain('Registration consent must be true');
        });
    });

    it('should handle invalid email', async () => {
      const invalidRegistration = {
        ...validRegistration,
        guardian: {
          ...validRegistration.guardian,
          email: 'invalid-email',
        },
      };

      return request(app.getHttpServer())
        .post('/api/v1/registration-requests')
        .send(invalidRegistration)
        .expect(400)
        .expect((res) => {
          expect(res.body.success).toBe(false);
          expect(res.body.error.code).toBe('VALIDATION_ERROR');
          expect(res.body.error.fields['guardian.email']).toContain('Email must be a valid');
        });
    });

    it('should handle invalid gender', async () => {
      const invalidRegistration = {
        ...validRegistration,
        student: {
          ...validRegistration.student,
          gender: 'invalid',
        },
      };

      return request(app.getHttpServer())
        .post('/api/v1/registration-requests')
        .send(invalidRegistration)
        .expect(400)
        .expect((res) => {
          expect(res.body.success).toBe(false);
          expect(res.body.error.code).toBe('VALIDATION_ERROR');
        });
    });

    it('should handle missing required fields', async () => {
      const invalidRegistration = {
        student: {
          firstName: 'Ahmed',
          // Missing lastName
        },
        guardian: {
          firstName: 'Mohammed',
          lastName: 'Ali',
          relationship: Relationship.FATHER,
          mobile: '+966501234567',
          preferredContactMethod: ContactMethod.WHATSAPP,
        },
        registrationConsent: true,
      };

      return request(app.getHttpServer())
        .post('/api/v1/registration-requests')
        .send(invalidRegistration)
        .expect(400)
        .expect((res) => {
          expect(res.body.success).toBe(false);
          expect(res.body.error.code).toBe('VALIDATION_ERROR');
        });
    });

    it('should normalize local mobile numbers', async () => {
      const localMobileRegistration = {
        ...validRegistration,
        guardian: {
          ...validRegistration.guardian,
          mobile: '0512345678', // Local format
        },
      };

      return request(app.getHttpServer())
        .post('/api/v1/registration-requests')
        .send(localMobileRegistration)
        .expect(201)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.requestId).toMatch(/^REG-\d{4}-\d{6}$/);
        });
    });

    it('should handle optional fields', async () => {
      const minimalRegistration = {
        student: {
          firstName: 'Ahmed',
          lastName: 'Ali',
          dateOfBirth: '2018-04-15',
          gender: Gender.MALE,
          nationality: 'SA',
          requestedGrade: Grade.GRADE_1,
        },
        guardian: {
          firstName: 'Mohammed',
          lastName: 'Ali',
          relationship: Relationship.FATHER,
          mobile: '+966501234567',
          preferredContactMethod: ContactMethod.WHATSAPP,
        },
        registrationConsent: true,
      };

      return request(app.getHttpServer())
        .post('/api/v1/registration-requests')
        .send(minimalRegistration)
        .expect(201)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.requestId).toMatch(/^REG-\d{4}-\d{6}$/);
        });
    });
  });

  describe('GET /api/v1/health', () => {
    it('should return health status', async () => {
      return request(app.getHttpServer())
        .get('/api/v1/health')
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBe('ok');
          expect(res.body.info).toBeDefined();
        });
    });
  });

  describe('Swagger Documentation', () => {
    it('should serve swagger docs in development', async () => {
      // Only test if swagger is enabled
      if (process.env.NODE_ENV !== 'production') {
        return request(app.getHttpServer())
          .get('/api/docs')
          .expect(200);
      }
    });
  });
});