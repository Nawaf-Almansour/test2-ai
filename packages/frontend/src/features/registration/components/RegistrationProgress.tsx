import React from 'react';

interface RegistrationProgressProps {
  currentStep: number;
  totalSteps: number;
}

export const RegistrationProgress: React.FC<RegistrationProgressProps> = ({
  currentStep,
  totalSteps,
}) => {
  const steps = [
    'Student Information',
    'Guardian Information',
    'Academic Information',
    'Additional Information',
  ];

  return (
    <nav aria-label="Progress">
      <ol className="flex items-center justify-between">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;

          return (
            <li key={stepNumber} className="flex-1">
              {index !== steps.length - 1 && (
                <div
                  className={`${
                    isCompleted ? 'bg-blue-600' : 'bg-gray-200'
                  } h-0.5 w-full mx-auto mb-6`}
                  aria-hidden="true"
                />
              )}
              <div className="flex items-center">
                <div
                  className={`${
                    isCompleted
                      ? 'bg-blue-600'
                      : isCurrent
                      ? 'bg-blue-600'
                      : 'bg-gray-200'
                  } h-10 w-10 rounded-full flex items-center justify-center mx-auto mb-2`}
                >
                  {isCompleted ? (
                    <svg
                      className="h-6 w-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    <span
                      className={`${
                        isCurrent ? 'text-white' : 'text-gray-500'
                      } text-sm font-medium`}
                    >
                      {stepNumber}
                    </span>
                  )}
                </div>
                <div className="hidden sm:block text-center">
                  <div
                    className={`${
                      isCurrent ? 'text-blue-600' : 'text-gray-500'
                    } text-sm font-medium`}
                  >
                    {step}
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};