import { RegistrationRequest } from '@/types/registration'

export const mockRegistrationResponse: RegistrationRequest = {
  id: 'test-123',
  referenceNumber: 'REF-2024-001',
  status: 'pending',
  student: {
    firstName: 'John',
    lastName: 'Doe',
    dateOfBirth: '2010-05-15',
    grade: '5',
    previousSchool: 'Elementary School'
  },
  parent: {
    firstName: 'Jane',
    lastName: 'Doe',
    email: 'jane.doe@example.com',
    phone: '+1234567890',
    address: {
      street: '123 Main St',
      city: 'Anytown',
      state: 'CA',
      zipCode: '12345'
    }
  },
  emergencyContact: {
    name: 'Emergency Contact',
    relationship: 'Grandparent',
    phone: '+0987654321'
  },
  preferences: {
    program: 'regular',
    transportNeeded: false,
    specialNeeds: ''
  },
  submittedAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
}

export const mockValidationError = {
  statusCode: 400,
  message: 'Validation failed',
  error: 'Bad Request',
  details: [
    {
      field: 'student.firstName',
      message: 'First name is required',
      value: ''
    },
    {
      field: 'parent.email',
      message: 'Invalid email format',
      value: 'invalid-email'
    }
  ]
}

export const mockFormData = {
  student: {
    firstName: 'John',
    lastName: 'Doe',
    dateOfBirth: '2010-05-15',
    grade: '5',
    previousSchool: 'Elementary School'
  },
  parent: {
    firstName: 'Jane',
    lastName: 'Doe',
    email: 'jane.doe@example.com',
    phone: '+1234567890',
    address: {
      street: '123 Main St',
      city: 'Anytown',
      state: 'CA',
      zipCode: '12345'
    }
  },
  emergencyContact: {
    name: 'Emergency Contact',
    relationship: 'Grandparent',
    phone: '+0987654321'
  },
  preferences: {
    program: 'regular',
    transportNeeded: false,
    specialNeeds: ''
  }
}