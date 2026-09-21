import {
  IsString,
  IsEmail,
  IsBoolean,
  IsEnum,
  IsOptional,
  IsDate,
  IsNotEmpty,
  MaxLength,
  MinLength,
  Matches,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Gender, Grade, Relationship, ContactMethod } from '../enums';

export class StudentDto {
  @ApiProperty({ description: 'Student first name', example: 'Ahmed' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2, { message: 'First name must be at least 2 characters long' })
  @MaxLength(100, { message: 'First name cannot exceed 100 characters' })
  firstName: string;

  @ApiPropertyOptional({ description: 'Student middle name', example: 'Mohammed' })
  @IsString()
  @IsOptional()
  @MaxLength(100, { message: 'Middle name cannot exceed 100 characters' })
  middleName?: string;

  @ApiProperty({ description: 'Student last name', example: 'Ali' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2, { message: 'Last name must be at least 2 characters long' })
  @MaxLength(100, { message: 'Last name cannot exceed 100 characters' })
  lastName: string;

  @ApiProperty({ description: 'Date of birth', example: '2018-04-15' })
  @IsDate()
  @Type(() => Date)
  dateOfBirth: Date;

  @ApiProperty({ description: 'Gender', enum: Gender, example: Gender.MALE })
  @IsEnum(Gender, { message: 'Gender must be male or female' })
  gender: Gender;

  @ApiProperty({ description: 'Nationality code (ISO 3166-1 alpha-2)', example: 'SA' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(2)
  nationality: string;

  @ApiPropertyOptional({ description: 'National ID number' })
  @IsString()
  @IsOptional()
  nationalId?: string;

  @ApiPropertyOptional({ description: 'Current school name' })
  @IsString()
  @IsOptional()
  currentSchool?: string;

  @ApiPropertyOptional({ description: 'Current grade', enum: Grade })
  @IsEnum(Grade)
  @IsOptional()
  currentGrade?: Grade;

  @ApiProperty({ description: 'Requested grade for admission', enum: Grade, example: Grade.GRADE_1 })
  @IsEnum(Grade, { message: 'Requested grade is not valid' })
  requestedGrade: Grade;
}

export class GuardianDto {
  @ApiProperty({ description: 'Guardian first name', example: 'Mohammed' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2, { message: 'First name must be at least 2 characters long' })
  @MaxLength(100, { message: 'First name cannot exceed 100 characters' })
  firstName: string;

  @ApiProperty({ description: 'Guardian last name', example: 'Ali' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2, { message: 'Last name must be at least 2 characters long' })
  @MaxLength(100, { message: 'Last name cannot exceed 100 characters' })
  lastName: string;

  @ApiProperty({ description: 'Relationship to student', enum: Relationship, example: Relationship.FATHER })
  @IsEnum(Relationship, { message: 'Relationship is not valid' })
  relationship: Relationship;

  @ApiProperty({ description: 'Mobile number in format +9665XXXXXXXX', example: '+966501234567' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+9665[0-9]{8}$/, {
    message: 'Mobile number must be a valid Saudi number in format +9665XXXXXXXX',
  })
  mobile: string;

  @ApiPropertyOptional({ description: 'Alternative mobile number', example: '+966509876543' })
  @IsString()
  @IsOptional()
  @Matches(/^\+9665[0-9]{8}$/, {
    message: 'Alternative mobile number must be a valid Saudi number in format +9665XXXXXXXX',
  })
  alternativeMobile?: string;

  @ApiPropertyOptional({ description: 'Email address', example: 'parent@example.com' })
  @IsEmail({}, { message: 'Email must be a valid email address' })
  @IsOptional()
  @MaxLength(255, { message: 'Email cannot exceed 255 characters' })
  email?: string;

  @ApiProperty({ description: 'Preferred contact method', enum: ContactMethod, example: ContactMethod.WHATSAPP })
  @IsEnum(ContactMethod, { message: 'Preferred contact method is not valid' })
  preferredContactMethod: ContactMethod;
}

export class AcademicDto {
  @ApiPropertyOptional({ description: 'Previous school name' })
  @IsString()
  @IsOptional()
  previousSchool?: string;

  @ApiPropertyOptional({ description: 'Current grade at previous school', enum: Grade })
  @IsEnum(Grade)
  @IsOptional()
  currentGrade?: Grade;

  @ApiPropertyOptional({ description: 'Reason for transfer' })
  @IsString()
  @IsOptional()
  @MaxLength(500, { message: 'Transfer reason cannot exceed 500 characters' })
  transferReason?: string;
}

export class CreateRegistrationRequestDto {
  @ApiProperty({ description: 'Student information', type: StudentDto })
  @ValidateNested()
  @Type(() => StudentDto)
  @IsNotEmpty()
  student: StudentDto;

  @ApiProperty({ description: 'Guardian information', type: GuardianDto })
  @ValidateNested()
  @Type(() => GuardianDto)
  @IsNotEmpty()
  guardian: GuardianDto;

  @ApiPropertyOptional({ description: 'Academic information', type: AcademicDto })
  @ValidateNested()
  @Type(() => AcademicDto)
  @IsOptional()
  academic?: AcademicDto;

  @ApiPropertyOptional({ description: 'Whether transportation is required' })
  @IsOptional()
  @IsBoolean()
  transportationRequired?: boolean;

  @ApiPropertyOptional({ description: 'Whether a sibling is already at the school' })
  @IsOptional()
  @IsBoolean()
  siblingAtSchool?: boolean;

  @ApiPropertyOptional({ description: 'How the applicant heard about the school' })
  @IsString()
  @IsOptional()
  source?: string;

  @ApiPropertyOptional({ description: 'Additional notes' })
  @IsString()
  @IsOptional()
  @MaxLength(1000, { message: 'Notes cannot exceed 1000 characters' })
  notes?: string;

  @ApiProperty({ description: 'Registration consent must be true', example: true })
  @IsBoolean()
  @IsNotEmpty({ message: 'Registration consent is required' })
  registrationConsent: boolean;

  @ApiPropertyOptional({ description: 'Marketing consent (separate from registration consent)', example: false })
  @IsBoolean()
  @IsOptional()
  marketingConsent?: boolean;
}
