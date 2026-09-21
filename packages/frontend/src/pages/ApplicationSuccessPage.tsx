import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';

const ApplicationSuccessPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const requestId = searchParams.get('requestId');

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="mb-6">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
              <svg
                className="h-8 w-8 text-green-600"
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
            </div>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Registration Submitted Successfully!
          </h1>

          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <p className="text-gray-600 mb-4">
              Thank you for your interest in our school. Your registration request has been 
              submitted and is currently under review.
            </p>
            
            {requestId && (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
                <p className="text-sm font-medium text-blue-800 mb-1">
                  Your Reference Number:
                </p>
                <p className="text-lg font-bold text-blue-900">
                  {requestId}
                </p>
                <p className="text-xs text-blue-700 mt-2">
                  Please save this reference number for your records
                </p>
              </div>
            )}

            <div className="text-left bg-gray-50 rounded-md p-4">
              <h3 className="font-semibold text-gray-900 mb-3">What happens next?</h3>
              <ol className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <span className="font-medium text-blue-600 mr-2">1.</span>
                  <span>School administration reviews your request</span>
                </li>
                <li className="flex items-start">
                  <span className="font-medium text-blue-600 mr-2">2.</span>
                  <span>We will contact you using your preferred contact method</span>
                </li>
                <li className="flex items-start">
                  <span className="font-medium text-blue-600 mr-2">3.</span>
                  <span>Student assessment may be scheduled</span>
                </li>
                <li className="flex items-start">
                  <span className="font-medium text-blue-600 mr-2">4.</span>
                  <span>Admission decision will be communicated</span>
                </li>
              </ol>
            </div>
          </div>

          <div className="space-y-4">
            <Link
              to="/"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md font-medium hover:bg-blue-700 transition-colors"
            >
              Return to Homepage
            </Link>
            
            <div className="text-sm text-gray-500">
              <p>
                If you have any questions, please contact us at{' '}
                <a href="tel:+966500000000" className="text-blue-600 hover:underline">
                  +966 50 000 0000
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationSuccessPage;