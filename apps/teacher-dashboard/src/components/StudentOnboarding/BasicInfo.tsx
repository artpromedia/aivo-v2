import { useState } from 'react';
import type { TeacherStudent } from '../../types/teacher';

interface BasicInfoProps {
  data: Partial<TeacherStudent>;
  onNext: (data: Partial<TeacherStudent>) => void;
  onBack: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}

const GRADES = ['K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', 'College'];

export function BasicInfo({ data, onNext, onBack, isFirstStep }: BasicInfoProps) {
  const [formData, setFormData] = useState({
    firstName: data.firstName || '',
    lastName: data.lastName || '',
    dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth).toISOString().split('T')[0] : '',
    grade: data.grade || '',
    studentId: data.studentId || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    } else {
      const dob = new Date(formData.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - dob.getFullYear();
      if (age < 3 || age > 25) {
        newErrors.dateOfBirth = 'Please enter a valid date of birth (age 3-25)';
      }
    }

    if (!formData.grade) {
      newErrors.grade = 'Grade level is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validate()) {
      const dob = new Date(formData.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - dob.getFullYear();
      
      onNext({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        fullName: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
        initials: `${formData.firstName[0]}${formData.lastName[0]}`.toUpperCase(),
        dateOfBirth: dob,
        age,
        grade: formData.grade,
        studentId: formData.studentId.trim() || undefined,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Add New Student</h2>
        <p className="text-gray-600">Enter the student's basic information to begin</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* First Name */}
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
            First Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="firstName"
            value={formData.firstName}
            onChange={(e) => handleChange('firstName', e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.firstName ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter first name"
          />
          {errors.firstName && (
            <p className="mt-1 text-sm text-red-500">{errors.firstName}</p>
          )}
        </div>

        {/* Last Name */}
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
            Last Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="lastName"
            value={formData.lastName}
            onChange={(e) => handleChange('lastName', e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.lastName ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter last name"
          />
          {errors.lastName && (
            <p className="mt-1 text-sm text-red-500">{errors.lastName}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Date of Birth */}
        <div>
          <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-2">
            Date of Birth <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            id="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={(e) => handleChange('dateOfBirth', e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.dateOfBirth ? 'border-red-500' : 'border-gray-300'
            }`}
            max={new Date().toISOString().split('T')[0]}
          />
          {errors.dateOfBirth && (
            <p className="mt-1 text-sm text-red-500">{errors.dateOfBirth}</p>
          )}
        </div>

        {/* Grade Level */}
        <div>
          <label htmlFor="grade" className="block text-sm font-medium text-gray-700 mb-2">
            Grade Level <span className="text-red-500">*</span>
          </label>
          <select
            id="grade"
            value={formData.grade}
            onChange={(e) => handleChange('grade', e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.grade ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Select grade level</option>
            {GRADES.map((grade) => (
              <option key={grade} value={grade}>
                {grade === 'K' ? 'Kindergarten' : `Grade ${grade}`}
              </option>
            ))}
          </select>
          {errors.grade && (
            <p className="mt-1 text-sm text-red-500">{errors.grade}</p>
          )}
        </div>
      </div>

      {/* Student ID (Optional) */}
      <div>
        <label htmlFor="studentId" className="block text-sm font-medium text-gray-700 mb-2">
          Student ID <span className="text-gray-400 text-xs">(Optional)</span>
        </label>
        <input
          type="text"
          id="studentId"
          value={formData.studentId}
          onChange={(e) => handleChange('studentId', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="District student ID"
        />
        <p className="mt-1 text-sm text-gray-500">
          Enter the district-assigned student ID if available
        </p>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-6 border-t">
        <button
          type="button"
          onClick={onBack}
          disabled={isFirstStep}
          className={`px-6 py-2 rounded-lg font-medium ${
            isFirstStep
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          ← Back
        </button>
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Next: District & Curriculum →
        </button>
      </div>
    </form>
  );
}
