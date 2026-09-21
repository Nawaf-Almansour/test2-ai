import { Test, TestingModule } from '@nestjs/testing';
import { TurnstileService } from './turnstile.service';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

describe('TurnstileService', () => {
  let service: TurnstileService;
  let httpService: jest.Mocked<HttpService>;
  let configService: jest.Mocked<ConfigService>;

  const mockHttpService = {
    post: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TurnstileService,
        {
          provide: HttpService,
          useValue: mockHttpService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<TurnstileService>(TurnstileService);
    httpService = module.get(HttpService);
    configService = module.get(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('isEnabled', () => {
    it('should return true when Turnstile is configured', () => {
      configService.get.mockImplementation((key) => {
        const config = {
          'TURNSTILE_SECRET_KEY': 'test-secret-key',
          'TURNSTILE_SITE_KEY': 'test-site-key',
        };
        return config[key];
      });

      expect(service.isEnabled()).toBe(true);
    });

    it('should return false when Turnstile is not configured', () => {
      configService.get.mockReturnValue(undefined);

      expect(service.isEnabled()).toBe(false);
    });

    it('should return false when secret key is missing', () => {
      configService.get.mockImplementation((key) => {
        const config = {
          'TURNSTILE_SECRET_KEY': undefined,
          'TURNSTILE_SITE_KEY': 'test-site-key',
        };
        return config[key];
      });

      expect(service.isEnabled()).toBe(false);
    });

    it('should return false when site key is missing', () => {
      configService.get.mockImplementation((key) => {
        const config = {
          'TURNSTILE_SECRET_KEY': 'test-secret-key',
          'TURNSTILE_SITE_KEY': undefined,
        };
        return config[key];
      });

      expect(service.isEnabled()).toBe(false);
    });
  });

  describe('verifyToken', () => {
    const token = 'test-token';
    const ip = '192.168.1.1';

    beforeEach(() => {
      configService.get.mockReturnValue('test-secret-key');
    });

    it('should verify valid token successfully', async () => {
      const validResponse = {
        data: {
          success: true,
          'error-codes': [],
          challenge_ts: '2024-01-01T00:00:00Z',
          hostname: 'example.com',
        },
      };

      mockHttpService.post.mockResolvedValue(validResponse);

      const result = await service.verifyToken(token, ip);

      expect(result).toBe(true);
      expect(mockHttpService.post).toHaveBeenCalledWith(
        'https://challenges.cloudflare.com/turnstile/v0/siteverify',
        expect.objectContaining({
          secret: 'test-secret-key',
          response: token,
          remoteip: ip,
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );
    });

    it('should verify valid token without IP', async () => {
      const validResponse = {
        data: {
          success: true,
          'error-codes': [],
          challenge_ts: '2024-01-01T00:00:00Z',
          hostname: 'example.com',
        },
      };

      mockHttpService.post.mockResolvedValue(validResponse);

      const result = await service.verifyToken(token);

      expect(result).toBe(true);
      expect(mockHttpService.post).toHaveBeenCalledWith(
        'https://challenges.cloudflare.com/turnstile/v0/siteverify',
        expect.objectContaining({
          secret: 'test-secret-key',
          response: token,
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );
    });

    it('should reject invalid token', async () => {
      const invalidResponse = {
        data: {
          success: false,
          'error-codes': ['invalid-input-response'],
          challenge_ts: '2024-01-01T00:00:00Z',
          hostname: 'example.com',
        },
      };

      mockHttpService.post.mockResolvedValue(invalidResponse);

      const result = await service.verifyToken(token, ip);

      expect(result).toBe(false);
    });

    it('should handle expired token', async () => {
      const expiredResponse = {
        data: {
          success: false,
          'error-codes': ['timeout-or-duplicate'],
          challenge_ts: '2024-01-01T00:00:00Z',
          hostname: 'example.com',
        },
      };

      mockHttpService.post.mockResolvedValue(expiredResponse);

      const result = await service.verifyToken(token, ip);

      expect(result).toBe(false);
    });

    it('should handle network errors', async () => {
      const networkError = new Error('Network error');
      mockHttpService.post.mockRejectedValue(networkError);

      const result = await service.verifyToken(token, ip);

      expect(result).toBe(false);
    });

    it('should handle malformed response', async () => {
      const malformedResponse = {
        data: {
          // Missing success field
          'error-codes': [],
        },
      };

      mockHttpService.post.mockResolvedValue(malformedResponse);

      const result = await service.verifyToken(token, ip);

      expect(result).toBe(false);
    });

    it('should handle empty response', async () => {
      const emptyResponse = { data: null };
      mockHttpService.post.mockResolvedValue(emptyResponse);

      const result = await service.verifyToken(token, ip);

      expect(result).toBe(false);
    });

    it('should handle timeout errors', async () => {
      const timeoutError = new Error('Request timeout');
      timeoutError.code = 'ECONNABORTED';
      mockHttpService.post.mockRejectedValue(timeoutError);

      const result = await service.verifyToken(token, ip);

      expect(result).toBe(false);
    });

    it('should handle rate limit errors from Cloudflare', async () => {
      const rateLimitResponse = {
        data: {
          success: false,
          'error-codes': ['rate-limit-exceeded'],
          challenge_ts: '2024-01-01T00:00:00Z',
          hostname: 'example.com',
        },
      };

      mockHttpService.post.mockResolvedValue(rateLimitResponse);

      const result = await service.verifyToken(token, ip);

      expect(result).toBe(false);
    });

    it('should handle missing token error', async () => {
      const missingTokenResponse = {
        data: {
          success: false,
          'error-codes': ['missing-input-response'],
          challenge_ts: '2024-01-01T00:00:00Z',
          hostname: 'example.com',
        },
      };

      mockHttpService.post.mockResolvedValue(missingTokenResponse);

      const result = await service.verifyToken('', ip);

      expect(result).toBe(false);
    });

    it('should validate token format', async () => {
      // Test with various invalid token formats
      const invalidTokens = [
        '',
        'too-short',
        'a'.repeat(1000), // Too long
        null as any,
        undefined as any,
      ];

      for (const invalidToken of invalidTokens) {
        const result = await service.verifyToken(invalidToken, ip);
        expect(result).toBe(false);
      }
    });
  });

  describe('error handling', () => {
    it('should handle HTTP error responses', async () => {
      const httpError = {
        response: {
          status: 400,
          data: {
            success: false,
            'error-codes': ['bad-request'],
          },
        },
      };

      mockHttpService.post.mockRejectedValue(httpError);

      const result = await service.verifyToken('token', 'ip');

      expect(result).toBe(false);
    });

    it('should handle 5xx server errors', async () => {
      const serverError = {
        response: {
          status: 500,
          data: 'Internal Server Error',
        },
      };

      mockHttpService.post.mockRejectedValue(serverError);

      const result = await service.verifyToken('token', 'ip');

      expect(result).toBe(false);
    });
  });
});