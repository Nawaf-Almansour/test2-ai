import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { TurnstileService } from '../../src/common/security/turnstile.service';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('TurnstileService', () => {
  let service: TurnstileService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TurnstileService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'turnstile.secretKey') {
                return 'test-secret-key';
              }
              return undefined;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<TurnstileService>(TurnstileService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('verifyToken', () => {
    it('should verify token successfully', async () => {
      const mockResponse = {
        data: {
          success: true,
          challenge_ts: '2023-12-01T10:00:00Z',
          hostname: 'example.com',
        },
      };

      mockedAxios.post.mockResolvedValue(mockResponse);

      const result = await service.verifyToken('valid-token', '192.168.1.1');

      expect(result).toBe(true);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://challenges.cloudflare.com/turnstile/v0/siteverify',
        expect.any(FormData),
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 10000,
        }
      );
    });

    it('should reject invalid token', async () => {
      const mockResponse = {
        data: {
          success: false,
          'error-codes': ['invalid-input-secret'],
        },
      };

      mockedAxios.post.mockResolvedValue(mockResponse);

      const result = await service.verifyToken('invalid-token');

      expect(result).toBe(false);
    });

    it('should handle network errors', async () => {
      const error = new Error('Network error');
      mockedAxios.post.mockRejectedValue(error);

      const result = await service.verifyToken('any-token');

      expect(result).toBe(false);
    });

    it('should work without secret key (development mode)', async () => {
      // Mock config to return empty secret key
      jest.spyOn(configService, 'get').mockReturnValue('');

      const devService = new TurnstileService(configService);
      const result = await devService.verifyToken('any-token');

      expect(result).toBe(true);
      expect(mockedAxios.post).not.toHaveBeenCalled();
    });

    it('should include IP in verification request when provided', async () => {
      const mockResponse = {
        data: { success: true },
      };

      mockedAxios.post.mockResolvedValue(mockResponse);

      await service.verifyToken('valid-token', '192.168.1.1');

      const formData = mockedAxios.post.mock.calls[0][1] as FormData;
      expect(formData.get('remoteip')).toBe('192.168.1.1');
    });

    it('should handle timeout errors', async () => {
      const error = new Error('timeout');
      error.name = 'AbortError';
      mockedAxios.post.mockRejectedValue(error);

      const result = await service.verifyToken('valid-token');

      expect(result).toBe(false);
    });
  });

  describe('isEnabled', () => {
    it('should return true when secret key is configured', () => {
      expect(service.isEnabled()).toBe(true);
    });

    it('should return false when secret key is not configured', () => {
      jest.spyOn(configService, 'get').mockReturnValue('');
      const disabledService = new TurnstileService(configService);
      expect(disabledService.isEnabled()).toBe(false);
    });
  });

  describe('FormData construction', () => {
    it('should construct FormData correctly', async () => {
      const mockResponse = { data: { success: true } };
      mockedAxios.post.mockResolvedValue(mockResponse);

      const formDataSpy = jest.spyOn(global, 'FormData' as any);
      
      await service.verifyToken('test-token', '192.168.1.1');

      expect(formDataSpy).toHaveBeenCalled();
      
      const formData = mockedAxios.post.mock.calls[0][1] as FormData;
      expect(formData.get('secret')).toBe('test-secret-key');
      expect(formData.get('response')).toBe('test-token');
      expect(formData.get('remoteip')).toBe('192.168.1.1');
    });
  });
});