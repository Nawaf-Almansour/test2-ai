import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Input } from '../../../components/ui/Input';
import { Label } from '../../../components/ui/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/Select';
import { Textarea } from '../../../components/ui/Textarea';

const grades = [
  'KG1', 'KG2', 'KG3',
  'GRADE_1', 'GRADE_2', 'GRADE_3', 'GRADE_4', 'GRADE_5', 'GRADE_6',
  'GRADE_7', 'GRADE_8', 'GRADE_9', 'GRADE_10', 'GRADE_11', 'GRADE_12',
];

export const AcademicInformationStep: React.FC = () => {
  const {
    register,
    formState: { errors },
    setValue,
    watch,
    trigger,
  } = useFormContext();

  const watchedCurrentGrade = watch('academic.currentGrade');
  const watchedRequestedGrade = watch('academic.requestedGrade');

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Academic Information
      </h2>
      
      <div className="space-y-6">
        <div>
          <Label htmlFor="academic.currentSchool">Current School</Label>
          <Input
            id="academic.currentSchool"
            {...register('academic.currentSchool')}
            placeholder="Enter current school name (if applicable)"
            className={`mt-1 ${errors.academic?.currentSchool ? 'border-red-500' : ''}`}
          />
          {errors.academic?.currentSchool && (
            <p className="mt-1 text-sm text-red-600">
              {errors.academic.currentSchool.message}
            </p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Leave blank if this is for first-time school admission
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="academic.currentGrade">Current Grade</Label>
            <Select
              value={watchedCurrentGrade}
              onValueChange={(value) => {
                setValue('academic.currentGrade', value);
                trigger('academic.currentGrade');
              }}
            >
              <SelectTrigger className={`mt-1 ${errors.academic?.currentGrade ? 'border-red-500' : ''}`}>
                <SelectValue placeholder="Select current grade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Not applicable</SelectItem>
                {grades.map((grade) => (
                  <SelectItem key={grade} value={grade}>
                    {grade.replace('_', ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.academic?.currentGrade && (
              <p className="mt-1 text-sm text-red-600">
                {errors.academic.currentGrade.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="academic.requestedGrade">
              Requested Grade <span className="text-red-500">*</span>
            </Label>
            <Select
              value={watchedRequestedGrade}
              onValueChange={(value) => {
                setValue('academic.requestedGrade', value);
                trigger('academic.requestedGrade');
              }}
            >
              <SelectTrigger className={`mt-1 ${errors.academic?.requestedGrade ? 'border-red-500' : ''}`}>
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
            {errors.academic?.requestedGrade && (
              <p className="mt-1 text-sm text-red-600">
                {errors.academic.requestedGrade.message}
              </p>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="academic.transferReason">Reason for Transfer</Label>
          <Textarea
            id="academic.transferReason"
            {...register('academic.transferReason')}
            placeholder="Please explain why you are seeking to transfer to our school (optional)"
            className={`mt-1 ${errors.academic?.transferReason ? 'border-red-500' : ''}`}
            rows={4}
          />
          {errors.academic?.transferReason && (
            <p className="mt-1 text-sm text-red-600">
              {errors.academic.transferReason.message}
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