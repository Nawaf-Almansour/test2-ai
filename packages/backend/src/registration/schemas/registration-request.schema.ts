import { Schema, Document } from 'mongoose';

export interface RegistrationRequest extends Document {
  referenceNumber: string;
  student: {
    firstName: string;
    middleName?: string;
    lastName: string;
    dateOfBirth: Date;
    gender: 'male' | 'female';
    nationality: string;
    nationalId?: string;
    currentSchool?: string;
    currentGrade?: string;
    requestedGrade: string;
  };
  guardian: {
    firstName: string;
    lastName: string;
    relationship: 'father' | 'mother' | 'legal_guardian' | 'other';
    mobile: string;
    alternativeMobile?: string;
    email?: string;
    preferredContactMethod: 'phone' | 'whatsapp' | 'email';
  };
  academic: {
    previousSchool?: string;
    currentGrade?: string;
    requestedGrade: string;
    transferReason?: string;
  };
  transportationRequired?: boolean;
  siblingAtSchool?: boolean;
  source?: string;
  notes?: string;
  registrationConsent: boolean;
  marketingConsent: boolean;
  status: string;
  metadata: {
    ipHash?: string;
    userAgent?: string;
    language?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export const RegistrationRequestSchema = new Schema<RegistrationRequest>({
  referenceNumber: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  student: {
    firstName: { type: String, required: true, trim: true, maxlength: 100 },
    middleName: { type: String, trim: true, maxlength: 100 },
    lastName: { type: String, required: true, trim: true, maxlength: 100 },
    dateOfBirth: { type: Date, required: true },
    gender: { type: String, required: true, enum: ['male', 'female'] },
    nationality: { type: String, required: true, trim: true },
    nationalId: { type: String, trim: true },
    currentSchool: { type: String, trim: true },
    currentGrade: { type: String, trim: true },
    requestedGrade: { type: String, required: true },
  },
  guardian: {
    firstName: { type: String, required: true, trim: true, maxlength: 100 },
    lastName: { type: String, required: true, trim: true, maxlength: 100 },
    relationship: { 
      type: String, 
      required: true, 
      enum: ['father', 'mother', 'legal_guardian', 'other'] 
    },
    mobile: { type: String, required: true, index: true },
    alternativeMobile: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true, index: true },
    preferredContactMethod: { 
      type: String, 
      required: true, 
      enum: ['phone', 'whatsapp', 'email'] 
    },
  },
  academic: {
    previousSchool: { type: String, trim: true },
    currentGrade: { type: String, trim: true },
    requestedGrade: { type: String, required: true },
    transferReason: { type: String, trim: true },
  },
  transportationRequired: { type: Boolean },
  siblingAtSchool: { type: Boolean },
  source: { type: String, trim: true },
  notes: { type: String, trim: true },
  registrationConsent: { type: Boolean, required: true },
  marketingConsent: { type: Boolean, required: true },
  status: { 
    type: String, 
    required: true, 
    enum: [
      'SUBMITTED', 'UNDER_REVIEW', 'CONTACTED', 'ASSESSMENT_REQUIRED',
      'ASSESSMENT_SCHEDULED', 'APPROVED', 'WAITLISTED', 'REJECTED',
      'ENROLLED', 'WITHDRAWN'
    ],
    default: 'SUBMITTED',
    index: true,
  },
  metadata: {
    ipHash: { type: String },
    userAgent: { type: String },
    language: { type: String },
  },
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Compound index for status and date queries
RegistrationRequestSchema.index({ status: 1, createdAt: -1 });
RegistrationRequestSchema.index({ createdAt: -1 });
RegistrationRequestSchema.index({ 'student.requestedGrade': 1 });