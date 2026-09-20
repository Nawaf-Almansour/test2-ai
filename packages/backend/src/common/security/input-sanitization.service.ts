import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class InputSanitizationService {
  private readonly logger = new Logger(InputSanitizationService.name);

  sanitizeInput(data: any): any {
    if (typeof data === 'string') {
      return this.sanitizeString(data);
    }
    
    if (Array.isArray(data)) {
      return data.map(item => this.sanitizeInput(item));
    }
    
    if (typeof data === 'object' && data !== null) {
      const sanitized: any = {};
      for (const key in data) {
        if (data.hasOwnProperty(key)) {
          sanitized[key] = this.sanitizeInput(data[key]);
        }
      }
      return sanitized;
    }
    
    return data;
  }

  private sanitizeString(text: string): string {
    if (!text) return text;
    
    let sanitized = text;
    
    // Remove potential XSS vectors
    sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    sanitized = sanitized.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
    sanitized = sanitized.replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '');
    sanitized = sanitized.replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '');
    
    // Remove dangerous event handlers
    sanitized = sanitized.replace(/on\w+\s*=/gi, '');
    
    // Remove javascript: protocol
    sanitized = sanitized.replace(/javascript:/gi, '');
    
    // Remove data: URLs that could be malicious
    sanitized = sanitized.replace(/data:(?!image\/)/gi, '');
    
    // Normalize whitespace
    sanitized = sanitized.replace(/\s+/g, ' ').trim();
    
    // Remove control characters except newlines and tabs
    sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
    
    return sanitized;
  }

  sanitizeForMongoQuery(data: any): any {
    // Remove MongoDB operators that could be used for NoSQL injection
    if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
      const sanitized: any = {};
      
      for (const key in data) {
        if (data.hasOwnProperty(key)) {
          // Skip MongoDB operator keys
          if (key.startsWith('$')) {
            this.logger.warn(`MongoDB operator detected and removed: ${key}`);
            continue;
          }
          
          sanitized[key] = this.sanitizeForMongoQuery(data[key]);
        }
      }
      
      return sanitized;
    }
    
    return this.sanitizeInput(data);
  }

  validateAndSanitizeEmail(email: string): string {
    if (!email) return email;
    
    const sanitized = this.sanitizeString(email.toLowerCase().trim());
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sanitized)) {
      throw new Error('Invalid email format');
    }
    
    // Remove potentially dangerous characters
    return sanitized.replace(/[<>]/g, '');
  }

  validateAndSanitizeMobile(mobile: string): string {
    if (!mobile) return mobile;
    
    const sanitized = mobile.replace(/\D/g, ''); // Remove all non-digits
    
    // Validate Saudi mobile format (should start with 9665 and be 12 digits)
    if (!sanitized.startsWith('9665') || sanitized.length !== 12) {
      throw new Error('Invalid Saudi mobile number format');
    }
    
    return `+${sanitized}`;
  }

  sanitizeNationalId(nationalId?: string): string | undefined {
    if (!nationalId) return undefined;
    
    // Remove non-alphanumeric characters
    const sanitized = nationalId.replace(/[^a-zA-Z0-9]/g, '');
    
    // Basic validation - Saudi national ID should be 10 digits
    if (sanitized.length !== 10 || !/^\d+$/.test(sanitized)) {
      this.logger.warn(`Invalid national ID format detected and rejected`);
      return undefined;
    }
    
    return sanitized;
  }

  sanitizeNotes(notes: string): string {
    if (!notes) return notes;
    
    const sanitized = this.sanitizeString(notes);
    
    // Limit length for notes
    return sanitized.substring(0, 1000);
  }

  sanitizeName(name: string): string {
    if (!name) return name;
    
    const sanitized = this.sanitizeString(name);
    
    // Allow only letters, spaces, hyphens, and apostrophes in names
    return sanitized.replace(/[^a-zA-Z\s\-']/g, '').trim();
  }
}