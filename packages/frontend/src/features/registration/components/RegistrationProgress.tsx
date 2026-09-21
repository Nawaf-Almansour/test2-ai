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
    { id: 1, name: 'Student Info', description: 'Basic student information' },
    { id: 2, name: 'Guardian Info', description: 'Parent/guardian details' },
    { id: 3, name: 'Academic Info', description: 'Educational background' },
    { id: 4, name: 'Additional Info', description: 'Preferences and consent' },
  ];

  return (
    <nav aria-label="Progress">
      <ol className="flex items-center justify-center">
        {steps.map((step, stepIdx) => (
          <li key={step.id} className={stepIdx !== steps.length - 1 ? 'flex-1' : ''}>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div
                  className={`relative flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    step.id <= currentStep
                      ? 'border-blue-600 bg-blue-600'
                      : 'border-gray-300 bg-white'
                  }`}
                >
                  {step.id < currentStep ? (
                    <svg
                      className="w-6 h-6 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <span
                      className={`text-sm font-medium ${
                        step.id === currentStep ? 'text-white' : 'text-gray-500'
                      }`}
                    >
                      {step.id}
                    </span>
                  )}
                </div>
              </div>
              <div className="ml-4 min-w-0 flex-1">
                <p
                  className={`text-sm font-medium ${
                    step.id <= currentStep ? 'text-blue-600' : 'text-gray-500'
                  }`}
                >
                  {step.name}
                </p>
                <p className="text-xs text-gray-500">{step.description}</p>
              </div>
            </div>
            {stepIdx !== steps.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-4 ${
                  step.id < currentStep ? 'bg-blue-600' : 'bg-gray-300'
                }`}
                aria-hidden="true"
              />
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};