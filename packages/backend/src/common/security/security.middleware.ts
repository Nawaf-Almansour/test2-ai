import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import * as crypto from 'crypto';

@Injectable()
export class SecurityMiddleware implements NestMiddleware {
  private readonly logger = new Logger(SecurityMiddleware.name);

  use(req: Request, res: Response, next: NextFunction) {
    // Add security headers
    this.addSecurityHeaders(res);
    
    // Log request metadata (privacy-safe)
    this.logRequestMetadata(req);
    
    next();
  }

  private addSecurityHeaders(res: Response) {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  }

  private logRequestMetadata(req: Request) {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const userAgent = req.get('user-agent')?.substring(0, 500) || 'unknown';
    const language = req.get('accept-language')?.split(',')[0] || 'unknown';
    
    // Only log hashed IP and metadata for privacy
    const metadata = {
      ipHash: this.hashIp(ip),
      userAgent,
      language,
      method: req.method,
      path: req.path,
      timestamp: new Date().toISOString(),
    };

    this.logger.debug(`Request: ${JSON.stringify(metadata)}`);
  }

  private hashIp(ip: string): string {
    return crypto
      .createHash('sha256')
      .update(ip)
      .digest('hex')
      .substring(0, 16);
  }
}

// Rate limiting configurations
export const ipRateLimit = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5, // 5 requests per IP
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests from this IP. Please try again later.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    const logger = new Logger('RateLimit');
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const ipHash = crypto
      .createHash('sha256')
      .update(ip)
      .digest('hex')
      .substring(0, 16);
    
    logger.warn(`Rate limit exceeded: ipHash=${ipHash} path=${req.path}`);
    
    res.status(429).json({
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests from this IP. Please try again later.',
      },
    });
  },
});

// Mobile-specific rate limiting (stricter)
export const mobileRateLimit = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 10, // 10 requests per mobile identifier
  keyGenerator: (req) => {
    // Try to extract mobile from request body or use IP fallback
    const body = req.body as any;
    const mobile = body?.guardian?.mobile || body?.mobile;
    return mobile ? `mobile:${mobile}` : `ip:${req.ip}`;
  },
  message: {
    success: false,
    error: {
      code: 'MOBILE_RATE_LIMIT_EXCEEDED',
      message: 'Too many requests from this mobile number. Daily limit reached.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    const logger = new Logger('MobileRateLimit');
    const body = req.body as any;
    const mobile = body?.guardian?.mobile || body?.mobile || 'unknown';
    const mobileHash = crypto
      .createHash('sha256')
      .update(mobile)
      .digest('hex')
      .substring(0, 16);
    
    logger.warn(`Mobile rate limit exceeded: mobileHash=${mobileHash} path=${req.path}`);
    
    res.status(429).json({
      success: false,
      error: {
        code: 'MOBILE_RATE_LIMIT_EXCEEDED',
        message: 'Too many requests from this mobile number. Daily limit reached.',
      },
    });
  },
});

// Payload size limit middleware
export const payloadSizeLimit = (maxSize: string = '10mb') => {
  return (req: Request, res: Response, next: NextFunction) => {
    const contentLength = req.get('content-length');
    
    if (contentLength) {
      const sizeInBytes = parseInt(contentLength, 10);
      const maxSizeInBytes = parseSize(maxSize);
      
      if (sizeInBytes > maxSizeInBytes) {
        const logger = new Logger('PayloadSize');
        const ip = req.ip || req.connection.remoteAddress || 'unknown';
        const ipHash = crypto
          .createHash('sha256')
          .update(ip)
          .digest('hex')
          .substring(0, 16);
        
        logger.warn(`Payload size exceeded: ipHash=${ipHash} size=${sizeInBytes} max=${maxSizeInBytes}`);
        
        return res.status(413).json({
          success: false,
          error: {
            code: 'PAYLOAD_TOO_LARGE',
            message: `Request payload too large. Maximum size is ${maxSize}.`,
          },
        });
      }
    }
    
    next();
  };
};

function parseSize(size: string): number {
  const units: { [key: string]: number } = {
    b: 1,
    kb: 1024,
    mb: 1024 * 1024,
    gb: 1024 * 1024 * 1024,
  };
  
  const match = size.toLowerCase().match(/^(\d+)(b|kb|mb|gb)$/);
  if (!match) return 1024 * 1024; // Default to 1MB
  
  const [, value, unit] = match;
  return parseInt(value, 10) * (units[unit] || 1);
}