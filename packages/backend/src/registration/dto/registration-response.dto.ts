import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegistrationResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'REG-2026-000123' })
  requestId: string;

  @ApiProperty({ example: 'submitted' })
  status: string;

  @ApiProperty({ example: 'Registration request submitted successfully.' })
  message: string;

  @ApiPropertyOptional({
    example:
      'A registration with similar details already exists. This may be a sibling or a resubmission.',
  })
  warning?: string;
}

export class DuplicateRegistrationResponseDto extends RegistrationResponseDto {
  @ApiProperty({
    example:
      'A registration with similar details already exists. This may be a sibling or a resubmission. Our team will review it.',
  })
  warning: string;
}

export class ErrorResponseDto {
  @ApiProperty({ example: false })
  success: false;

  @ApiProperty({
    example: {
      code: 'VALIDATION_ERROR',
      message: 'Some fields are invalid.',
      fields: { 'guardian.mobile': 'Invalid mobile number format' },
    },
  })
  error: {
    code: string;
    message: string;
    fields?: Record<string, string>;
  };
}
