import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';

@Injectable()
export class ParsePhonePipe implements PipeTransform<string> {
  transform(value: string, metadata: ArgumentMetadata): string {
    if (!value) {
      throw new BadRequestException('Phone number is required');
    }

    // Remove all non-digit characters
    let cleaned = value.replace(/\D/g, '');

    // Handle Saudi Arabia phone numbers
    if (cleaned.startsWith('966')) {
      // International format: +9665XXXXXXXX
      cleaned = cleaned.replace(/^966/, '');
    } else if (cleaned.startsWith('0')) {
      // Local format: 05XXXXXXXX
      cleaned = cleaned.replace(/^0/, '');
    }

    // Validate length (Saudi mobile numbers are 9 digits after country code)
    if (cleaned.length !== 9) {
      throw new BadRequestException('Invalid Saudi mobile number format');
    }

    // Validate starts with 5 (Saudi mobile numbers start with 5)
    if (!cleaned.startsWith('5')) {
      throw new BadRequestException('Invalid Saudi mobile number (must start with 5)');
    }

    return `+966${cleaned}`;
  }
}