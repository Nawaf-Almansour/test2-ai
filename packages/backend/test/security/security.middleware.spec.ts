import { Test, TestingModule } from '@nestjs/testing';
import { SecurityMiddleware, ipRateLimit, mobileRateLimit, payloadSizeLimit } from '../../src/common/security/security.middleware';
import { Request, Response, NextFunction } from 'express';

describe('SecurityMiddleware', () => {
  let middleware: SecurityMiddleware;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(async () => {
    middleware = new SecurityMiddleware();
    mockRequest = {
      ip: '192.168.1.1',
      method: 'POST',
      path: '/api/v1/registration-requests',
      get: jest.fn(),
    };
    mockResponse = {
      setHeader: jest.fn(),
    };
    mockNext = jest.fn();
  });

  describe('use', () => {
    it('should add security headers and call next', () => {
      middleware.use(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.setHeader).toHaveBeenCalledWith('X-Content-Type-Options', 'nosniff');
      expect(mockResponse.setHeader).toHaveBeenCalledWith('X-Frame-Options', 'DENY');
      expect(mockResponse.setHeader).toHaveBeenCalledWith('X-XSS-Protection', '1; mode=block');
      expect(mockResponse.setHeader).toHaveBeenCalledWith('Referrer-Policy', 'strict-origin-when-cross-origin');
      expect(mockResponse.setHeader).toHaveBeenCalledWith('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
      expect(mockNext).toHaveBeenCalled();
    });

    it('should log request metadata with privacy-safe information', () => {
      const spy = jest.spyOn(middleware['logger'], 'debug');
      mockRequest.get = jest.fn().mockReturnValue('Mozilla/5.0...');

      middleware.use(mockRequest as Request, mockResponse as Response, mockNext);

      expect(spy).toHaveBeenCalled();
      const loggedData = JSON.parse(spy.mock.calls[0][0]);
      expect(loggedData).toHaveProperty('ipHash');
      expect(loggedData).toHaveProperty('userAgent');
      expect(loggedData).toHaveProperty('language');
      expect(loggedData).toHaveProperty('method');
      expect(loggedData).toHaveProperty('path');
      expect(loggedData).toHaveProperty('timestamp');
      expect(loggedData.ipHash).toHaveLength(16); // Hashed IP should be 16 characters
    });
  });
});

describe('Rate Limiting', () => {
  describe('payloadSizeLimit', () => {
    it('should allow requests within size limit', () => {
      const middleware = payloadSizeLimit('1mb');
      const mockRequest = {
        get: jest.fn().mockReturnValue('100000'), // 100KB
      };
      const mockResponse = {};
      const mockNext = jest.fn();

      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should reject requests exceeding size limit', () => {
      const middleware = payloadSizeLimit('1kb');
      const mockRequest = {
        get: jest.fn().mockReturnValue('2000'), // 2KB exceeds 1KB limit
      };
      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const mockNext = jest.fn();

      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(413);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'PAYLOAD_TOO_LARGE',
          message: 'Request payload too large. Maximum size is 1kb.',
        },
      });
    });
  });
});

describe('IP Hashing', () => {
  it('should generate consistent hash for same IP', () => {
    const middleware = new SecurityMiddleware();
    const ip = '192.168.1.1';
    const hash1 = middleware['hashIp'](ip);
    const hash2 = middleware['hashIp'](ip);

    expect(hash1).toBe(hash2);
    expect(hash1).toHaveLength(16);
    expect(hash1).toMatch(/^[a-f0-9]{16}$/);
  });

  it('should generate different hashes for different IPs', () => {
    const middleware = new SecurityMiddleware();
    const hash1 = middleware['hashIp']('192.168.1.1');
    const hash2 = middleware['hashIp']('192.168.1.2');

    expect(hash1).not.toBe(hash2);
  });

  it('should handle unknown IP gracefully', () => {
    const middleware = new SecurityMiddleware();
    const hash = middleware['hashIp']('unknown');

    expect(hash).toHaveLength(16);
    expect(hash).toMatch(/^[a-f0-9]{16}$/);
  });
});