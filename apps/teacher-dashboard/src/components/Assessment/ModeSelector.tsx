import type { AssessmentMode } from './TeacherAssessmentInterface';

interface ModeSelectorProps {
  onSelect: (mode: AssessmentMode) => void;
}

const MODES = [
  {
    id: 'teacher-assisted' as AssessmentMode,
    icon: '👩‍🏫',
    title: 'Teacher-Assisted',
    description: 'You read questions aloud and record student responses',
    benefits: [
      'Best for younger students or those needing support',
      'Capture behavioral observations in real-time',
      'Provide clarification as needed',
      'Control pacing and breaks'
    ],
    duration: '15-25 minutes'
  },
  {
    id: 'student-independent' as AssessmentMode,
    icon: '🎧',
    title: 'Student Independent',
    description: 'Student completes assessment on device with live monitoring',
    benefits: [
      'Student reads/listens to questions independently',
      'You monitor progress and focus levels remotely',
      'Intervene if student struggles or loses focus',
      'Natural environment reduces anxiety'
    ],
    duration: '20-30 minutes'
  },
  {
    id: 'remote' as AssessmentMode,
    icon: '🏠',
    title: 'Remote (Parent/Caregiver)',
    description: 'Parent or caregiver administers assessment at home',
    benefits: [
      'Convenient for remote learning or home situations',
      'Parent receives guided instructions',
      'You receive results and observations',
      'Can be completed on any schedule'
    ],
    duration: '25-35 minutes'
  }
];

export function ModeSelector({ onSelect }: ModeSelectorProps) {
  return (
    <div className="space-y-4">
      {MODES.map(mode => (
        <button
          key={mode.id}
          onClick={() => onSelect(mode.id)}
          className="w-full text-left border-2 border-gray-300 rounded-lg p-6 hover:border-indigo-500 hover:bg-indigo-50 transition-all"
        >
          <div className="flex items-start gap-4">
            <div className="text-4xl">{mode.icon}</div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-900">{mode.title}</h3>
                <span className="text-sm text-gray-500">⏱️ {mode.duration}</span>
              </div>
              <p className="text-gray-600 mb-3">{mode.description}</p>
              <ul className="space-y-1">
                {mode.benefits.map((benefit, idx) => (
                  <li key={idx} className="text-sm text-gray-700 flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
