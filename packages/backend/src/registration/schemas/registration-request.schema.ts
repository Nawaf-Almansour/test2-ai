import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ _id: false })
export class StudentSubSchema {
  @Prop({ required: true, trim: true })
  firstName: string;

  @Prop({ trim: true })
  middleName?: string;

  @Prop({ required: true, trim: true })
  lastName: string;

  @Prop({ required: true, type: Date })
  dateOfBirth: Date;

  @Prop({ required: true, enum: ['male', 'female'] })
  gender: string;

  @Prop({ required: true, uppercase: true })
  nationality: string;

  @Prop({ sparse: true })
  nationalId?: string;

  @Prop()
  currentSchool?: string;

  @Prop()
  currentGrade?: string;

  @Prop({ required: true })
  requestedGrade: string;
}

@Schema({ _id: false })
export class GuardianSubSchema {
  @Prop({ required: true, trim: true })
  firstName: string;

  @Prop({ required: true, trim: true })
  lastName: string;

  @Prop({ required: true, enum: ['father', 'mother', 'legal_guardian', 'other'] })
  relationship: string;

  @Prop({ required: true })
  mobile: string;

  @Prop()
  alternativeMobile?: string;

  @Prop({ lowercase: true })
  email?: string;

  @Prop({ required: true, enum: ['phone', 'whatsapp', 'email'] })
  preferredContactMethod: string;
}

@Schema({ _id: false })
export class AcademicSubSchema {
  @Prop()
  previousSchool?: string;

  @Prop()
  currentGrade?: string;

  @Prop()
  transferReason?: string;
}

@Schema({ _id: false })
export class MetadataSubSchema {
  @Prop()
  ipHash?: string;

  @Prop()
  userAgent?: string;

  @Prop()
  language?: string;
}

export type RegistrationRequestDocument = RegistrationRequest & Document;

@Schema({
  collection: 'registration_requests',
  timestamps: true,
  toJSON: {
    transform: function (doc, ret) {
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  },
})
export class RegistrationRequest {
  @Prop({ required: true, unique: true, index: true })
  referenceNumber: string;

  @Prop({ required: true, type: StudentSubSchema })
  student: StudentSubSchema;

  @Prop({ required: true, type: GuardianSubSchema })
  guardian: GuardianSubSchema;

  @Prop({ type: AcademicSubSchema, default: {} })
  academic: AcademicSubSchema;

  @Prop({ default: false })
  transportationRequired?: boolean;

  @Prop({ default: false })
  siblingAtSchool?: boolean;

  @Prop()
  source?: string;

  @Prop()
  notes?: string;

  @Prop({ required: true })
  registrationConsent: boolean;

  @Prop({ default: false })
  marketingConsent: boolean;

  @Prop({
    required: true,
    enum: [
      'SUBMITTED',
      'UNDER_REVIEW',
      'CONTACTED',
      'ASSESSMENT_REQUIRED',
      'ASSESSMENT_SCHEDULED',
      'APPROVED',
      'WAITLISTED',
      'REJECTED',
      'ENROLLED',
      'WITHDRAWN',
    ],
    default: 'SUBMITTED',
    index: true,
  })
  status: string;

  @Prop({ type: MetadataSubSchema })
  metadata: MetadataSubSchema;
}

export const RegistrationRequestSchema = SchemaFactory.createForClass(RegistrationRequest);

// ── Database indexes (spec section 9) ──────────────────────────────
// Primary lookup
RegistrationRequestSchema.index({ referenceNumber: 1 }, { unique: true });

// Status + date for dashboard queries
RegistrationRequestSchema.index({ status: 1, createdAt: -1 });

// Recent registrations
RegistrationRequestSchema.index({ createdAt: -1 });

// Grade distribution queries
RegistrationRequestSchema.index({ 'student.requestedGrade': 1 });

// Duplicate detection compound index
RegistrationRequestSchema.index(
  {
    'guardian.mobile': 1,
    'student.firstName': 1,
    'student.lastName': 1,
    'student.dateOfBirth': 1,
    'student.requestedGrade': 1,
  },
  { name: 'duplicate_detection' },
);

// Guardian lookup
RegistrationRequestSchema.index({ 'guardian.mobile': 1 });
RegistrationRequestSchema.index({ 'guardian.email': 1 });
