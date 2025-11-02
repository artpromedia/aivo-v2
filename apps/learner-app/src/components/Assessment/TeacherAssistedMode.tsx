import React, { useState } from 'react';

interface StudentInfo {
  id: string;
  firstName: string;
  lastName: string;
}

interface AssessmentSession {
  sessionId: string;
}

interface TeacherAssistedModeProps {
  student: StudentInfo;
  session: AssessmentSession;
  onComplete: (results: any) => void;
}

export const TeacherAssistedMode: React.FC<TeacherAssistedModeProps> = ({
  student,
  session,
  onComplete
}) => {
  const [questionNumber, setQuestionNumber] = useState(1);
  const [currentQuestion] = useState({
    text: 'What is 2 + 2?',
    domain: 'Math'
  });
  const [response, setResponse] = useState('');
  const [observations, setObservations] = useState('');

  const handleNextQuestion = () => {
    // TODO: Record response and load next question
    if (questionNumber >= 20) {
      onComplete({ sessionId: session.sessionId, mode: 'teacher-assisted' });
    } else {
      setQuestionNumber(questionNumber + 1);
      setResponse('');
      setObservations('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Teacher-Assisted Assessment
            </h1>
            <p className="text-gray-600">
              {student.firstName} {student.lastName} • Question {questionNumber} of 20
            </p>
          </div>

          <div className="mb-6 p-6 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <span className="text-2xl">📖</span>
              <div>
                <p className="font-semibold text-blue-900 mb-2">Read this question to the student:</p>
                <p className="text-lg text-blue-800">"{currentQuestion.text}"</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Student's Response
              </label>
              <textarea
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                placeholder="Record the student's verbal or written response..."
                className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Behavioral Observations (Optional)
              </label>
              <textarea
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                placeholder="Note any relevant observations (confidence level, time taken, need for clarification, etc.)"
                className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                rows={2}
              />
            </div>
          </div>

          <div className="mt-8 flex justify-end">
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
