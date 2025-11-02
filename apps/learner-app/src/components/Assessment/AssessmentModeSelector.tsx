import React from 'react';
import type { AdministrationMode, AssessmentContext } from '../../pages/BaselineAssessment';

interface AssessmentModeSelectorProps {
  studentAge: number;
  context: AssessmentContext;
  onSelect: (mode: AdministrationMode) => void;
}

const MODES = [
  {
    id: 'student-independent' as AdministrationMode,
    icon: '🎧',
    title: 'Student Independent',
    description: 'Student completes assessment independently on device',
    benefits: [
      'Adaptive difficulty based on responses',
      'Audio support for questions and answers',
      'Natural pace reduces test anxiety',
      'Live progress monitoring available'
    ],
    bestFor: 'Students who can read/listen independently (typically Grade 2+)',
    duration: '20-30 minutes'
  },
  {
    id: 'teacher-assisted' as AdministrationMode,
    icon: '👩‍🏫',
    title: 'Teacher Assisted',
    description: 'Teacher reads questions and records student responses',
    benefits: [
      'Best for younger students or those needing support',
      'Teacher can provide clarification',
      'Capture behavioral observations in real-time',
      'Control pacing and breaks'
    ],
    bestFor: 'K-1 students or those requiring reading support',
    duration: '15-25 minutes'
  },
  {
    id: 'remote-parent' as AdministrationMode,
    icon: '🏠',
    title: 'Remote (Parent/Caregiver)',
    description: 'Parent or caregiver administers at home with guided instructions',
    benefits: [
      'Convenient for remote learning',
      'Comfortable home environment',
      'Flexible scheduling',
      'Step-by-step guidance provided'
    ],
    bestFor: 'Remote situations or parent-led assessments',
    duration: '25-35 minutes'
  }
];

export const AssessmentModeSelector: React.FC<AssessmentModeSelectorProps> = ({
  studentAge,
  context,
  onSelect
}) => {
  // Recommend mode based on student age and context
  const getRecommendedMode = (): AdministrationMode => {
    if (context === 'parent-purchase') return 'remote-parent';
    if (studentAge < 7) return 'teacher-assisted';
    return 'student-independent';
  };

  const recommendedMode = getRecommendedMode();

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Choose Assessment Mode
        </h2>
        <p className="text-gray-600">
          Select how the baseline assessment should be administered
        </p>
      </div>

      {MODES.map(mode => {
        const isRecommended = mode.id === recommendedMode;
        
        return (
          <button
            key={mode.id}
            onClick={() => onSelect(mode.id)}
            className={`w-full text-left border-2 rounded-lg p-6 transition-all hover:shadow-md ${
              isRecommended
                ? 'border-indigo-500 bg-indigo-50'
                : 'border-gray-300 hover:border-indigo-300'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className="text-4xl">{mode.icon}</div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    {mode.title}
                    {isRecommended && (
                      <span className="px-2 py-0.5 bg-indigo-600 text-white text-xs rounded-full">
                        Recommended
                      </span>
                    )}
                  </h3>
                  <span className="text-sm text-gray-500">⏱️ {mode.duration}</span>
                </div>
                <p className="text-gray-700 mb-3">{mode.description}</p>
                
                <div className="space-y-1 mb-3">
                  {mode.benefits.map((benefit, idx) => (
                    <div key={idx} className="text-sm text-gray-600 flex items-start">
                      <span className="text-green-500 mr-2 mt-0.5">✓</span>
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
                
                <div className="text-sm text-gray-500 italic">
                  <strong>Best for:</strong> {mode.bestFor}
                </div>
              </div>
            </div>
          </button>
        );
      })}

      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm text-yellow-800">
          ℹ️ <strong>Note:</strong> The baseline assessment adapts to the student's responses in real-time.
          There are no wrong answers - we're learning how to best support this student's learning journey.
        </p>
      </div>
    </div>
  );
};
