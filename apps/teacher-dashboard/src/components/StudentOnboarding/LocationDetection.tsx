import { useState, useEffect } from 'react';
import type { TeacherStudent, District } from '../../types/teacher';

interface LocationDetectionProps {
  data: Partial<TeacherStudent>;
  onNext: (data: Partial<TeacherStudent>) => void;
  onBack: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}

// Mock district database - in production, this would be an API call
const MOCK_DISTRICTS: Record<string, District> = {
  '10001': {
    id: 'nyc-1',
    name: 'New York City Department of Education',
    state: 'NY',
    curriculum: 'Common Core',
    standards: ['CCSS', 'NGSS'],
    zipCodes: ['10001', '10002', '10003'],
  },
  '90210': {
    id: 'beverly-hills',
    name: 'Beverly Hills Unified School District',
    state: 'CA',
    curriculum: 'California State Standards',
    standards: ['CA-CCSS', 'NGSS'],
    zipCodes: ['90210', '90211', '90212'],
  },
  '60601': {
    id: 'chicago-1',
    name: 'Chicago Public Schools',
    state: 'IL',
    curriculum: 'Illinois Learning Standards',
    standards: ['ILS', 'NGSS'],
    zipCodes: ['60601', '60602', '60603'],
  },
};

const STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

const CURRICULUM_TYPES = [
  'Common Core',
  'State Standards',
  'IB (International Baccalaureate)',
  'Montessori',
  'Waldorf',
  'Classical',
  'Other'
];

export function LocationDetection({ data, onNext, onBack }: LocationDetectionProps) {
  const [zipCode, setZipCode] = useState(data.zipCode || '');
  const [detectedDistrict, setDetectedDistrict] = useState<District | null>(data.district || null);
  const [manualEntry, setManualEntry] = useState(false);
  const [manualData, setManualData] = useState({
    state: data.district?.state || '',
    districtName: data.district?.name || '',
    curriculum: data.district?.curriculum || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDetecting, setIsDetecting] = useState(false);

  useEffect(() => {
    if (zipCode.length === 5 && !manualEntry) {
      detectDistrict(zipCode);
    }
  }, [zipCode, manualEntry]);

  const detectDistrict = async (zip: string) => {
    setIsDetecting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const district = MOCK_DISTRICTS[zip];
    if (district) {
      setDetectedDistrict(district);
      setErrors({});
    } else {
      setDetectedDistrict(null);
      setErrors({ zipCode: 'District not found. Please enter information manually.' });
      setManualEntry(true);
    }
    setIsDetecting(false);
  };

  const handleZipChange = (value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 5);
    setZipCode(cleaned);
    setDetectedDistrict(null);
    if (errors.zipCode) {
      setErrors({ ...errors, zipCode: '' });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!zipCode) {
      newErrors.zipCode = 'ZIP code is required';
    } else if (zipCode.length !== 5) {
      newErrors.zipCode = 'ZIP code must be 5 digits';
    }

    if (manualEntry) {
      if (!manualData.state) {
        newErrors.state = 'State is required';
      }
      if (!manualData.districtName.trim()) {
        newErrors.districtName = 'District name is required';
      }
      if (!manualData.curriculum) {
        newErrors.curriculum = 'Curriculum type is required';
      }
    } else if (!detectedDistrict) {
      newErrors.zipCode = 'Please detect district or enter manually';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validate()) {
      const district: District = manualEntry
        ? {
            id: `manual-${Date.now()}`,
            name: manualData.districtName.trim(),
            state: manualData.state,
            curriculum: manualData.curriculum,
            standards: [],
            zipCodes: [zipCode],
          }
        : detectedDistrict!;

      onNext({
        zipCode,
        district,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">District & Curriculum</h2>
        <p className="text-gray-600">We'll detect the district and curriculum based on location</p>
      </div>

      {/* ZIP Code Input */}
      <div>
        <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-2">
          School ZIP Code <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="zipCode"
          value={zipCode}
          onChange={(e) => handleZipChange(e.target.value)}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors.zipCode ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Enter 5-digit ZIP code"
          maxLength={5}
        />
        {errors.zipCode && (
          <p className="mt-1 text-sm text-red-500">{errors.zipCode}</p>
        )}
        {isDetecting && (
          <p className="mt-1 text-sm text-blue-600">🔍 Detecting district...</p>
        )}
      </div>

      {/* Detected District Info */}
      {detectedDistrict && !manualEntry && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start">
            <span className="text-2xl mr-3">✅</span>
            <div className="flex-1">
              <h4 className="font-semibold text-green-900 mb-2">District Detected!</h4>
              <div className="space-y-1 text-sm text-green-800">
                <p><strong>District:</strong> {detectedDistrict.name}</p>
                <p><strong>State:</strong> {detectedDistrict.state}</p>
                <p><strong>Curriculum:</strong> {detectedDistrict.curriculum}</p>
                <p><strong>Standards:</strong> {detectedDistrict.standards.join(', ')}</p>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <label className="flex items-center text-sm text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={manualEntry}
                onChange={(e) => setManualEntry(e.target.checked)}
                className="mr-2"
              />
              Override district detection (enter manually)
            </label>
          </div>
        </div>
      )}

      {/* Manual Entry Form */}
      {manualEntry && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-4">
          <h4 className="font-semibold text-blue-900">Manual District Entry</h4>
          
          <div>
            <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2">
              State <span className="text-red-500">*</span>
            </label>
            <select
              id="state"
              value={manualData.state}
              onChange={(e) => setManualData({ ...manualData, state: e.target.value })}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.state ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select state</option>
              {STATES.map((state) => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
            {errors.state && (
              <p className="mt-1 text-sm text-red-500">{errors.state}</p>
            )}
          </div>

          <div>
            <label htmlFor="districtName" className="block text-sm font-medium text-gray-700 mb-2">
              District Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="districtName"
              value={manualData.districtName}
              onChange={(e) => setManualData({ ...manualData, districtName: e.target.value })}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.districtName ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter district name"
            />
            {errors.districtName && (
              <p className="mt-1 text-sm text-red-500">{errors.districtName}</p>
            )}
          </div>

          <div>
            <label htmlFor="curriculum" className="block text-sm font-medium text-gray-700 mb-2">
              Curriculum Type <span className="text-red-500">*</span>
            </label>
            <select
              id="curriculum"
              value={manualData.curriculum}
              onChange={(e) => setManualData({ ...manualData, curriculum: e.target.value })}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.curriculum ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select curriculum</option>
              {CURRICULUM_TYPES.map((curr) => (
                <option key={curr} value={curr}>{curr}</option>
              ))}
            </select>
            {errors.curriculum && (
              <p className="mt-1 text-sm text-red-500">{errors.curriculum}</p>
            )}
          </div>
        </div>
      )}

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
          Next: Learning Profile →
        </button>
      </div>
    </form>
  );
}
