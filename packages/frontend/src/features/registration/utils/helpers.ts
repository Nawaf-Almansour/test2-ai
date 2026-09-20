import { formatMobile, validateSaudiMobile } from '../../../lib/utils';
import { CONTACT_INFO, VALIDATION_MESSAGES } from './constants';

// Format mobile number for display with country code
export const formatMobileDisplay = (mobile: string): string => {
  if (!mobile) return '';
  
  const cleaned = mobile.replace(/[^\d+]/g, '');
  
  if (cleaned.startsWith('+9665')) {
    return cleaned.replace(/(\+966)(5\d{2})(\d{3})(\d{3})/, '$1 $2 $3 $4');
  }
  
  if (cleaned.startsWith('05')) {
    return cleaned.replace(/(05)(\d{2})(\d{3})(\d{3})/, '0$5 $2 $3 $4');
  }
  
  return formatMobile(cleaned);
};

// Validate and format mobile number
export const validateAndFormatMobile = (mobile: string): { isValid: boolean; formatted: string; error?: string } => {
  if (!mobile) {
    return { isValid: false, formatted: '', error: VALIDATION_MESSAGES.REQUIRED };
  }
  
  const cleaned = mobile.replace(/[^\d+]/g, '');
  
  if (!validateSaudiMobile(cleaned)) {
    return { isValid: false, formatted: cleaned, error: VALIDATION_MESSAGES.INVALID_MOBILE };
  }
  
  // Format to +966 format
  let formatted = cleaned;
  if (cleaned.startsWith('05')) {
    formatted = '+966' + cleaned.substring(1);
  } else if (cleaned.startsWith('5')) {
    formatted = '+966' + cleaned;
  }
  
  return { isValid: true, formatted };
};

// Get age from date of birth
export const getAgeFromDateOfBirth = (dateOfBirth: string): number => {
  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

// Validate age for school registration
export const validateSchoolAge = (dateOfBirth: string, requestedGrade: string): { isValid: boolean; error?: string } => {
  const age = getAgeFromDateOfBirth(dateOfBirth);
  
  // Define age ranges for different grades
  const gradeAgeRanges: Record<string, { min: number; max: number }> = {
    'Kindergarten': { min: 4, max: 6 },
    'Grade 1': { min: 5, max: 7 },
    'Grade 2': { min: 6, max: 8 },
    'Grade 3': { min: 7, max: 9 },
    'Grade 4': { min: 8, max: 10 },
    'Grade 5': { min: 9, max: 11 },
    'Grade 6': { min: 10, max: 12 },
    'Grade 7': { min: 11, max: 13 },
    'Grade 8': { min: 12, max: 14 },
    'Grade 9': { min: 13, max: 15 },
    'Grade 10': { min: 14, max: 16 },
    'Grade 11': { min: 15, max: 17 },
    'Grade 12': { min: 16, max: 18 },
  };
  
  const ageRange = gradeAgeRanges[requestedGrade];
  
  if (!ageRange) {
    return { isValid: false, error: 'Invalid grade selected' };
  }
  
  if (age < ageRange.min || age > ageRange.max) {
    return { 
      isValid: false, 
      error: `Age ${age} is not appropriate for ${requestedGrade}. Expected age: ${ageRange.min}-${ageRange.max} years.` 
    };
  }
  
  return { isValid: true };
};

// Get contact information for display
export const getContactInfo = () => {
  return {
    phone: CONTACT_INFO.PHONE,
    email: CONTACT_INFO.EMAIL,
    phoneDisplay: CONTACT_INFO.PHONE.replace(/(\+966)(\d{2})(\d{3})(\d{3})/, '$1 $2 $3 $4'),
  };
};

// Format file size for uploads
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Generate step validation summary
export const getStepValidationSummary = (errors: Record<string, string>, currentStep: number): string[] => {
  const stepErrorMap: Record<number, string[]> = {
    1: ['student.firstName', 'student.lastName', 'student.dateOfBirth', 'student.gender', 'student.nationality', 'student.requestedGrade'],
    2: ['guardian.firstName', 'guardian.lastName', 'guardian.relationship', 'guardian.mobile', 'guardian.preferredContactMethod'],
    3: ['academic.requestedGrade'],
    4: ['registrationConsent'],
  };
  
  const stepFields = stepErrorMap[currentStep] || [];
  
  return stepFields
    .filter(field => errors[field])
    .map(field => errors[field]!);
};

// Debounce function for form inputs
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Check if browser supports certain features
export const checkBrowserSupport = {
  // Check if browser supports file upload
  fileUpload: () => typeof File !== 'undefined' && typeof FileReader !== 'undefined',
  
  // Check if browser supports local storage
  localStorage: () => {
    try {
      const test = '__test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  },
  
  // Check if browser supports clipboard API
  clipboard: () => 'clipboard' in navigator,
  
  // Check if browser supports print functionality
  print: () => typeof window !== 'undefined' && typeof window.print === 'function',
};

// Get browser information
export const getBrowserInfo = () => {
  if (typeof window === 'undefined') {
    return { name: 'Unknown', version: 'Unknown', mobile: false };
  }
  
  const userAgent = navigator.userAgent;
  
  // Simple browser detection
  let name = 'Unknown';
  let version = 'Unknown';
  
  if (userAgent.includes('Chrome')) {
    name = 'Chrome';
    const match = userAgent.match(/Chrome\/(\d+)/);
    version = match ? match[1] : 'Unknown';
  } else if (userAgent.includes('Firefox')) {
    name = 'Firefox';
    const match = userAgent.match(/Firefox\/(\d+)/);
    version = match ? match[1] : 'Unknown';
  } else if (userAgent.includes('Safari')) {
    name = 'Safari';
    const match = userAgent.match(/Version\/(\d+)/);
    version = match ? match[1] : 'Unknown';
  }
  
  const mobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  
  return { name, version, mobile };
};

// Generate unique ID for form elements
export const generateId = (prefix: string = 'id'): string => {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};