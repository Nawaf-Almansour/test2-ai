import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

export interface RequestMetadata {
  ipHash: string;
  userAgent?: string;
  language?: string;
  timestamp: string;
}

export interface SpamDetectionResult {
  isSpam: boolean;
  riskScore: number;
  reasons: string[];
}

@Injectable()
export class SpamDetectionService {
  private readonly logger = new Logger(SpamDetectionService.name);
  private readonly suspiciousPatterns = [
    /test/i,
    /spam/i,
    /admin/i,
    /root/i,
    /dummy/i,
    /sample/i,
    /example/i,
    /fake/i,
    /bot/i,
    /crawler/i,
  ];

  private readonly blockedCountries = process.env.BLOCKED_COUNTRIES?.split(',') || [];
  private readonly maxRequestsPerHour = parseInt(process.env.MAX_REQUESTS_PER_HOUR || '50', 10);

  constructor(private configService: ConfigService) {}

  async detectSpam(
    data: any,
    metadata: RequestMetadata,
  ): Promise<SpamDetectionResult> {
    const reasons: string[] = [];
    let riskScore = 0;

    // Check for suspicious patterns in text fields
    const textFields = this.extractTextFields(data);
    for (const field of textFields) {
      if (this.hasSuspiciousPatterns(field)) {
        reasons.push('Suspicious content patterns detected');
        riskScore += 30;
        break;
      }
    }

    // Check for disposable email domains
    const email = this.extractEmail(data);
    if (email && this.isDisposableEmail(email)) {
      reasons.push('Disposable email domain detected');
      riskScore += 40;
    }

    // Check for suspicious user agents
    if (metadata.userAgent && this.isSuspiciousUserAgent(metadata.userAgent)) {
      reasons.push('Suspicious user agent');
      riskScore += 25;
    }

    // Check for rapid successive requests (would need Redis/memory store for full implementation)
    // For now, just log the request for analysis
    this.logRequestForAnalysis(metadata, data);

    // Check for suspicious patterns in names
    const names = this.extractNames(data);
    if (this.hasSuspiciousNamePatterns(names)) {
      reasons.push('Suspicious name patterns');
      riskScore += 20;
    }

    // Check for phone number patterns
    const mobile = this.extractMobile(data);
    if (mobile && this.isSuspiciousMobile(mobile)) {
      reasons.push('Suspicious mobile number pattern');
      riskScore += 35;
    }

    const isSpam = riskScore >= 50; // Threshold for spam detection

    if (isSpam) {
      this.logger.warn(`Spam detected: score=${riskScore} reasons=${reasons.join(',')} ipHash=${metadata.ipHash}`);
    }

    return {
      isSpam,
      riskScore,
      reasons,
    };
  }

  private extractTextFields(obj: any): string[] {
    const textFields: string[] = [];
    
    const extract = (o: any, path: string = '') => {
      if (typeof o === 'string') {
        textFields.push(o);
      } else if (typeof o === 'object' && o !== null) {
        for (const key in o) {
          if (o.hasOwnProperty(key)) {
            extract(o[key], path ? `${path}.${key}` : key);
          }
        }
      }
    };
    
    extract(obj);
    return textFields;
  }

  private extractEmail(obj: any): string | null {
    if (typeof obj === 'string') {
      return obj.includes('@') ? obj : null;
    }
    
    if (typeof obj === 'object' && obj !== null) {
      for (const key in obj) {
        if (key.toLowerCase().includes('email') && typeof obj[key] === 'string') {
          return obj[key];
        }
        const email = this.extractEmail(obj[key]);
        if (email) return email;
      }
    }
    
    return null;
  }

  private extractMobile(obj: any): string | null {
    if (typeof obj === 'string' && obj.startsWith('+9665')) {
      return obj;
    }
    
    if (typeof obj === 'object' && obj !== null) {
      for (const key in obj) {
        if (key.toLowerCase().includes('mobile') && typeof obj[key] === 'string') {
          return obj[key];
        }
        const mobile = this.extractMobile(obj[key]);
        if (mobile) return mobile;
      }
    }
    
    return null;
  }

  private extractNames(obj: any): string[] {
    const names: string[] = [];
    
    const extract = (o: any) => {
      if (typeof o === 'object' && o !== null) {
        for (const key in o) {
          if (key.toLowerCase().includes('name') && typeof o[key] === 'string') {
            names.push(o[key]);
          } else {
            extract(o[key]);
          }
        }
      }
    };
    
    extract(obj);
    return names;
  }

  private hasSuspiciousPatterns(text: string): boolean {
    return this.suspiciousPatterns.some(pattern => pattern.test(text));
  }

  private isDisposableEmail(email: string): boolean {
    const domain = email.split('@')[1].toLowerCase();
    const disposableDomains = [
      '10minutemail.com',
      'tempmail.org',
      'guerrillamail.com',
      'mailinator.com',
      'throwaway.email',
      'temp-mail.org',
    ];
    
    return disposableDomains.some(disposable => domain.includes(disposable));
  }

  private isSuspiciousUserAgent(userAgent: string): boolean {
    const suspiciousAgents = [
      /bot/i,
      /crawler/i,
      /spider/i,
      /scraper/i,
      /curl/i,
      /wget/i,
      /python/i,
      /java/i,
      /go-http/i,
    ];
    
    return suspiciousAgents.some(pattern => pattern.test(userAgent));
  }

  private hasSuspiciousNamePatterns(names: string[]): boolean {
    // Check for repeating characters, all same character, or suspicious patterns
    for (const name of names) {
      if (name.length < 2) continue;
      
      // All same character
      if (name.split('').every(char => char === name[0])) {
        return true;
      }
      
      // Repeating patterns like "ababab"
      if (/([a-z]{2,})\1+/i.test(name)) {
        return true;
      }
      
      // Contains numbers in names
      if (/\d/.test(name)) {
        return true;
      }
    }
    
    return false;
  }

  private isSuspiciousMobile(mobile: string): boolean {
    // Check for sequential numbers or repeated patterns
    const digits = mobile.replace(/\D/g, '');
    
    // Sequential numbers
    for (let i = 0; i < digits.length - 3; i++) {
      const segment = digits.substring(i, i + 4);
      const isSequential = segment.split('').every((digit, index, arr) => {
        if (index === 0) return true;
        return parseInt(digit) === parseInt(arr[index - 1]) + 1;
      });
      
      if (isSequential) return true;
    }
    
    // All same digit
    if (digits.split('').every(digit => digit === digits[0])) {
      return true;
    }
    
    return false;
  }

  private logRequestForAnalysis(metadata: RequestMetadata, data: any): void {
    // Log sanitized data for pattern analysis (no sensitive info)
    const sanitizedData = {
      ipHash: metadata.ipHash,
      userAgent: metadata.userAgent?.substring(0, 100),
      language: metadata.language,
      timestamp: metadata.timestamp,
      hasEmail: !!this.extractEmail(data),
      hasMobile: !!this.extractMobile(data),
      nameCount: this.extractNames(data).length,
      textFieldCount: this.extractTextFields(data).length,
    };
    
    this.logger.debug(`Request for analysis: ${JSON.stringify(sanitizedData)}`);
  }
}