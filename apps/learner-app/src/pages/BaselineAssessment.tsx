import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { AssessmentModeSelector } from '../components/Assessment/AssessmentModeSelector';
import { StudentIndependentMode } from '../components/Assessment/StudentIndependentMode';
import { TeacherAssistedMode } from '../components/Assessment/TeacherAssistedMode';
import { RemoteParentMode } from '../components/Assessment/RemoteParentMode';
import { AssessmentComplete } from '../components/Assessment/AssessmentComplete';

export type AdministrationMode = 'student-independent' | 'teacher-assisted' | 'remote-parent';
export type AssessmentContext = 'teacher-onboarding' | 'parent-purchase' | 'standalone' | 'follow-up';

interface StudentInfo {
  id: string;
  firstName: string;
  lastName: string;
  gradeLevel: string;
  disabilities?: string[];
  iepGoals?: any[];
}

interface AssessmentSession {
  sessionId: string;
  studentId: string;
  mode: AdministrationMode;
  context: AssessmentContext;
  startTime: Date;
  questionsAnswered: number;
  currentDomain: string;
  progress: number;
}

export const BaselineAssessment: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Parse URL parameters
  const studentId = searchParams.get('studentId');
  const sessionToken = searchParams.get('token');
  const context = (searchParams.get('context') || 'standalone') as AssessmentContext;
  const returnUrl = searchParams.get('returnUrl');
  
  // State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [student, setStudent] = useState<StudentInfo | null>(null);
  const [mode, setMode] = useState<AdministrationMode | null>(null);
  const [session, setSession] = useState<AssessmentSession | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [results, setResults] = useState<any>(null);

  // Load student info and validate session
  useEffect(() => {
    const initializeAssessment = async () => {
      try {
        if (!studentId || !sessionToken) {
          setError('Missing required parameters. Please check your assessment link.');
          setLoading(false);
          return;
        }

        // TODO: Replace with actual API call
        // const response = await fetch(`/api/assessment/session/${sessionToken}`);
        // const data = await response.json();
        
        // Mock student data for now
        const mockStudent: StudentInfo = {
          id: studentId,
          firstName: 'Emma',
          lastName: 'Johnson',
          gradeLevel: '3rd Grade',
          disabilities: ['Dyslexia', 'ADHD'],
          iepGoals: []
        };

        setStudent(mockStudent);
        setLoading(false);
      } catch (err) {
        setError('Failed to load assessment session. Please try again.');
        setLoading(false);
      }
    };

    initializeAssessment();
  }, [studentId, sessionToken]);

  const handleModeSelect = (selectedMode: AdministrationMode) => {
    setMode(selectedMode);
    
    // Create assessment session
    const newSession: AssessmentSession = {
      sessionId: sessionToken || '',
      studentId: studentId || '',
      mode: selectedMode,
      context,
      startTime: new Date(),
      questionsAnswered: 0,
      currentDomain: 'reading',
      progress: 0
    };
    
    setSession(newSession);
  };

  const handleAssessmentComplete = (assessmentResults: any) => {
    setResults(assessmentResults);
    setIsComplete(true);
    
    // TODO: Submit results to API
    // await fetch('/api/assessment/complete', {
    //   method: 'POST',
    //   body: JSON.stringify({
    //     sessionId: session?.sessionId,
    //     results: assessmentResults
    //   })
    // });
  };

  const handleReturnToDashboard = () => {
    if (returnUrl) {
      window.location.href = returnUrl;
    } else {
      // Default return based on context
      switch (context) {
        case 'teacher-onboarding':
          window.location.href = '/teacher-dashboard';
          break;
        case 'parent-purchase':
          window.location.href = '/parent-dashboard';
          break;
        default:
          navigate('/dashboard');
      }
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading assessment...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !student) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Assessment Error</h2>
          <p className="text-gray-600 mb-6">{error || 'Unable to load assessment session.'}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Assessment complete
  if (isComplete && results) {
    return (
      <AssessmentComplete
        student={student}
        results={results}
        context={context}
        onReturn={handleReturnToDashboard}
      />
    );
  }

  // Mode selection
  if (!mode || !session) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Baseline Assessment
              </h1>
              <p className="text-gray-600">
                {student.firstName} {student.lastName} • {student.gradeLevel}
              </p>
              {context === 'teacher-onboarding' && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    👩‍🏫 <strong>Teacher Onboarding:</strong> This assessment will create {student.firstName}'s Virtual Brain
                  </p>
                </div>
              )}
              {context === 'parent-purchase' && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800">
                    🏠 <strong>Parent Setup:</strong> Complete this assessment to activate your license
                  </p>
                </div>
              )}
            </div>

            <AssessmentModeSelector
              studentAge={parseInt(student.gradeLevel) || 8}
              context={context}
              onSelect={handleModeSelect}
            />
          </div>
        </div>
      </div>
    );
  }

  // Assessment in progress
  return (
    <div className="min-h-screen bg-gray-50">
      {mode === 'student-independent' && (
        <StudentIndependentMode
          student={student}
          session={session}
          onComplete={handleAssessmentComplete}
        />
      )}
      {mode === 'teacher-assisted' && (
        <TeacherAssistedMode
          student={student}
          session={session}
          onComplete={handleAssessmentComplete}
        />
      )}
      {mode === 'remote-parent' && (
        <RemoteParentMode
          student={student}
          session={session}
          onComplete={handleAssessmentComplete}
        />
      )}
    </div>
  );
};

export default BaselineAssessment;
