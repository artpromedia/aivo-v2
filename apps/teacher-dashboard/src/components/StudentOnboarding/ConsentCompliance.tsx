import { useState } from 'react';
import type { TeacherStudent } from '../../types/teacher';

interface ConsentComplianceProps {
  data: Partial<TeacherStudent>;
  onNext: (data: Partial<TeacherStudent>) => void;
  onBack: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}

export function ConsentCompliance({ data, onNext, onBack }: ConsentComplianceProps) {
  const [consents, setConsents] = useState({
    parentConsent: data.parentConsentObtained || false,
    ferpaCompliance: data.ferpaCompliant || false,
    districtApproval: data.districtApproved || false,
    dataSharing: data.dataSharing || false,
    anonymousData: data.anonymousData || false,
  });

  const [notificationTiming, setNotificationTiming] = useState<'now' | 'after' | 'manual'>(
    data.parentNotificationTiming || 'now'
  );

  const [parentInfo, setParentInfo] = useState({
    name: data.parentName || '',
    email: data.parentEmail || '',
    phone: data.parentPhone || '',
    relationship: data.parentRelationship || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleConsentChange = (field: keyof typeof consents) => {
    setConsents({ ...consents, [field]: !consents[field] });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    // Required consents
    if (!consents.parentConsent) {
      newErrors.parentConsent = 'Parental consent confirmation is required (COPPA compliance)';
    }
    if (!consents.ferpaCompliance) {
      newErrors.ferpaCompliance = 'FERPA compliance confirmation is required';
    }
    if (!consents.districtApproval) {
      newErrors.districtApproval = 'District approval confirmation is required';
    }

    // Parent notification validation
    if (notificationTiming === 'now') {
      if (!parentInfo.name.trim()) {
        newErrors.parentName = 'Parent name is required';
      }
      if (!parentInfo.email.trim()) {
        newErrors.parentEmail = 'Parent email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(parentInfo.email)) {
        newErrors.parentEmail = 'Please enter a valid email address';
      }
      if (!parentInfo.relationship) {
        newErrors.parentRelationship = 'Relationship is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validate()) {
      onNext({
        parentConsentObtained: consents.parentConsent,
        ferpaCompliant: consents.ferpaCompliance,
        districtApproved: consents.districtApproval,
        dataSharing: consents.dataSharing,
        anonymousData: consents.anonymousData,
        parentNotificationTiming: notificationTiming,
        parentName: notificationTiming === 'now' ? parentInfo.name.trim() : undefined,
        parentEmail: notificationTiming === 'now' ? parentInfo.email.trim() : undefined,
        parentPhone: notificationTiming === 'now' ? parentInfo.phone.trim() : undefined,
        parentRelationship: notificationTiming === 'now' ? (parentInfo.relationship as 'Mother' | 'Father' | 'Guardian') : undefined,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Privacy & Compliance</h2>
        <p className="text-gray-600">Ensure all required consents and approvals are in place</p>
      </div>

      {/* Info Alert */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <span className="text-2xl mr-3">ℹ️</span>
          <div>
            <h4 className="font-semibold text-blue-900 mb-1">
              Required for Student Account Creation
            </h4>
            <p className="text-sm text-blue-800">
              As a teacher, you're acting on behalf of the district with parental consent
            </p>
          </div>
        </div>
      </div>

      {/* Required Consents */}
      <div className="space-y-4">
        <h3 className="font-semibold text-gray-900">Required Consents</h3>
        
        <div className={`border rounded-lg p-4 ${errors.parentConsent ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}>
          <label className="flex items-start cursor-pointer">
            <input
              type="checkbox"
              checked={consents.parentConsent}
              onChange={() => handleConsentChange('parentConsent')}
              className="mt-1 w-5 h-5 text-blue-600"
            />
            <div className="ml-3">
              <span className="font-medium text-gray-900">
                Parental consent has been obtained (COPPA)
                <span className="text-red-500 ml-1">*</span>
              </span>
              <p className="text-sm text-gray-600 mt-1">
                Required for students under 13 years old per Children's Online Privacy Protection Act
              </p>
            </div>
          </label>
          {errors.parentConsent && (
            <p className="mt-2 text-sm text-red-500">{errors.parentConsent}</p>
          )}
        </div>

        <div className={`border rounded-lg p-4 ${errors.ferpaCompliance ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}>
          <label className="flex items-start cursor-pointer">
            <input
              type="checkbox"
              checked={consents.ferpaCompliance}
              onChange={() => handleConsentChange('ferpaCompliance')}
              className="mt-1 w-5 h-5 text-blue-600"
            />
            <div className="ml-3">
              <span className="font-medium text-gray-900">
                FERPA compliance confirmed for educational records
                <span className="text-red-500 ml-1">*</span>
              </span>
              <p className="text-sm text-gray-600 mt-1">
                Confirms Family Educational Rights and Privacy Act requirements are met
              </p>
            </div>
          </label>
          {errors.ferpaCompliance && (
            <p className="mt-2 text-sm text-red-500">{errors.ferpaCompliance}</p>
          )}
        </div>

        <div className={`border rounded-lg p-4 ${errors.districtApproval ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}>
          <label className="flex items-start cursor-pointer">
            <input
              type="checkbox"
              checked={consents.districtApproval}
              onChange={() => handleConsentChange('districtApproval')}
              className="mt-1 w-5 h-5 text-blue-600"
            />
            <div className="ml-3">
              <span className="font-medium text-gray-900">
                District has approved AI-assisted learning for this student
                <span className="text-red-500 ml-1">*</span>
              </span>
              <p className="text-sm text-gray-600 mt-1">
                Confirms district policy allows use of AI educational tools
              </p>
            </div>
          </label>
          {errors.districtApproval && (
            <p className="mt-2 text-sm text-red-500">{errors.districtApproval}</p>
          )}
        </div>
      </div>

      {/* Optional Consents */}
      <div className="space-y-4">
        <h3 className="font-semibold text-gray-900">Optional Permissions</h3>
        
        <label className="flex items-start cursor-pointer border border-gray-200 rounded-lg p-4">
          <input
            type="checkbox"
            checked={consents.dataSharing}
            onChange={() => handleConsentChange('dataSharing')}
            className="mt-1 w-5 h-5 text-blue-600"
          />
          <div className="ml-3">
            <span className="font-medium text-gray-900">
              Parent has consented to progress data sharing
            </span>
            <p className="text-sm text-gray-600 mt-1">
              Allows parent to view detailed learning analytics and progress reports
            </p>
          </div>
        </label>

        <label className="flex items-start cursor-pointer border border-gray-200 rounded-lg p-4">
          <input
            type="checkbox"
            checked={consents.anonymousData}
            onChange={() => handleConsentChange('anonymousData')}
            className="mt-1 w-5 h-5 text-blue-600"
          />
          <div className="ml-3">
            <span className="font-medium text-gray-900">
              Anonymous data can be used for platform improvement
            </span>
            <p className="text-sm text-gray-600 mt-1">
              De-identified data helps improve AI learning models for all students
            </p>
          </div>
        </label>
      </div>

      {/* Parent Notification */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-4">
        <h4 className="font-semibold text-gray-900">Parent/Guardian Notification</h4>
        
        <div className="space-y-2">
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="notification"
              value="now"
              checked={notificationTiming === 'now'}
              onChange={(e) => setNotificationTiming(e.target.value as 'now')}
              className="w-4 h-4 text-blue-600"
            />
            <span className="ml-2 text-gray-700">Send parent invitation now</span>
          </label>

          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="notification"
              value="after"
              checked={notificationTiming === 'after'}
              onChange={(e) => setNotificationTiming(e.target.value as 'after')}
              className="w-4 h-4 text-blue-600"
            />
            <span className="ml-2 text-gray-700">Send after assessment completion</span>
          </label>

          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="notification"
              value="manual"
              checked={notificationTiming === 'manual'}
              onChange={(e) => setNotificationTiming(e.target.value as 'manual')}
              className="w-4 h-4 text-blue-600"
            />
            <span className="ml-2 text-gray-700">I will notify parent manually</span>
          </label>
        </div>

        {/* Parent Contact Form */}
        {notificationTiming === 'now' && (
          <div className="mt-4 space-y-4 bg-white border border-gray-300 rounded-lg p-4">
            <h5 className="font-medium text-gray-900">Parent Contact Information</h5>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="parentName" className="block text-sm font-medium text-gray-700 mb-1">
                  Parent Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="parentName"
                  value={parentInfo.name}
                  onChange={(e) => setParentInfo({ ...parentInfo, name: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg ${
                    errors.parentName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Full name"
                />
                {errors.parentName && (
                  <p className="mt-1 text-sm text-red-500">{errors.parentName}</p>
                )}
              </div>

              <div>
                <label htmlFor="parentEmail" className="block text-sm font-medium text-gray-700 mb-1">
                  Parent Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="parentEmail"
                  value={parentInfo.email}
                  onChange={(e) => setParentInfo({ ...parentInfo, email: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg ${
                    errors.parentEmail ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="email@example.com"
                />
                {errors.parentEmail && (
                  <p className="mt-1 text-sm text-red-500">{errors.parentEmail}</p>
                )}
              </div>

              <div>
                <label htmlFor="parentPhone" className="block text-sm font-medium text-gray-700 mb-1">
                  Parent Phone <span className="text-gray-400 text-xs">(Optional)</span>
                </label>
                <input
                  type="tel"
                  id="parentPhone"
                  value={parentInfo.phone}
                  onChange={(e) => setParentInfo({ ...parentInfo, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="(555) 123-4567"
                />
              </div>

              <div>
                <label htmlFor="relationship" className="block text-sm font-medium text-gray-700 mb-1">
                  Relationship <span className="text-red-500">*</span>
                </label>
                <select
                  id="relationship"
                  value={parentInfo.relationship}
                  onChange={(e) => setParentInfo({ ...parentInfo, relationship: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg ${
                    errors.parentRelationship ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select relationship</option>
                  <option value="Mother">Mother</option>
                  <option value="Father">Father</option>
                  <option value="Guardian">Guardian</option>
                </select>
                {errors.parentRelationship && (
                  <p className="mt-1 text-sm text-red-500">{errors.parentRelationship}</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-6 border-t">
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300"
        >
          ← Back
        </button>
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Next: License Assignment →
        </button>
      </div>
    </form>
  );
}
