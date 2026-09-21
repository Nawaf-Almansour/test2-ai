import React, { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registrationSchema, RegistrationFormData } from '../schemas/registration.schema';
import { useRegistration } from '../hooks/useRegistration';
import { StudentInformationStep } from './StudentInformationStep';
import { GuardianInformationStep } from './GuardianInformationStep';
import { AcademicInformationStep } from './AcademicInformationStep';
import { AdditionalInformationStep } from './AdditionalInformationStep';
import { RegistrationReview } from './RegistrationReview';
import { RegistrationProgress } from './RegistrationProgress';
import { transformFormDataToApiRequest, transformApiErrorToFormErrors } from '../utils/transformers';

interface RegistrationFormProps {
  onSuccess: (requestId: string) => void;
}

export const RegistrationForm: React.FC<RegistrationFormProps> = ({ onSuccess }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isReviewing, setIsReviewing] = useState(false);
  const { submitRegistration, isSubmitting, error, isSuccess, reset } = useRegistration();

  const methods = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      student: {
        firstName: '',
        middleName: '',
        lastName: '',
        dateOfBirth: '',
        gender: undefined,
        nationality: '',
      },
      guardian: {
        firstName: '',
        lastName: '',
        relationship: undefined,
        mobile: '',
        alternativeMobile: '',
        email: '',
        preferredContactMethod: 'whatsapp',
      },
      academic: {
        requestedGrade: undefined,
      },
      transportationRequired: false,
      siblingAtSchool: false,
      source: 'website',
      notes: '',
      registrationConsent: false,
      marketingConsent: false,
    },
    mode: 'onChange',
  });

  // Reset form after successful submission
  React.useEffect(() => {
    if (isSuccess) {
      methods.reset();
      setCurrentStep(1);
      setIsReviewing(false);
      reset(); // Reset the mutation state
    }
  }, [isSuccess, methods, reset]);

  const totalSteps = 4;
  const isLastStep = currentStep === totalSteps;

  const handleNext = async () => {
    let fieldsToValidate: string[] = [];

    switch (currentStep) {
      case 1:
        fieldsToValidate = [
          'student.firstName',
          'student.lastName',
          'student.dateOfBirth',
          'student.gender',
          'student.nationality',
          'student.requestedGrade',
        ];
        break;
      case 2:
        fieldsToValidate = [
          'guardian.firstName',
          'guardian.lastName',
          'guardian.relationship',
          'guardian.mobile',
          'guardian.preferredContactMethod',
        ];
        break;
      case 3:
        fieldsToValidate = ['academic.requestedGrade'];
        break;
      case 4:
        fieldsToValidate = ['registrationConsent'];
        break;
    }

    const isValid = await methods.trigger(fieldsToValidate as any);
    
    if (isValid) {
      if (isLastStep) {
        setIsReviewing(true);
      } else {
        setCurrentStep(currentStep + 1);
      }
    } else {
      // Find the first invalid field and scroll to it
      const firstError = Object.keys(methods.formState.errors)[0];
      if (firstError) {
        const element = document.querySelector(`[name="${firstError}"]`) as HTMLElement;
        element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element?.focus();
      }
    }
  };

  const handlePrevious = () => {
    if (isReviewing) {
      setIsReviewing(false);
    } else {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (data: RegistrationFormData) => {
    try {
      // Transform form data to API request format
      const apiRequest = transformFormDataToApiRequest(data);
      const result = await submitRegistration(apiRequest as any);
      onSuccess(result.requestId);
    } catch (error) {
      // Error is already handled by the hook with toast notifications
      console.error('Registration failed:', error);
    }
  };

  const handleEdit = (step: number) => {
    setIsReviewing(false);
    setCurrentStep(step);
  };

  // Get field-level errors for better UX
  const getFieldError = (fieldName: string): { message: string } | undefined => {
    const apiErrors = transformApiErrorToFormErrors(error);
    const apiError = apiErrors[fieldName];
    if (apiError) {
      return { message: apiError };
    }
    const formError = methods.formState.errors[fieldName as keyof RegistrationFormData];
    if (formError && typeof formError === 'object' && 'message' in formError) {
      return { message: String(formError.message) };
    }
    return undefined;
  };

  if (isReviewing) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <RegistrationProgress currentStep={totalSteps} totalSteps={totalSteps} />
        <div className="mt-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Review Your Application
          </h2>
          <RegistrationReview
            data={methods.getValues()}
            onEdit={handleEdit}
            onSubmit={methods.handleSubmit(handleSubmit)}
            isSubmitting={isSubmitting}
            error={error}
            onBack={handlePrevious}
          />
        </div>
      </div>
    );
  }

  return (
    <FormProvider {...methods}>
      <div className="bg-white rounded-lg shadow-lg p-6">
        <RegistrationProgress currentStep={currentStep} totalSteps={totalSteps} />
        
        <div className="mt-6">
          {currentStep === 1 && <StudentInformationStep getFieldError={getFieldError} />}
          {currentStep === 2 && <GuardianInformationStep getFieldError={getFieldError} />}
          {currentStep === 3 && <AcademicInformationStep getFieldError={getFieldError} />}
          {currentStep === 4 && <AdditionalInformationStep getFieldError={getFieldError} />}
        </div>

        <div className="mt-8 flex justify-between">
          <button
            type="button"
            onClick={handlePrevious}
            disabled={currentStep === 1 || isSubmitting}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          <button
            type="button"
            onClick={handleNext}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Submitting...' : isLastStep ? 'Review Application' : 'Next'}
          </button>
        </div>

        {error && (
          <div className="mt-4">
            {(error as { error?: { fields?: Record<string, string>; message?: string } }).error?.fields && Object.keys((error as { error?: { fields?: Record<string, string> } }).error?.fields ?? {}).length > 0 && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                <h4 className="text-sm font-medium text-red-800 mb-2">Please correct the following errors:</h4>
                <ul className="text-sm text-red-600 space-y-1">
                  {Object.entries((error as { error?: { fields?: Record<string, string> } }).error?.fields ?? {}).map(([field, message]) => (
                    <li key={field} className="flex items-start">
                      <span className="font-medium mr-2">{field}:</span>
                      <span>{message}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* General error message */}
            {!((error as { error?: { fields?: Record<string, string> } }).error?.fields) && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">
                  {(error as { error?: { message?: string } }).error?.message || 'An error occurred. Please try again.'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </FormProvider>
  );
};