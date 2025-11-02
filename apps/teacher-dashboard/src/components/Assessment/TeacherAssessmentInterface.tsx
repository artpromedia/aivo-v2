import { useState } from 'react';
import type { TeacherStudent, AssessmentQuestion, AssessmentResults } from '../../types/teacher';
import { ModeSelector } from './ModeSelector';
import { TeacherAssistedView } from './TeacherAssistedView';
import { StudentIndependentView } from './StudentIndependentView';
import { RemoteAssessmentView } from './RemoteAssessmentView';

export type AssessmentMode = 'teacher-assisted' | 'student-independent' | 'remote';

interface TeacherAssessmentInterfaceProps {
  student: TeacherStudent;
  onComplete: (results: AssessmentResults) => void;
  onCancel: () => void;
}

export function TeacherAssessmentInterface({ 
  student, 
  onComplete, 
  onCancel 
}: TeacherAssessmentInterfaceProps) {
  const [mode, setMode] = useState<AssessmentMode | null>(null);
  const [assessmentStarted, setAssessmentStarted] = useState(false);

  const handleModeSelect = (selectedMode: AssessmentMode) => {
    setMode(selectedMode);
    setAssessmentStarted(true);
  };

  const handleBack = () => {
    setAssessmentStarted(false);
    setMode(null);
  };

  // Mode selection screen
  if (!assessmentStarted || !mode) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Baseline Assessment: {student.firstName} {student.lastName}
          </h2>
          <p className="text-gray-600">
            Choose how you'd like to administer the assessment
          </p>
        </div>

        <ModeSelector onSelect={handleModeSelect} />

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // Assessment in progress
  return (
    <div className="bg-white rounded-lg shadow-lg">
      {mode === 'teacher-assisted' && (
        <TeacherAssistedView
          student={student}
          onComplete={onComplete}
          onBack={handleBack}
        />
      )}
      {mode === 'student-independent' && (
        <StudentIndependentView
          student={student}
          onComplete={onComplete}
          onBack={handleBack}
        />
      )}
      {mode === 'remote' && (
        <RemoteAssessmentView
          student={student}
          onComplete={onComplete}
          onBack={handleBack}
        />
      )}
    </div>
  );
}
