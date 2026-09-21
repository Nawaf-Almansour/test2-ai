import React from 'react';
import { CheckCircle, FileText, Phone, Mail, Calendar, ArrowRight } from 'lucide-react';
import { Button } from '../../../components/ui/Button';

interface SuccessPageProps {
  requestId: string;
  onNewApplication: () => void;
}

export const SuccessPage: React.FC<SuccessPageProps> = ({ requestId, onNewApplication }) => {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const submissionDate = new Date();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-20"></div>
              <div className="relative bg-green-500 rounded-full p-4">
                <CheckCircle className="h-12 w-12 text-white" />
              </div>
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-4">
            Application Submitted Successfully!
          </h1>
          
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Thank you for your interest in our school. Your registration request has been received and is being processed.
          </p>
        </div>

        {/* Reference Number Card */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8 border-2 border-green-200">
          <div className="text-center">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Your Reference Number</h2>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 inline-block">
              <p className="text-2xl font-mono font-bold text-green-800">{requestId}</p>
            </div>
            <p className="text-sm text-gray-500 mt-3">
              Please save this reference number for your records
            </p>
          </div>
        </div>

        {/* Submission Details */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Submission Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start space-x-3">
              <Calendar className="h-5 w-5 text-blue-500 mt-1" />
              <div>
                <p className="text-sm font-medium text-gray-500">Submission Date</p>
                <p className="text-sm text-gray-900">{formatDate(submissionDate)}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <FileText className="h-5 w-5 text-blue-500 mt-1" />
              <div>
                <p className="text-sm font-medium text-gray-500">Status</p>
                <p className="text-sm text-gray-900">Under Review</p>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">What Happens Next?</h3>
            <ul className="text-sm text-blue-700 space-y-2">
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                Our admissions team will review your application within 3-5 business days
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                You will receive a confirmation email with detailed information
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                If additional information is needed, we will contact you using your preferred method
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                You can check your application status using the reference number above
              </li>
            </ul>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Need Help?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start space-x-3">
              <Phone className="h-5 w-5 text-gray-500 mt-1" />
              <div>
                <p className="text-sm font-medium text-gray-500">Phone</p>
                <p className="text-sm text-gray-900">+966 50 123 4567</p>
                <p className="text-xs text-gray-500">Sunday - Thursday, 8:00 AM - 4:00 PM</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Mail className="h-5 w-5 text-gray-500 mt-1" />
              <div>
                <p className="text-sm font-medium text-gray-500">Email</p>
                <p className="text-sm text-gray-900">admissions@school.edu.sa</p>
                <p className="text-xs text-gray-500">We'll respond within 24 hours</p>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <p className="text-sm text-gray-600 text-center">
              Please have your reference number ({requestId}) ready when contacting us
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={onNewApplication}
            className="flex items-center justify-center space-x-2"
          >
            <span>Submit Another Application</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            onClick={() => window.print()}
            className="flex items-center justify-center space-x-2"
          >
            <FileText className="h-4 w-4" />
            <span>Print Confirmation</span>
          </Button>
        </div>

        {/* Important Notice */}
        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="text-sm font-semibold text-yellow-900 mb-2">Important Notice</h3>
          <p className="text-sm text-yellow-700">
            This registration request does not guarantee admission. Final admission decisions are based on 
            seat availability, eligibility criteria, and completion of all required documentation. 
            Please keep your reference number for future correspondence.
          </p>
        </div>
      </div>
    </div>
  );
};