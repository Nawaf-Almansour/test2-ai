import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class StudentSchema {
  @Prop({ required: true })
  firstName: string;

  @Prop()
  middleName?: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true, type: Date })
  dateOfBirth: Date;

  @Prop({ required: true, enum: ['male', 'female'] })
  gender: string;

  @Prop({ required: true })
  nationality: string;

  @Prop()
  nationalId?: string;

  @Prop()
  currentSchool?: string;

  @Prop()
  currentGrade?: string;

  @Prop({ required: true })
  requestedGrade: string;
}

@Schema()
export class GuardianSchema {
  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true, enum: ['father', 'mother', 'legal_guardian', 'other'] })
  relationship: string;

  @Prop({ required: true })
  mobile: string;

  @Prop()
  alternativeMobile?: string;

  @Prop()
  email?: string;

  @Prop({ required: true, enum: ['phone', 'whatsapp', 'email'] })
  preferredContactMethod: string;
}

@Schema()
export class AcademicSchema {
  @Prop()
  previousSchool?: string;

  @Prop()
  currentGrade?: string;

  @Prop()
  requestedGrade?: string;

  @Prop()
  transferReason?: string;
}

@Schema()
export class MetadataSchema {
  @Prop()
  ipHash?: string;

  @Prop()
  userAgent?: string;

  @Prop()
  language?: string;
}

export type RegistrationRequestDocument = RegistrationRequest & Document;

@Schema({
  toJSON: {
    transform: function(doc, ret) {
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
})
export class RegistrationRequest {
  @Prop({ required: true, unique: true, index: true })
  referenceNumber: string;

  @Prop({ required: true, type: StudentSchema })
  student: StudentSchema;

  @Prop({ required: true, type: GuardianSchema })
  guardian: GuardianSchema;

  @Prop({ required: true, type: AcademicSchema })
  academic: AcademicSchema;

  @Prop()
  transportationRequired?: boolean;

  @Prop()
  siblingAtSchool?: boolean;

  @Prop()
  source?: string;

  @Prop()
  notes?: string;

  @Prop({ required: true })
  registrationConsent: boolean;

  @Prop({ required: true })
  marketingConsent: boolean;

  @Prop({ 
    required: true, 
    enum: [
      'SUBMITTED', 'UNDER_REVIEW', 'CONTACTED', 'ASSESSMENT_REQUIRED',
      'ASSESSMENT_SCHEDULED', 'APPROVED', 'WAITLISTED', 'REJECTED',
      'ENROLLED', 'WITHDRAWN'
    ],
    default: 'SUBMITTED',
    index: true
  })
  status: string;

  @Prop({ type: MetadataSchema })
  metadata: MetadataSchema;

  @Prop({ default: Date.now, index: true })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const RegistrationRequestSchema = SchemaFactory.createForClass(RegistrationRequest);

// Compound index for status and date queries
RegistrationRequestSchema.index({ status: 1, createdAt: -1 });
RegistrationRequestSchema.index({ createdAt: -1 });
RegistrationRequestSchema.index({ 'student.requestedGrade': 1 });
RegistrationRequestSchema.index({ 'guardian.mobile': 1 });
RegistrationRequestSchema.index({ 'guardian.email': 1 });