import React from 'react';
import { useNavigate } from 'react-router-dom';
import RegistrationForm from '../features/registration/components/RegistrationForm';

const ApplyPage: React.FC = () => {
  const navigate = useNavigate();

  const handleSuccess = (requestId: string) => {
    navigate(`/application-success?requestId=${requestId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            School Registration Application
          </h1>
          <p className="text-lg text-gray-600">
            Complete the form below to submit your registration request. 
            All fields marked with * are required.
          </p>
        </div>
        
        <RegistrationForm onSuccess={handleSuccess} />
      </div>
    </div>
  );
};

export default ApplyPage;