import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Input } from '../../../components/ui/Input';
import { Label } from '../../../components/ui/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/Select';
import { RadioGroup, RadioGroupItem } from '../../../components/ui/RadioGroup';

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

export const GuardianInformationStep: React.FC = () => {
  const {
    register,
    formState: { errors },
    setValue,
    watch,
    trigger,
  } = useFormContext();

  const watchedRelationship = watch('guardian.relationship');
  const watchedContactMethod = watch('guardian.preferredContactMethod');

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
              className={`mt-1 ${errors.guardian?.firstName ? 'border-red-500' : ''}`}
            />
            {errors.guardian?.firstName && (
              <p className="mt-1 text-sm text-red-600">
                {errors.guardian.firstName.message}
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
              className={`mt-1 ${errors.guardian?.lastName ? 'border-red-500' : ''}`}
            />
            {errors.guardian?.lastName && (
              <p className="mt-1 text-sm text-red-600">
                {errors.guardian.lastName.message}
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
          {errors.guardian?.relationship && (
            <p className="mt-1 text-sm text-red-600">
              {errors.guardian.relationship.message}
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
              className={`mt-1 ${errors.guardian?.mobile ? 'border-red-500' : ''}`}
            />
            {errors.guardian?.mobile && (
              <p className="mt-1 text-sm text-red-600">
                {errors.guardian.mobile.message}
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
              className={`mt-1 ${errors.guardian?.alternativeMobile ? 'border-red-500' : ''}`}
            />
            {errors.guardian?.alternativeMobile && (
              <p className="mt-1 text-sm text-red-600">
                {errors.guardian.alternativeMobile.message}
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
            className={`mt-1 ${errors.guardian?.email ? 'border-red-500' : ''}`}
          />
          {errors.guardian?.email && (
            <p className="mt-1 text-sm text-red-600">
              {errors.guardian.email.message}
            </p>
          )}
          <p className="mt-1 text-xs text-gray-500">
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
          {errors.guardian?.preferredContactMethod && (
            <p className="mt-1 text-sm text-red-600">
              {errors.guardian.preferredContactMethod.message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};