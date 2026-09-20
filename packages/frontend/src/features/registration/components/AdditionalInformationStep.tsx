import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Input } from '../../../components/ui/Input';
import { Label } from '../../../components/ui/Label';
import { Checkbox } from '../../../components/ui/Checkbox';
import { Textarea } from '../../../components/ui/Textarea';
import { RegistrationFormData } from '../../schemas/registration.schema';

const sources = [
  'website',
  'social_media',
  'friend',
  'advertisement',
  'school_event',
  'other',
];

export const AdditionalInformationStep: React.FC = () => {
  const {
    register,
    formState: { errors },
  } = useFormContext<RegistrationFormData>();

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Additional Information
      </h2>
      
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="transportationRequired"
              {...register('transportationRequired')}
            />
            <Label htmlFor="transportationRequired" className="text-sm font-medium">
              School transportation required
            </Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="siblingAtSchool"
              {...register('siblingAtSchool')}
            />
            <Label htmlFor="siblingAtSchool" className="text-sm font-medium">
              Sibling currently enrolled at our school
            </Label>
          </div>
        </div>

        <div>
          <Label htmlFor="source">How did you hear about us?</Label>
          <select
            id="source"
            {...register('source')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            {sources.map((source) => (
              <option key={source} value={source}>
                {source.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label htmlFor="notes">Additional Notes</Label>
          <Textarea
            id="notes"
            {...register('notes')}
            placeholder="Any additional information or special requirements you'd like us to know (optional)"
            className={`mt-1 ${errors.notes ? 'border-red-500' : ''}`}
            rows={4}
          />
          {errors.notes && (
            <p className="mt-1 text-sm text-red-600">
              {errors.notes.message}
            </p>
          )}
        </div>

        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Consent and Agreement
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-start space-x-2">
              <Checkbox
                id="registrationConsent"
                {...register('registrationConsent')}
                className="mt-1"
              />
              <div className="flex-1">
                <Label htmlFor="registrationConsent" className="text-sm font-medium">
                  I consent to the registration <span className="text-red-500">*</span>
                </Label>
                <p className="text-xs text-gray-500 mt-1">
                  By checking this box, I confirm that all information provided is accurate and complete. 
                  I understand that providing false information may result in the rejection of this 
                  registration request.
                </p>
              </div>
            </div>
            
            {errors.registrationConsent && (
              <p className="text-sm text-red-600">
                {errors.registrationConsent.message}
              </p>
            )}

            <div className="flex items-start space-x-2">
              <Checkbox
                id="marketingConsent"
                {...register('marketingConsent')}
                className="mt-1"
              />
              <div className="flex-1">
                <Label htmlFor="marketingConsent" className="text-sm font-medium">
                  I consent to receive marketing communications
                </Label>
                <p className="text-xs text-gray-500 mt-1">
                  Optional: Receive updates about school events, news, and educational resources.
                  You can unsubscribe at any time.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <h4 className="text-sm font-semibold text-blue-900 mb-2">
            Important Notice
          </h4>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>• Submission of this form does not guarantee admission</li>
            <li>• All applications are subject to review by the school administration</li>
            <li>• You will be contacted regarding the next steps in the admission process</li>
            <li>• Please keep your reference number for future correspondence</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
