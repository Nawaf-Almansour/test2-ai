import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Input } from '../../../components/ui/Input';
import { Label } from '../../../components/ui/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/Select';
import { Textarea } from '../../../components/ui/Textarea';
import { RegistrationFormData } from '../schemas/registration.schema';

const grades = [
  'KG1', 'KG2', 'KG3',
  'GRADE_1', 'GRADE_2', 'GRADE_3', 'GRADE_4', 'GRADE_5', 'GRADE_6',
  'GRADE_7', 'GRADE_8', 'GRADE_9', 'GRADE_10', 'GRADE_11', 'GRADE_12',
];

interface AcademicInformationStepProps {
  getFieldError?: (fieldName: string) => { message: string } | undefined;
}

export const AcademicInformationStep: React.FC<AcademicInformationStepProps> = ({ getFieldError }) => {
  const {
    register,
    formState: { errors },
    setValue,
    watch,
    trigger,
  } = useFormContext<RegistrationFormData>();

  const watchedCurrentGrade = watch('academic.currentGrade' as never) as unknown as string | undefined;
  const watchedRequestedGrade = watch('academic.requestedGrade' as never) as unknown as string | undefined;

  const readAcademicError = (fieldPath: string) => {
    const key = fieldPath.replace(/^academic\./, '') as keyof NonNullable<
      RegistrationFormData['academic']
    >;
    const formError = errors.academic?.[key];
    const formMessage =
      formError && typeof formError === 'object' && 'message' in formError
        ? String(formError.message)
        : undefined;
    const apiError = getFieldError?.(fieldPath);
    return { formMessage, hasFormError: !!formError, apiMessage: apiError?.message };
  };

  const getErrorMessage = (fieldPath: string) => {
    const { formMessage, apiMessage } = readAcademicError(fieldPath);
    return formMessage || apiMessage;
  };

  const hasError = (fieldPath: string) => {
    const { hasFormError, apiMessage } = readAcademicError(fieldPath);
    return hasFormError || !!apiMessage;
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Academic Information
      </h2>
      
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="academic.currentSchool">Current/Previous School</Label>
            <Input
              id="academic.currentSchool"
              {...register('academic.previousSchool')}
              placeholder="Enter current or previous school name"
              className={`mt-1 ${hasError('academic.previousSchool') ? 'border-red-500' : ''}`}
            />
            {getErrorMessage('academic.previousSchool') && (
              <p className="mt-1 text-sm text-red-600">
                {getErrorMessage('academic.previousSchool')}
              </p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Leave blank if this is for first-time school enrollment
            </p>
          </div>

          <div>
            <Label htmlFor="academic.currentGrade">Current Grade</Label>
            <Select
              value={watchedCurrentGrade}
              onValueChange={(value) => {
                setValue('academic.currentGrade', value as never);
                trigger('academic.currentGrade');
              }}
            >
              <SelectTrigger className={`mt-1 ${hasError('academic.currentGrade') ? 'border-red-500' : ''}`}>
                <SelectValue placeholder="Select current grade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No current grade</SelectItem>
                {grades.map((grade) => (
                  <SelectItem key={grade} value={grade}>
                    {grade.replace('_', ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {getErrorMessage('academic.currentGrade') && (
              <p className="mt-1 text-sm text-red-600">
                {getErrorMessage('academic.currentGrade')}
              </p>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="academic.requestedGrade">
            Requested Grade <span className="text-red-500">*</span>
          </Label>
          <Select
            value={watchedRequestedGrade}
            onValueChange={(value) => {
              setValue('academic.requestedGrade', value as never);
              trigger('academic.requestedGrade');
            }}
          >
            <SelectTrigger className={`mt-1 ${hasError('academic.requestedGrade') ? 'border-red-500' : ''}`}>
              <SelectValue placeholder="Select requested grade" />
            </SelectTrigger>
            <SelectContent>
              {grades.map((grade) => (
                <SelectItem key={grade} value={grade}>
                  {grade.replace('_', ' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {getErrorMessage('academic.requestedGrade') && (
            <p className="mt-1 text-sm text-red-600">
              {getErrorMessage('academic.requestedGrade')}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="academic.transferReason">Reason for Transfer</Label>
          <Textarea
            id="academic.transferReason"
            {...register('academic.transferReason')}
            placeholder="Please briefly explain why you're seeking to transfer to our school"
            rows={4}
            className={`mt-1 ${hasError('academic.transferReason') ? 'border-red-500' : ''}`}
          />
          {getErrorMessage('academic.transferReason') && (
            <p className="mt-1 text-sm text-red-600">
              {getErrorMessage('academic.transferReason')}
            </p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Optional - helps us understand your needs better
          </p>
        </div>
      </div>
    </div>
  );
};