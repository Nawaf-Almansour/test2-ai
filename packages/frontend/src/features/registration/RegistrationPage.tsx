import React, { useState } from 'react';
import { RegistrationForm } from './components/RegistrationForm';
import { SuccessPage } from './components/SuccessPage';

export const RegistrationPage: React.FC = () => {
  const [isSuccess, setIsSuccess] = useState(false);
  const [requestId, setRequestId] = useState<string>('');

  const handleSuccess = (id: string) => {
    setRequestId(id);
    setIsSuccess(true);
  };

  const handleNewApplication = () => {
    setIsSuccess(false);
    setRequestId('');
  };

  if (isSuccess && requestId) {
    return <SuccessPage requestId={requestId} onNewApplication={handleNewApplication} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            School Registration
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Complete the form below to register your child for our school.
          </p>
        </div>

        <RegistrationForm onSuccess={handleSuccess} />
      </div>
    </div>
  );
};