import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Input } from '../../../components/ui/Input';
import { Label } from '../../../components/ui/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/Select';
import { RadioGroup, RadioGroupItem } from '../../../components/ui/RadioGroup';
import { RegistrationFormData } from '../schemas/registration.schema';

const relationships = [
  { value: 'father', label: 'Father' },
  { value: 'mother', label: 'Mother' },
  { value: 'guardian', label: 'Guardian' },
];

const contactMethods = [
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'phone', label: 'Phone Call' },
  { value: 'email', label: 'Email' },
];

interface GuardianInformationStepProps {
  getFieldError?: (fieldName: string) => { message: string } | undefined;
}

export const GuardianInformationStep: React.FC<GuardianInformationStepProps> = ({ getFieldError }) => {
  const {
    register,
    formState: { errors },
    setValue,
    watch,
    trigger,
  } = useFormContext<RegistrationFormData>();

  const watchedRelationship = watch('guardian.relationship');
  const watchedContactMethod = watch('guardian.preferredContactMethod');

  const getErrorMessage = (fieldPath: string) => {
    const formError = errors.guardian?.[fieldPath.split('.')[1] as keyof typeof errors.guardian];
    const apiError = getFieldError?.(`guardian.${fieldPath}`);
    return formError?.message || apiError?.message;
  };

  const hasError = (fieldPath: string) => {
    const formError = errors.guardian?.[fieldPath.split('.')[1] as keyof typeof errors.guardian];
    const apiError = getFieldError?.(`guardian.${fieldPath}`);
    return !!(formError || apiError);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Guardian Information
      </h2>
      
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="guardian.firstName">
              First Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="guardian.firstName"
              {...register('guardian.firstName')}
              placeholder="Enter first name"
              className={`mt-1 ${hasError('guardian.firstName') ? 'border-red-500' : ''}`}
            />
            {getErrorMessage('guardian.firstName') && (
              <p className="mt-1 text-sm text-red-600">
                {getErrorMessage('guardian.firstName')}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="guardian.lastName">
              Last Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="guardian.lastName"
              {...register('guardian.lastName')}
              placeholder="Enter last name"
              className={`mt-1 ${hasError('guardian.lastName') ? 'border-red-500' : ''}`}
            />
            {getErrorMessage('guardian.lastName') && (
              <p className="mt-1 text-sm text-red-600">
                {getErrorMessage('guardian.lastName')}
              </p>
            )}
          </div>
        </div>

        <div>
          <Label>
            Relationship <span className="text-red-500">*</span>
          </Label>
          <RadioGroup
            value={watchedRelationship}
            onValueChange={(value) => {
              setValue('guardian.relationship', value as 'father' | 'mother' | 'guardian');
              trigger('guardian.relationship');
            }}
            className="mt-2"
          >
            <div className="grid grid-cols-3 gap-4">
              {relationships.map((rel) => (
                <div key={rel.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={rel.value} id={rel.value} />
                  <Label htmlFor={rel.value}>{rel.label}</Label>
                </div>
              ))}
            </div>
          </RadioGroup>
          {getErrorMessage('guardian.relationship') && (
            <p className="mt-1 text-sm text-red-600">
              {getErrorMessage('guardian.relationship')}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="guardian.mobile">
              Mobile Number <span className="text-red-500">*</span>
            </Label>
            <Input
              id="guardian.mobile"
              {...register('guardian.mobile')}
              placeholder="+9665xxxxxxxx or 05xxxxxxxx"
              className={`mt-1 ${hasError('guardian.mobile') ? 'border-red-500' : ''}`}
            />
            {getErrorMessage('guardian.mobile') && (
              <p className="mt-1 text-sm text-red-600">
                {getErrorMessage('guardian.mobile')}
              </p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Format: +9665xxxxxxxx, 05xxxxxxxx, or 5xxxxxxxx
            </p>
          </div>

          <div>
            <Label htmlFor="guardian.alternativeMobile">Alternative Mobile</Label>
            <Input
              id="guardian.alternativeMobile"
              {...register('guardian.alternativeMobile')}
              placeholder="+9665xxxxxxxx or 05xxxxxxxx"
              className={`mt-1 ${hasError('guardian.alternativeMobile') ? 'border-red-500' : ''}`}
            />
            {getErrorMessage('guardian.alternativeMobile') && (
              <p className="mt-1 text-sm text-red-600">
                {getErrorMessage('guardian.alternativeMobile')}
              </p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Optional additional contact number
            </p>
          </div>
        </div>

        <div>
          <Label htmlFor="guardian.email">Email Address</Label>
          <Input
            id="guardian.email"
            type="email"
            {...register('guardian.email')}
            placeholder="parent@example.com"
            className={`mt-1 ${hasError('guardian.email') ? 'border-red-500' : ''}`}
            aria-describedby="guardian.email-description"
            aria-invalid={hasError('guardian.email')}
          />
          {getErrorMessage('guardian.email') && (
            <p className="mt-1 text-sm text-red-600" id="guardian.email-error">
              {getErrorMessage('guardian.email')}
            </p>
          )}
          <p className="mt-1 text-xs text-gray-500" id="guardian.email-description">
            Optional - used for official communications
          </p>
        </div>

        <div>
          <Label>
            Preferred Contact Method <span className="text-red-500">*</span>
          </Label>
          <RadioGroup
            value={watchedContactMethod}
            onValueChange={(value) => {
              setValue('guardian.preferredContactMethod', value as 'whatsapp' | 'phone' | 'email');
              trigger('guardian.preferredContactMethod');
            }}
            className="mt-2"
          >
            <div className="grid grid-cols-3 gap-4">
              {contactMethods.map((method) => (
                <div key={method.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={method.value} id={method.value} />
                  <Label htmlFor={method.value}>{method.label}</Label>
                </div>
              ))}
            </div>
          </RadioGroup>
          {getErrorMessage('guardian.preferredContactMethod') && (
            <p className="mt-1 text-sm text-red-600">
              {getErrorMessage('guardian.preferredContactMethod')}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};