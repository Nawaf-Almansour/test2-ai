import { IsString, IsEmail, IsBoolean, IsEnum, IsOptional, IsDate, IsNotEmpty, MaxLength, MinLength, Matches } from 'class-validator';
import { Type } from 'class-transformer';
import { Gender, Grade, Relationship, ContactMethod } from '../enums';

export class StudentDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2, { message: 'First name must be at least 2 characters long' })
  @MaxLength(100, { message: 'First name cannot exceed 100 characters' })
  firstName: string;

  @IsString()
  @IsOptional()
  @MaxLength(100, { message: 'Middle name cannot exceed 100 characters' })
  middleName?: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2, { message: 'Last name must be at least 2 characters long' })
  @MaxLength(100, { message: 'Last name cannot exceed 100 characters' })
  lastName: string;

  @IsDate()
  @Type(() => Date)
  dateOfBirth: Date;

  @IsEnum(Gender, { message: 'Gender must be male or female' })
  gender: Gender;

  @IsString()
  @IsNotEmpty()
  nationality: string;

  @IsString()
  @IsOptional()
  nationalId?: string;

  @IsString()
  @IsOptional()
  currentSchool?: string;

  @IsString()
  @IsOptional()
  currentGrade?: string;

  @IsEnum(Grade, { message: 'Requested grade is not valid' })
  requestedGrade: Grade;
}

export class GuardianDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2, { message: 'First name must be at least 2 characters long' })
  @MaxLength(100, { message: 'First name cannot exceed 100 characters' })
  firstName: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2, { message: 'Last name must be at least 2 characters long' })
  @MaxLength(100, { message: 'Last name cannot exceed 100 characters' })
  lastName: string;

  @IsEnum(Relationship, { message: 'Relationship is not valid' })
  relationship: Relationship;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\+9665[0-9]{8}$/, { message: 'Mobile number must be a valid Saudi number in format +9665XXXXXXXX' })
  mobile: string;

  @IsString()
  @IsOptional()
  @Matches(/^\+9665[0-9]{8}$/, { message: 'Alternative mobile number must be a valid Saudi number in format +9665XXXXXXXX' })
  alternativeMobile?: string;

  @IsEmail({}, { message: 'Email must be a valid email address' })
  @MaxLength(255, { message: 'Email cannot exceed 255 characters' })
  email: string;

  @IsEnum(ContactMethod, { message: 'Preferred contact method is not valid' })
  preferredContactMethod: ContactMethod;
}

export class AcademicDto {
  @IsString()
  @IsOptional()
  previousSchool?: string;

  @IsString()
  @IsOptional()
  currentGrade?: string;

  @IsString()
  @IsOptional()
  transferReason?: string;
}

export class CreateRegistrationRequestDto {
  @IsNotEmpty()
  student: StudentDto;

  @IsNotEmpty()
  guardian: GuardianDto;

  @IsOptional()
  academic?: AcademicDto;

  @IsOptional()
  @IsBoolean()
  transportationRequired?: boolean;

  @IsOptional()
  @IsBoolean()
  siblingAtSchool?: boolean;

  @IsString()
  @IsOptional()
  source?: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000, { message: 'Notes cannot exceed 1000 characters' })
  notes?: string;

  @IsBoolean()
  @IsNotEmpty({ message: 'Registration consent is required' })
  registrationConsent: boolean;

  @IsBoolean()
  marketingConsent: boolean;
}