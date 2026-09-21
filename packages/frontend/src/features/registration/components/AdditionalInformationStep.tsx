import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Checkbox } from '../../../components/ui/Checkbox';
import { Label } from '../../../components/ui/Label';
import { Textarea } from '../../../components/ui/Textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/Select';
import { RegistrationFormData } from '../../schemas/registration.schema';

const sources = [
  { value: 'website', label: 'Website' },
  { value: 'social_media', label: 'Social Media' },
  { value: 'friend', label: 'Friend/Family' },
  { value: 'advertisement', label: 'Advertisement' },
  { value: 'school_event', label: 'School Event' },
  { value: 'other', label: 'Other' },
];

interface AdditionalInformationStepProps {
  getFieldError?: (fieldName: string) => { message: string } | undefined;
}

export const AdditionalInformationStep: React.FC<AdditionalInformationStepProps> = ({ getFieldError }) => {
  const {
    register,
    formState: { errors },
    setValue,
    watch,
    trigger,
  } = useFormContext<RegistrationFormData>();

  const watchedSource = watch('source');
  const watchedTransportation = watch('transportationRequired');
  const watchedSibling = watch('siblingAtSchool');
  const watchedMarketingConsent = watch('marketingConsent');
  const watchedRegistrationConsent = watch('registrationConsent');

  const getErrorMessage = (fieldPath: string) => {
    const formError = errors[fieldPath as keyof RegistrationFormData];
    const apiError = getFieldError?.(fieldPath);
    return formError?.message || apiError?.message;
  };

  const hasError = (fieldPath: string) => {
    const formError = errors[fieldPath as keyof RegistrationFormData];
    const apiError = getFieldError?.(fieldPath);
    return !!(formError || apiError);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Additional Information
      </h2>
      
      <div className="space-y-6">
        <div>
          <Label htmlFor="source">
            How did you hear about us? <span className="text-red-500">*</span>
          </Label>
          <Select
            value={watchedSource}
            onValueChange={(value) => {
              setValue('source', value);
              trigger('source');
            }}
          >
            <SelectTrigger className={`mt-1 ${hasError('source') ? 'border-red-500' : ''}`}>
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              {sources.map((source) => (
                <SelectItem key={source.value} value={source.value}>
                  {source.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {getErrorMessage('source') && (
            <p className="mt-1 text-sm text-red-600">
              {getErrorMessage('source')}
            </p>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="transportationRequired"
              checked={watchedTransportation}
              onCheckedChange={(checked) => {
                setValue('transportationRequired', checked as boolean);
                trigger('transportationRequired');
              }}
            />
            <div className="space-y-1 leading-none">
              <Label htmlFor="transportationRequired" className="text-sm font-medium">
                School Transportation Required
              </Label>
              <p className="text-xs text-gray-500">
                Check if you will need school bus services
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Checkbox
              id="siblingAtSchool"
              checked={watchedSibling}
              onCheckedChange={(checked) => {
                setValue('siblingAtSchool', checked as boolean);
                trigger('siblingAtSchool');
              }}
            />
            <div className="space-y-1 leading-none">
              <Label htmlFor="siblingAtSchool" className="text-sm font-medium">
                Sibling Currently Enrolled
              </Label>
              <p className="text-xs text-gray-500">
                Check if you have a sibling currently attending our school
              </p>
            </div>
          </div>
        </div>

        <div>
          <Label htmlFor="notes">Additional Notes</Label>
          <Textarea
            id="notes"
            {...register('notes')}
            placeholder="Any additional information you'd like to share with us"
            rows={4}
            className={`mt-1 ${hasError('notes') ? 'border-red-500' : ''}`}
          />
          {getErrorMessage('notes') && (
            <p className="mt-1 text-sm text-red-600">
              {getErrorMessage('notes')}
            </p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Optional - use this space for any questions or special requirements
          </p>
        </div>

        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Consent & Permissions</h3>
          
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="registrationConsent"
                checked={watchedRegistrationConsent}
                onCheckedChange={(checked) => {
                  setValue('registrationConsent', checked as boolean);
                  trigger('registrationConsent');
                }}
              />
              <div className="space-y-1 leading-none">
                <Label htmlFor="registrationConsent" className="text-sm font-medium">
                  Registration Consent <span className="text-red-500">*</span>
                </Label>
                <p className="text-xs text-gray-500">
                  I confirm that the information provided is accurate and authorize the school to contact me regarding this registration request.
                </p>
              </div>
            </div>
            {getErrorMessage('registrationConsent') && (
              <p className="text-sm text-red-600">
                {getErrorMessage('registrationConsent')}
              </p>
            )}

            <div className="flex items-start space-x-3">
              <Checkbox
                id="marketingConsent"
                checked={watchedMarketingConsent}
                onCheckedChange={(checked) => {
                  setValue('marketingConsent', checked as boolean);
                  trigger('marketingConsent');
                }}
              />
              <div className="space-y-1 leading-none">
                <Label htmlFor="marketingConsent" className="text-sm font-medium">
                  Marketing Communications
                </Label>
                <p className="text-xs text-gray-500">
                  I would like to receive updates and information about school programs and events.
                </p>
              </div>
            </div>
            {getErrorMessage('marketingConsent') && (
              <p className="text-sm text-red-600">
                {getErrorMessage('marketingConsent')}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};