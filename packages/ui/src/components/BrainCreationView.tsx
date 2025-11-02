import React from 'react';
import { BrainCreationProgress } from '@aivo/ui';

interface BrainCreationViewProps {
  studentName: string;
  studentId: string;
  assessmentResults?: any;
  onComplete?: () => void;
  onClose?: () => void;
  isModal?: boolean;
}

/**
 * BrainCreationView - Standalone component for displaying Virtual Brain creation progress
 * 
 * Can be used as:
 * 1. Full page after assessment completion
 * 2. Modal overlay when checking creation status
 * 3. Embedded view in teacher/parent dashboards
 * 
 * Works for both teacher and parent contexts
 */
export const BrainCreationView: React.FC<BrainCreationViewProps> = ({
  studentName,
  studentId,
  assessmentResults,
  onComplete,
  onClose,
  isModal = false
}) => {
  const content = (
    <div className={`${isModal ? 'p-6' : 'min-h-screen py-12 px-4'} bg-gradient-to-b from-indigo-50 to-white`}>
      <div className="max-w-5xl mx-auto">
        {isModal && onClose && (
          <div className="flex justify-end mb-4">
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100"
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        
        <BrainCreationProgress
          studentName={studentName}
          assessmentResults={assessmentResults}
          onComplete={onComplete}
          autoProgress={true}
        />
        
        {/* Additional Context for Teachers/Parents */}
        <div className="mt-8 grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="text-2xl">👩‍🏫</span>
              For Teachers
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                <span>Monitor student progress in real-time from your dashboard</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                <span>Receive AI-powered suggestions for interventions</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                <span>Track IEP goal alignment automatically</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                <span>Distribute differentiated content instantly</span>
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="text-2xl">👨‍👩‍👧</span>
              For Parents
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start">
                <span className="text-purple-500 mr-2">•</span>
                <span>View detailed progress reports and insights</span>
              </li>
              <li className="flex items-start">
                <span className="text-purple-500 mr-2">•</span>
                <span>Receive weekly summaries of learning activities</span>
              </li>
              <li className="flex items-start">
                <span className="text-purple-500 mr-2">•</span>
                <span>Get personalized tips for supporting learning at home</span>
              </li>
              <li className="flex items-start">
                <span className="text-purple-500 mr-2">•</span>
                <span>Communicate directly with teachers through the platform</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Technology Info */}
        <div className="mt-6 bg-gray-50 border border-gray-200 rounded-xl p-6">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <span className="text-2xl">🤖</span>
            Powered by Advanced AI
          </h3>
          <p className="text-gray-700 text-sm leading-relaxed">
            {studentName}'s Virtual Brain uses state-of-the-art artificial intelligence to continuously
            adapt to their unique learning needs. The system analyzes thousands of data points including
            assessment results, learning pace, engagement levels, and IEP requirements to provide truly
            personalized instruction that evolves with the student.
          </p>
        </div>
      </div>
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
        <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
          {content}
        </div>
      </div>
    );
  }

  return content;
};
