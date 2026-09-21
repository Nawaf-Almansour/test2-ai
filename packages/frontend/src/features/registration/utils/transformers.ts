import { RegistrationFormData } from '../schemas/registration.schema';
import { RegistrationRequest } from '../types/registration.types';

export const transformFormDataToApiRequest = (formData: RegistrationFormData): RegistrationRequest => {
  // Clean mobile numbers - remove any non-digit characters except +
  const cleanMobile = (mobile: string): string => {
    return mobile.replace(/[^\d+]/g, '');
  };

  // Ensure mobile number is in the correct format
  const formatMobile = (mobile: string): string => {
    const cleaned = cleanMobile(mobile);
    
    // If it starts with +966, keep it as is
    if (cleaned.startsWith('+966')) {
      return cleaned;
    }
    
    // If it starts with 05, convert to +9665
    if (cleaned.startsWith('05')) {
      return '+966' + cleaned.substring(1);
    }
    
    // If it starts with 5, add +966
    if (cleaned.startsWith('5')) {
      return '+966' + cleaned;
    }
    
    // Return as-is (validation should catch invalid formats)
    return cleaned;
  };

  return {
    student: {
      firstName: formData.student.firstName.trim(),
      middleName: formData.student.middleName?.trim() || undefined,
      lastName: formData.student.lastName.trim(),
      dateOfBirth: formData.student.dateOfBirth,
      gender: formData.student.gender,
      nationality: formData.student.nationality,
      nationalId: formData.student.nationalId?.trim() || undefined,
      requestedGrade: formData.student.requestedGrade,
    },
    guardian: {
      firstName: formData.guardian.firstName.trim(),
      lastName: formData.guardian.lastName.trim(),
      relationship: formData.guardian.relationship,
      mobile: formatMobile(formData.guardian.mobile),
      alternativeMobile: formData.guardian.alternativeMobile 
        ? formatMobile(formData.guardian.alternativeMobile) 
        : undefined,
      email: formData.guardian.email?.trim() || undefined,
      preferredContactMethod: formData.guardian.preferredContactMethod,
    },
    academic: {
      previousSchool: formData.academic?.previousSchool?.trim() || undefined,
      currentGrade: formData.academic?.currentGrade || undefined,
      requestedGrade: formData.academic?.requestedGrade || formData.student.requestedGrade,
      transferReason: formData.academic?.transferReason?.trim() || undefined,
    },
    transportationRequired: formData.transportationRequired,
    siblingAtSchool: formData.siblingAtSchool,
    source: formData.source,
    notes: formData.notes?.trim() || undefined,
    registrationConsent: formData.registrationConsent,
    marketingConsent: formData.marketingConsent,
  };
};

export const transformApiErrorToFormErrors = (error: any): Record<string, string> => {
  const fieldErrors: Record<string, string> = {};

  if (error?.error?.fields) {
    // Transform API field names to form field names
    const fieldMapping: Record<string, string> = {
      'student.firstName': 'student.firstName',
      'student.middleName': 'student.middleName',
      'student.lastName': 'student.lastName',
      'student.dateOfBirth': 'student.dateOfBirth',
      'student.gender': 'student.gender',
      'student.nationality': 'student.nationality',
      'student.nationalId': 'student.nationalId',
      'student.requestedGrade': 'student.requestedGrade',
      'guardian.firstName': 'guardian.firstName',
      'guardian.lastName': 'guardian.lastName',
      'guardian.relationship': 'guardian.relationship',
      'guardian.mobile': 'guardian.mobile',
      'guardian.alternativeMobile': 'guardian.alternativeMobile',
      'guardian.email': 'guardian.email',
      'guardian.preferredContactMethod': 'guardian.preferredContactMethod',
      'academic.currentSchool': 'academic.currentSchool',
      'academic.currentGrade': 'academic.currentGrade',
      'academic.requestedGrade': 'academic.requestedGrade',
      'academic.transferReason': 'academic.transferReason',
      'transportationRequired': 'transportationRequired',
      'siblingAtSchool': 'siblingAtSchool',
      'source': 'source',
      'notes': 'notes',
      'registrationConsent': 'registrationConsent',
      'marketingConsent': 'marketingConsent',
    };

    Object.entries(error.error.fields).forEach(([field, message]) => {
      const formField = fieldMapping[field] || field;
      fieldErrors[formField] = message as string;
    });
  }

  return fieldErrors;
};

export const generateRequestId = (): string => {
  const year = new Date().getFullYear();
  const sequence = Math.floor(Math.random() * 900000) + 100000; // 6-digit random number
  return `REG-${year}-${sequence}`;
};

export const formatReferenceNumber = (requestId: string): string => {
  // Ensure the reference number follows the REG-YYYY-NNNNNN format
  const match = requestId.match(/REG-(\d{4})-(\d{6})/);
  if (match) {
    return requestId;
  }
  
  // If it doesn't match, try to format it
  const year = new Date().getFullYear();
  const sequence = requestId.padStart(6, '0').slice(-6);
  return `REG-${year}-${sequence}`;
};