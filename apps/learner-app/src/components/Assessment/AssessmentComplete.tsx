import React, { useState } from 'react';
import type { AssessmentContext } from '../../pages/BaselineAssessment';
import { VirtualBrainCreationProgress } from '@aivo/ui';

interface StudentInfo {
  id: string;
  firstName: string;
  lastName: string;
  gradeLevel: string;
}

interface AssessmentCompleteProps {
  student: StudentInfo;
  results: any;
  context: AssessmentContext;
  onReturn: () => void;
}

export const AssessmentComplete: React.FC<AssessmentCompleteProps> = ({
  student,
  results,
  context,
  onReturn
}) => {
  const [showBrainCreation, setShowBrainCreation] = useState(false);
  const getContextMessage = () => {
    switch (context) {
      case 'teacher-onboarding':
        return {
          icon: '🧠',
          title: 'Virtual Brain Creation Started!',
          message: `${student.firstName}'s Virtual Brain is now being created based on the assessment results. This process takes a few minutes.`,
          nextSteps: [
            'Virtual Brain will analyze learning patterns',
            'Content will be personalized to their needs',
            'You\'ll be able to monitor progress in real-time'
          ]
        };
      case 'parent-purchase':
        return {
          icon: '🎉',
          title: 'Assessment Complete!',
          message: `Great job, ${student.firstName}! Your personalized learning experience is being set up.`,
          nextSteps: [
            'Virtual Brain is being created',
            'Content is being adapted to learning style',
            'You\'ll receive an email when setup is complete'
          ]
        };
      default:
        return {
          icon: '✅',
          title: 'Assessment Complete!',
          message: `${student.firstName} has completed the baseline assessment.`,
          nextSteps: [
            'Results are being processed',
            'Personalization updates in progress',
            'Check back soon for detailed insights'
          ]
        };
    }
  };

  const contextInfo = getContextMessage();
  const { totalQuestions = 0, duration = 0 } = results;

  const handleStartBrainCreation = () => {
    setShowBrainCreation(true);
  };

  const handleBrainCreationComplete = (brainId: string) => {
    console.log('Virtual Brain created:', brainId);
    // Wait a moment then return to original dashboard
    setTimeout(() => {
      onReturn();
    }, 2000);
  };

  // Show Virtual Brain Creation Progress
  if (showBrainCreation) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white flex items-center justify-center py-8">
        <VirtualBrainCreationProgress
          student={student}
          assessmentResults={results}
          context={context === 'standalone' || context === 'follow-up' ? 'manual' : context}
          onComplete={handleBrainCreationComplete}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center py-8">
      <div className="max-w-2xl w-full mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 text-center">
          {/* Success Icon */}
          <div className="text-8xl mb-6">{contextInfo.icon}</div>
          
          {/* Title */}
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {contextInfo.title}
          </h1>
          
          {/* Message */}
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            {contextInfo.message}
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-6 mb-8 p-6 bg-gray-50 rounded-lg">
            <div>
              <p className="text-3xl font-bold text-indigo-600 mb-1">
                {totalQuestions}
              </p>
              <p className="text-sm text-gray-600">Questions Completed</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-indigo-600 mb-1">
                {duration} min
              </p>
              <p className="text-sm text-gray-600">Time Taken</p>
            </div>
          </div>

          {/* Next Steps */}
          <div className="text-left mb-8 p-6 bg-indigo-50 border border-indigo-200 rounded-lg">
            <h3 className="font-semibold text-indigo-900 mb-3">What's Next:</h3>
            <ul className="space-y-2">
              {contextInfo.nextSteps.map((step, idx) => (
                <li key={idx} className="flex items-start text-indigo-800">
                  <span className="text-indigo-500 mr-2 mt-0.5">✓</span>
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Processing Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-center gap-3 text-gray-600 mb-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
              <span className="font-medium">Creating Virtual Brain...</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-indigo-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }} />
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={handleStartBrainCreation}
            className="w-full md:w-auto px-8 py-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold text-lg transition-colors"
          >
            Create Virtual Brain →
          </button>

          {/* Footer Note */}
          <p className="mt-6 text-sm text-gray-500">
            You'll receive real-time updates as the Virtual Brain is created.
            This typically takes 2-3 minutes.
          </p>
        </div>
      </div>
    </div>
  );
};
