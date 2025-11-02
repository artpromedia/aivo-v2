import { useState } from 'react';
import type { TeacherStudent } from '../../types/teacher';

interface LicenseAllocationProps {
  data: Partial<TeacherStudent>;
  onNext: (data: Partial<TeacherStudent>) => void;
  onBack: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}

// Mock available licenses - in production, this would come from API
const getAvailableDistrictLicenses = () => 15;

export function LicenseAllocation({ data, onNext, onBack, isLastStep }: LicenseAllocationProps) {
  const [licenseType, setLicenseType] = useState<'district' | 'parent' | 'trial'>(
    data.licenseType || 'district'
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const availableLicenses = getAvailableDistrictLicenses();

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!licenseType) {
      newErrors.licenseType = 'Please select a license type';
    }

    if (licenseType === 'district' && availableLicenses === 0) {
      newErrors.licenseType = 'No district licenses available. Please choose another option.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validate()) {
      onNext({
        licenseType,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">License Assignment</h2>
        <p className="text-gray-600">Choose how this student's access will be licensed</p>
      </div>

      {/* License Options */}
      <div className="space-y-4">
        {/* District License */}
        <div
          onClick={() => availableLicenses > 0 && setLicenseType('district')}
          className={`border-2 rounded-lg p-6 cursor-pointer transition-all ${
            licenseType === 'district'
              ? 'border-blue-500 bg-blue-50'
              : availableLicenses > 0
              ? 'border-gray-300 hover:border-blue-300'
              : 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60'
          }`}
        >
          <div className="flex items-start">
            <input
              type="radio"
              name="license"
              value="district"
              checked={licenseType === 'district'}
              onChange={() => setLicenseType('district')}
              disabled={availableLicenses === 0}
              className="mt-1 w-5 h-5 text-blue-600"
            />
            <div className="ml-4 flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg text-gray-900">Use District License</h3>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  availableLicenses > 0
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {availableLicenses} available
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Use one of your district's pre-purchased licenses. This option provides immediate access
                and is billed to the district account.
              </p>
              <div className="mt-3 flex items-center text-sm text-gray-700">
                <span className="mr-4">✓ Immediate activation</span>
                <span className="mr-4">✓ Full features</span>
                <span>✓ District billing</span>
              </div>
            </div>
          </div>
        </div>

        {/* Parent Purchase */}
        <div
          onClick={() => setLicenseType('parent')}
          className={`border-2 rounded-lg p-6 cursor-pointer transition-all ${
            licenseType === 'parent'
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-blue-300'
          }`}
        >
          <div className="flex items-start">
            <input
              type="radio"
              name="license"
              value="parent"
              checked={licenseType === 'parent'}
              onChange={() => setLicenseType('parent')}
              className="mt-1 w-5 h-5 text-blue-600"
            />
            <div className="ml-4 flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg text-gray-900">Parent Will Purchase</h3>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  Recommended
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Parent will be offered a discounted education rate. Student account will be created but
                access will be limited until parent completes purchase.
              </p>
              <div className="mt-3 flex items-center text-sm text-gray-700">
                <span className="mr-4">✓ Discounted rate</span>
                <span className="mr-4">✓ Parent billing</span>
                <span>✓ Optional upgrade path</span>
              </div>
              <div className="mt-3 bg-white border border-blue-200 rounded p-3">
                <p className="text-sm text-blue-900">
                  <strong>Parent Rate:</strong> $9.99/month or $99/year (20% education discount)
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Trial License */}
        <div
          onClick={() => setLicenseType('trial')}
          className={`border-2 rounded-lg p-6 cursor-pointer transition-all ${
            licenseType === 'trial'
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-blue-300'
          }`}
        >
          <div className="flex items-start">
            <input
              type="radio"
              name="license"
              value="trial"
              checked={licenseType === 'trial'}
              onChange={() => setLicenseType('trial')}
              className="mt-1 w-5 h-5 text-blue-600"
            />
            <div className="ml-4 flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg text-gray-900">14-Day Trial</h3>
                <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                  Free Trial
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Start with a 14-day free trial. Full access to all features. Automatically converts to
                paid subscription (parent-billed) after trial ends unless cancelled.
              </p>
              <div className="mt-3 flex items-center text-sm text-gray-700">
                <span className="mr-4">✓ 14 days free</span>
                <span className="mr-4">✓ Full features</span>
                <span>✓ Auto-converts</span>
              </div>
              <div className="mt-3 bg-white border border-purple-200 rounded p-3">
                <p className="text-sm text-purple-900">
                  <strong>Trial Period:</strong> 14 days from account creation<br />
                  <strong>After Trial:</strong> $9.99/month (parent will be notified before charging)
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {errors.licenseType && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{errors.licenseType}</p>
        </div>
      )}

      {/* Summary Box */}
      <div className="bg-gray-100 border border-gray-300 rounded-lg p-6">
        <h4 className="font-semibold text-gray-900 mb-3">Selected License Summary</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">License Type:</span>
            <span className="font-medium text-gray-900">
              {licenseType === 'district' && 'District License'}
              {licenseType === 'parent' && 'Parent Purchase'}
              {licenseType === 'trial' && '14-Day Free Trial'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Activation:</span>
            <span className="font-medium text-gray-900">
              {licenseType === 'district' && 'Immediate'}
              {licenseType === 'parent' && 'After parent purchase'}
              {licenseType === 'trial' && 'Immediate (14 days)'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Billing:</span>
            <span className="font-medium text-gray-900">
              {licenseType === 'district' && 'District account'}
              {licenseType === 'parent' && 'Parent ($9.99/month)'}
              {licenseType === 'trial' && 'Free, then parent ($9.99/month)'}
            </span>
          </div>
        </div>
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
          className="px-8 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center"
        >
          {isLastStep ? 'Proceed to Baseline Assessment' : 'Next'} →
        </button>
      </div>
    </form>
  );
}
