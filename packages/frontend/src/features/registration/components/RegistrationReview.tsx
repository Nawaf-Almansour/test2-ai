import React from 'react';
import { RegistrationFormData } from '../schemas/registration.schema';

interface RegistrationReviewProps {
  data: RegistrationFormData;
  onEdit: (step: number) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  error?: any;
  onBack: () => void;
}

export const RegistrationReview: React.FC<RegistrationReviewProps> = ({
  data,
  onEdit,
  onSubmit,
  isSubmitting,
  error,
  onBack,
}) => {
  const formatMobile = (mobile: string) => {
    // Format mobile number for display
    if (mobile.startsWith('+9665')) {
      return mobile.replace(/(\+966)(5\d{8})/, '$1-$2');
    }
    if (mobile.startsWith('05')) {
      return mobile.replace(/(05)(\d{8})/, '0$5-$2');
    }
    return mobile;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getGradeLabel = (grade: string) => {
    const gradeMap: { [key: string]: string } = {
      'KG1': 'Kindergarten 1',
      'KG2': 'Kindergarten 2',
      'KG3': 'Kindergarten 3',
      'GRADE_1': 'Grade 1',
      'GRADE_2': 'Grade 2',
      'GRADE_3': 'Grade 3',
      'GRADE_4': 'Grade 4',
      'GRADE_5': 'Grade 5',
      'GRADE_6': 'Grade 6',
      'GRADE_7': 'Grade 7',
      'GRADE_8': 'Grade 8',
      'GRADE_9': 'Grade 9',
      'GRADE_10': 'Grade 10',
      'GRADE_11': 'Grade 11',
      'GRADE_12': 'Grade 12',
    };
    return gradeMap[grade] || grade;
  };

  const getRelationshipLabel = (relationship: string) => {
    const relationshipMap: { [key: string]: string } = {
      'father': 'Father',
      'mother': 'Mother',
      'guardian': 'Legal Guardian',
    };
    return relationshipMap[relationship] || relationship;
  };

  const getContactMethodLabel = (method: string) => {
    const methodMap: { [key: string]: string } = {
      'whatsapp': 'WhatsApp',
      'phone': 'Phone Call',
      'email': 'Email',
    };
    return methodMap[method] || method;
  };

  return (
    <div className="space-y-6">
      {/* Student Information */}
      <div className="border rounded-lg p-4">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Student Information</h3>
          <button
            type="button"
            onClick={() => onEdit(1)}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Edit
          </button>
        </div>
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-gray-500">Full Name</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {data.student.firstName} {data.student.middleName && data.student.middleName + ' '}{data.student.lastName}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Date of Birth</dt>
            <dd className="mt-1 text-sm text-gray-900">{formatDate(data.student.dateOfBirth)}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Gender</dt>
            <dd className="mt-1 text-sm text-gray-900 capitalize">{data.student.gender}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Nationality</dt>
            <dd className="mt-1 text-sm text-gray-900">{data.student.nationality}</dd>
          </div>
          {data.student.nationalId && (
            <div>
              <dt className="text-sm font-medium text-gray-500">National ID</dt>
              <dd className="mt-1 text-sm text-gray-900">{data.student.nationalId}</dd>
            </div>
          )}
          <div>
            <dt className="text-sm font-medium text-gray-500">Requested Grade</dt>
            <dd className="mt-1 text-sm text-gray-900">{getGradeLabel(data.student.requestedGrade)}</dd>
          </div>
        </dl>
      </div>

      {/* Guardian Information */}
      <div className="border rounded-lg p-4">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Guardian Information</h3>
          <button
            type="button"
            onClick={() => onEdit(2)}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Edit
          </button>
        </div>
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-gray-500">Full Name</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {data.guardian.firstName} {data.guardian.lastName}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Relationship</dt>
            <dd className="mt-1 text-sm text-gray-900">{getRelationshipLabel(data.guardian.relationship)}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Mobile Number</dt>
            <dd className="mt-1 text-sm text-gray-900">{formatMobile(data.guardian.mobile)}</dd>
          </div>
          {data.guardian.alternativeMobile && (
            <div>
              <dt className="text-sm font-medium text-gray-500">Alternative Mobile</dt>
              <dd className="mt-1 text-sm text-gray-900">{formatMobile(data.guardian.alternativeMobile)}</dd>
            </div>
          )}
          {data.guardian.email && (
            <div>
              <dt className="text-sm font-medium text-gray-500">Email Address</dt>
              <dd className="mt-1 text-sm text-gray-900">{data.guardian.email}</dd>
            </div>
          )}
          <div>
            <dt className="text-sm font-medium text-gray-500">Preferred Contact Method</dt>
            <dd className="mt-1 text-sm text-gray-900">{getContactMethodLabel(data.guardian.preferredContactMethod)}</dd>
          </div>
        </dl>
      </div>

      {/* Academic Information */}
      <div className="border rounded-lg p-4">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Academic Information</h3>
          <button
            type="button"
            onClick={() => onEdit(3)}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Edit
          </button>
        </div>
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {data.academic?.currentSchool && (
            <div>
              <dt className="text-sm font-medium text-gray-500">Current/Previous School</dt>
              <dd className="mt-1 text-sm text-gray-900">{data.academic.currentSchool}</dd>
            </div>
          )}
          {data.academic?.currentGrade && (
            <div>
              <dt className="text-sm font-medium text-gray-500">Current Grade</dt>
              <dd className="mt-1 text-sm text-gray-900">{getGradeLabel(data.academic.currentGrade)}</dd>
            </div>
          )}
          <div>
            <dt className="text-sm font-medium text-gray-500">Requested Grade</dt>
            <dd className="mt-1 text-sm text-gray-900">{getGradeLabel(data.academic?.requestedGrade || data.student.requestedGrade)}</dd>
          </div>
          {data.academic?.transferReason && (
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500">Reason for Transfer</dt>
              <dd className="mt-1 text-sm text-gray-900">{data.academic.transferReason}</dd>
            </div>
          )}
        </dl>
      </div>

      {/* Additional Information */}
      <div className="border rounded-lg p-4">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Additional Information</h3>
          <button
            type="button"
            onClick={() => onEdit(4)}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Edit
          </button>
        </div>
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-gray-500">Transportation Required</dt>
            <dd className="mt-1 text-sm text-gray-900">{data.transportationRequired ? 'Yes' : 'No'}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Sibling at School</dt>
            <dd className="mt-1 text-sm text-gray-900">{data.siblingAtSchool ? 'Yes' : 'No'}</dd>
          </div>
          {data.notes && (
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500">Additional Notes</dt>
              <dd className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{data.notes}</dd>
            </div>
          )}
          <div>
            <dt className="text-sm font-medium text-gray-500">Marketing Consent</dt>
            <dd className="mt-1 text-sm text-gray-900">{data.marketingConsent ? 'Yes' : 'No'}</dd>
          </div>
        </dl>
      </div>

      {/* Consent Confirmation */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">Consent Confirmation</h3>
        <p className="text-sm text-blue-700">
          I confirm that the information provided is accurate and authorize the school to contact me regarding this registration request.
        </p>
        <div className="mt-2">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            data.registrationConsent ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {data.registrationConsent ? 'Consented' : 'Not Consented'}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between pt-6 border-t">
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Back to Edit
        </button>

        <button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting || !data.registrationConsent}
          className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Application'}
        </button>
      </div>

      {/* API Error Display */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <h4 className="text-sm font-medium text-red-800 mb-2">Submission Error</h4>
          <p className="text-sm text-red-600">
            {error.error?.message || 'An error occurred while submitting your application. Please try again.'}
          </p>
          {error.error?.fields && Object.keys(error.error.fields).length > 0 && (
            <div className="mt-2">
              <p className="text-xs font-medium text-red-700 mb-1">Field errors:</p>
              <ul className="text-xs text-red-600 space-y-1">
                {Object.entries(error.error.fields).map(([field, message]) => (
                  <li key={field} className="flex items-start">
                    <span className="font-medium mr-2">{field}:</span>
                    <span>{message}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};