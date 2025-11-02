import { useState } from 'react';
import type { TeacherStudent } from '../../types/teacher';

interface LearningProfileProps {
  data: Partial<TeacherStudent>;
  onNext: (data: Partial<TeacherStudent>) => void;
  onBack: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}

const DISABILITIES = [
  'Autism Spectrum Disorder',
  'ADHD',
  'Dyslexia',
  'Dysgraphia',
  'Dyscalculia',
  'Intellectual Disability',
  'Emotional Disturbance',
  'Speech/Language Impairment',
  'Visual Impairment',
  'Hearing Impairment',
  'Physical Disability',
  'Multiple Disabilities',
  'Other'
];

const LEARNING_STRENGTHS = [
  'Visual Learning',
  'Auditory Learning',
  'Kinesthetic Learning',
  'Reading/Writing'
];

const SUBJECTS = [
  'Math',
  'Reading',
  'Writing',
  'Science',
  'Social Studies',
  'Art',
  'Music',
  'Physical Education'
];

export function LearningProfile({ data, onNext, onBack }: LearningProfileProps) {
  const [hasIEP, setHasIEP] = useState(data.hasIEP || false);
  const [iepFile, setIepFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parsedData, setParsedData] = useState<{
    goals: string[];
    accommodations: string[];
  } | null>(null);
  
  const [formData, setFormData] = useState({
    disabilities: data.disabilities || [],
    learningStrengths: data.learningStrengths || [],
    subjectStrengths: data.subjectStrengths || [],
    challengeAreas: data.challengeAreas || [],
    notes: data.notes || '',
  });

  const handleIEPFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIepFile(file);
      setIsParsing(true);
      
      // Simulate IEP document parsing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock parsed data
      setParsedData({
        goals: [
          'Improve reading comprehension to grade level',
          'Increase math problem-solving skills',
          'Develop social interaction abilities'
        ],
        accommodations: [
          'Extended time on tests',
          'Preferential seating',
          'Audio books',
          'Reduced distractions'
        ]
      });
      
      setIsParsing(false);
    }
  };

  const toggleArrayItem = (array: string[], item: string) => {
    if (array.includes(item)) {
      return array.filter(i => i !== item);
    } else {
      return [...array, item];
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onNext({
      hasIEP,
      iepDocument: iepFile || undefined,
      iepGoals: parsedData?.goals.map((goal, idx) => ({
        id: `goal-${idx}`,
        description: goal,
        category: 'Academic',
        targetDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
        progress: 0,
        status: 'active' as const,
        brainAdaptations: 0,
        practiceSessions: 0,
      })),
      iepAccommodations: parsedData?.accommodations,
      disabilities: formData.disabilities,
      learningStrengths: formData.learningStrengths,
      subjectStrengths: formData.subjectStrengths,
      challengeAreas: formData.challengeAreas,
      notes: formData.notes.trim() || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Learning Profile & Special Needs</h2>
        <p className="text-gray-600">Help us understand how this student learns best</p>
      </div>

      {/* IEP Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={hasIEP}
            onChange={(e) => setHasIEP(e.target.checked)}
            className="w-5 h-5 text-blue-600"
          />
          <span className="ml-3 text-lg font-medium text-gray-900">
            Student has an IEP (Individualized Education Program)
          </span>
        </label>

        {hasIEP && (
          <div className="mt-4 space-y-4">
            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload IEP Document <span className="text-gray-400">(Optional)</span>
              </label>
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <span className="text-4xl mb-2">📄</span>
                    <p className="text-sm text-gray-600">
                      {iepFile ? iepFile.name : 'Click to upload IEP document'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">PDF, DOC, or DOCX</p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.doc,.docx"
                    onChange={handleIEPFileChange}
                  />
                </label>
              </div>
            </div>

            {/* Parsing Progress */}
            {isParsing && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full mr-3"></div>
                  <p className="text-blue-900">Analyzing IEP document...</p>
                </div>
              </div>
            )}

            {/* Parsed Data */}
            {parsedData && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-4">
                <h4 className="font-semibold text-green-900 flex items-center">
                  <span className="mr-2">✅</span>
                  Extracted IEP Information
                </h4>
                
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-2">IEP Goals:</h5>
                  <ul className="space-y-1">
                    {parsedData.goals.map((goal, idx) => (
                      <li key={idx} className="text-sm text-gray-600 flex items-start">
                        <span className="mr-2">•</span>
                        <span>{goal}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Accommodations:</h5>
                  <div className="flex flex-wrap gap-2">
                    {parsedData.accommodations.map((acc, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-white border border-green-300 rounded-full text-sm text-gray-700"
                      >
                        {acc}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Disability Categories */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Primary Disability Categories
              </label>
              <div className="grid grid-cols-2 gap-3">
                {DISABILITIES.map((disability) => (
                  <label key={disability} className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.disabilities.includes(disability)}
                      onChange={() =>
                        setFormData({
                          ...formData,
                          disabilities: toggleArrayItem(formData.disabilities, disability),
                        })
                      }
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">{disability}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Learning Preferences */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-4">
        <h4 className="font-medium text-gray-900">
          Learning Preferences <span className="text-gray-400 text-sm">(Optional)</span>
        </h4>

        {/* Learning Strengths */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Learning Strengths
          </label>
          <div className="grid grid-cols-2 gap-3">
            {LEARNING_STRENGTHS.map((strength) => (
              <label key={strength} className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.learningStrengths.includes(strength)}
                  onChange={() =>
                    setFormData({
                      ...formData,
                      learningStrengths: toggleArrayItem(formData.learningStrengths, strength),
                    })
                  }
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">{strength}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Subject Strengths */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Subject Strengths
          </label>
          <div className="grid grid-cols-4 gap-2">
            {SUBJECTS.map((subject) => (
              <label key={subject} className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.subjectStrengths.includes(subject)}
                  onChange={() =>
                    setFormData({
                      ...formData,
                      subjectStrengths: toggleArrayItem(formData.subjectStrengths, subject),
                    })
                  }
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">{subject}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Challenge Areas */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Challenge Areas
          </label>
          <div className="grid grid-cols-4 gap-2">
            {SUBJECTS.map((subject) => (
              <label key={subject} className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.challengeAreas.includes(subject)}
                  onChange={() =>
                    setFormData({
                      ...formData,
                      challengeAreas: toggleArrayItem(formData.challengeAreas, subject),
                    })
                  }
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">{subject}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Additional Notes */}
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
            Additional Notes
          </label>
          <textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Any specific considerations, preferences, or additional information..."
          />
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
          className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Next: Privacy & Consent →
        </button>
      </div>
    </form>
  );
}
