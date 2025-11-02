import React, { useState } from 'react';

interface StudentInfo {
  id: string;
  firstName: string;
  lastName: string;
}

interface AssessmentSession {
  sessionId: string;
}

interface RemoteParentModeProps {
  student: StudentInfo;
  session: AssessmentSession;
  onComplete: (results: any) => void;
}

export const RemoteParentMode: React.FC<RemoteParentModeProps> = ({
  student,
  session,
  onComplete
}) => {
  const [step, setStep] = useState<'instructions' | 'assessment' | 'questions'>('instructions');
  const [questionNumber, setQuestionNumber] = useState(1);

  const handleStartAssessment = () => {
    setStep('questions');
  };

  const handleNextQuestion = () => {
    if (questionNumber >= 20) {
      onComplete({ sessionId: session.sessionId, mode: 'remote-parent' });
    } else {
      setQuestionNumber(questionNumber + 1);
    }
  };

  if (step === 'instructions') {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">
              Parent-Led Assessment Guide
            </h1>
            
            <div className="prose prose-lg max-w-none space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <p className="text-green-900 font-semibold mb-2">Welcome, Parent/Caregiver! 👋</p>
                <p className="text-green-800">
                  You're about to help {student.firstName} complete their baseline assessment.
                  This will take about 25-35 minutes. Follow these simple steps for the best results.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-900">Before You Begin:</h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Find a quiet, comfortable space with minimal distractions</li>
                  <li>Have paper and pencil available for any calculations or drawings</li>
                  <li>Make sure {student.firstName} has had a snack and bathroom break</li>
                  <li>Turn off TV, phones, and other devices</li>
                  <li>Plan for 30-40 minutes of uninterrupted time</li>
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-900">During the Assessment:</h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li><strong>Read questions exactly as written</strong> - don't explain or simplify</li>
                  <li><strong>Allow {student.firstName} to answer in their own words</strong></li>
                  <li><strong>Don't indicate if answers are right or wrong</strong></li>
                  <li><strong>Encourage but don't help</strong> - say "Just do your best"</li>
                  <li><strong>Take breaks if needed</strong> - pause between sections</li>
                  <li><strong>Record exactly what they say or do</strong></li>
                </ul>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <p className="text-yellow-900 font-semibold mb-2">Important:</p>
                <p className="text-yellow-800">
                  This assessment helps us understand how {student.firstName} learns best.
                  There are no passing or failing scores. Be encouraging and positive throughout!
                </p>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button
                onClick={handleStartAssessment}
                className="px-8 py-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold text-lg"
              >
                I'm Ready to Begin →
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Assessment for {student.firstName}
            </h1>
            <p className="text-gray-600">Question {questionNumber} of 20</p>
          </div>

          <div className="mb-6 p-6 bg-purple-50 border border-purple-200 rounded-lg">
            <p className="font-semibold text-purple-900 mb-3">📖 Read to {student.firstName}:</p>
            <p className="text-lg text-purple-800 leading-relaxed">
              "What is 2 + 2?"
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {student.firstName}'s Answer
              </label>
              <textarea
                placeholder={`Record ${student.firstName}'s response here...`}
                className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                rows={3}
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                💡 <strong>Tip:</strong> Type exactly what {student.firstName} says or does.
                If they're unsure, that's okay - just note "unsure" or "passed".
              </p>
            </div>
          </div>

          <div className="mt-8 flex justify-between">
            <button className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
              ← Previous
            </button>
            <button
              onClick={handleNextQuestion}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold"
            >
              {questionNumber >= 20 ? 'Complete Assessment' : 'Next Question →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
