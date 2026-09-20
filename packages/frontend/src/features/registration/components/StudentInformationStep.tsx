import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Input } from '../../../components/ui/Input';
import { Label } from '../../../components/ui/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/Select';
import { RadioGroup, RadioGroupItem } from '../../../components/ui/RadioGroup';
import { RegistrationFormData } from '../../schemas/registration.schema';

const grades = [
  'KG1', 'KG2', 'KG3',
  'GRADE_1', 'GRADE_2', 'GRADE_3', 'GRADE_4', 'GRADE_5', 'GRADE_6',
  'GRADE_7', 'GRADE_8', 'GRADE_9', 'GRADE_10', 'GRADE_11', 'GRADE_12',
];

const nationalities = [
  'Saudi', 'Egyptian', 'Jordanian', 'Palestinian', 'Syrian', 'Lebanese',
  'Yemeni', 'Emirati', 'Kuwaiti', 'Bahraini', 'Qatari', 'Omani',
  'Sudanese', 'Moroccan', 'Algerian', 'Tunisian', 'Libyan', 'Iraqi',
  'Other',
];

export const StudentInformationStep: React.FC = () => {
  const {
    register,
    formState: { errors },
    setValue,
    watch,
    trigger,
  } = useFormContext<RegistrationFormData>();

  const watchedGender = watch('student.gender');
  const watchedRequestedGrade = watch('student.requestedGrade');
  const watchedNationality = watch('student.nationality');

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Student Information
      </h2>
      
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <Label htmlFor="student.firstName">
              First Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="student.firstName"
              {...register('student.firstName')}
              placeholder="Enter first name"
              className={`mt-1 ${errors.student?.firstName ? 'border-red-500' : ''}`}
            />
            {errors.student?.firstName && (
              <p className="mt-1 text-sm text-red-600">
                {errors.student.firstName.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="student.middleName">Middle Name</Label>
            <Input
              id="student.middleName"
              {...register('student.middleName')}
              placeholder="Enter middle name (optional)"
              className={`mt-1 ${errors.student?.middleName ? 'border-red-500' : ''}`}
            />
            {errors.student?.middleName && (
              <p className="mt-1 text-sm text-red-600">
                {errors.student.middleName.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="student.lastName">
              Last Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="student.lastName"
              {...register('student.lastName')}
              placeholder="Enter last name"
              className={`mt-1 ${errors.student?.lastName ? 'border-red-500' : ''}`}
            />
            {errors.student?.lastName && (
              <p className="mt-1 text-sm text-red-600">
                {errors.student.lastName.message}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="student.dateOfBirth">
              Date of Birth <span className="text-red-500">*</span>
            </Label>
            <Input
              id="student.dateOfBirth"
              type="date"
              {...register('student.dateOfBirth')}
              className={`mt-1 ${errors.student?.dateOfBirth ? 'border-red-500' : ''}`}
            />
            {errors.student?.dateOfBirth && (
              <p className="mt-1 text-sm text-red-600">
                {errors.student.dateOfBirth.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="student.nationality">
              Nationality <span className="text-red-500">*</span>
            </Label>
            <Select
              value={watchedNationality}
              onValueChange={(value) => {
                setValue('student.nationality', value);
                trigger('student.nationality');
              }}
            >
              <SelectTrigger className={`mt-1 ${errors.student?.nationality ? 'border-red-500' : ''}`}>
                <SelectValue placeholder="Select nationality" />
              </SelectTrigger>
              <SelectContent>
                {nationalities.map((nationality) => (
                  <SelectItem key={nationality} value={nationality}>
                    {nationality}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.student?.nationality && (
              <p className="mt-1 text-sm text-red-600">
                {errors.student.nationality.message}
              </p>
            )}
          </div>
        </div>

        <div>
          <Label>
            Gender <span className="text-red-500">*</span>
          </Label>
          <RadioGroup
            value={watchedGender}
            onValueChange={(value) => {
              setValue('student.gender', value as 'male' | 'female');
              trigger('student.gender');
            }}
            className="mt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="male" id="male" />
              <Label htmlFor="male">Male</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="female" id="female" />
              <Label htmlFor="female">Female</Label>
            </div>
          </RadioGroup>
          {errors.student?.gender && (
            <p className="mt-1 text-sm text-red-600">
              {errors.student.gender.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="student.nationalId">National ID (Optional)</Label>
          <Input
            id="student.nationalId"
            {...register('student.nationalId')}
            placeholder="Enter 10-digit national ID"
            className={`mt-1 ${errors.student?.nationalId ? 'border-red-500' : ''}`}
          />
          {errors.student?.nationalId && (
            <p className="mt-1 text-sm text-red-600">
              {errors.student.nationalId.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="student.requestedGrade">
            Requested Grade <span className="text-red-500">*</span>
          </Label>
          <Select
            value={watchedRequestedGrade}
            onValueChange={(value) => {
              setValue('student.requestedGrade', value);
              trigger('student.requestedGrade');
            }}
          >
            <SelectTrigger className={`mt-1 ${errors.student?.requestedGrade ? 'border-red-500' : ''}`}>
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
          {errors.student?.requestedGrade && (
            <p className="mt-1 text-sm text-red-600">
              {errors.student.requestedGrade.message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
