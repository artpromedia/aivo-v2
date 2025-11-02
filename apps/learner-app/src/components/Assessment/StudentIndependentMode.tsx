import React, { useState, useEffect } from 'react';

interface StudentInfo {
  id: string;
  firstName: string;
  lastName: string;
  gradeLevel: string;
}

interface AssessmentSession {
  sessionId: string;
  studentId: string;
  startTime: Date;
  questionsAnswered: number;
  currentDomain: string;
  progress: number;
}

interface Question {
  id: string;
  domain: string;
  difficulty: string;
  questionText: string;
  questionAudio?: string;
  type: 'multiple-choice' | 'short-answer' | 'matching';
  options?: string[];
  correctAnswer?: string;
  timeLimit?: number;
}

interface StudentIndependentModeProps {
  student: StudentInfo;
  session: AssessmentSession;
  onComplete: (results: any) => void;
}

export const StudentIndependentMode: React.FC<StudentIndependentModeProps> = ({
  student,
  session,
  onComplete
}) => {
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [questionNumber, setQuestionNumber] = useState(1);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [textAnswer, setTextAnswer] = useState('');
  const [answers, setAnswers] = useState<any[]>([]);
  const [timeRemaining, setTimeRemaining] = useState<number>(300); // 5 minutes default
  const [isLoading, setIsLoading] = useState(true);
  const [audioPlaying, setAudioPlaying] = useState(false);

  // Mock questions - TODO: Replace with BaselineAssessmentAgent API calls
  const mockQuestions: Question[] = [
    {
      id: 'q1',
      domain: 'reading',
      difficulty: 'developing',
      questionText: 'Read this sentence: "The cat sat on the mat." What is the cat doing?',
      type: 'multiple-choice',
      options: ['Running', 'Sitting', 'Sleeping', 'Eating'],
      correctAnswer: 'Sitting',
      timeLimit: 60
    },
    {
      id: 'q2',
      domain: 'math',
      difficulty: 'developing',
      questionText: 'What is 5 + 3?',
      type: 'multiple-choice',
      options: ['6', '7', '8', '9'],
      correctAnswer: '8',
      timeLimit: 45
    }
  ];

  const totalQuestions = 20; // Adaptive assessment - will adjust based on responses

  useEffect(() => {
    loadNextQuestion();
  }, []);

  useEffect(() => {
    if (currentQuestion && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleSkipQuestion();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [currentQuestion, timeRemaining]);

  const loadNextQuestion = async () => {
    setIsLoading(true);
    
    try {
      // TODO: Call BaselineAssessmentAgent.generateAdaptiveQuestions()
      // const response = await fetch('/api/assessment/next-question', {
      //   method: 'POST',
      //   body: JSON.stringify({
      //     sessionId: session.sessionId,
      //     previousAnswers: answers
      //   })
      // });
      // const question = await response.json();
      
      // Mock question loading
      await new Promise(resolve => setTimeout(resolve, 500));
      const nextQuestion = mockQuestions[questionNumber - 1];
      
      if (nextQuestion) {
        setCurrentQuestion(nextQuestion);
        setTimeRemaining(nextQuestion.timeLimit || 60);
        setSelectedAnswer('');
        setTextAnswer('');
      } else {
        // Assessment complete
        completeAssessment();
      }
    } catch (error) {
      console.error('Error loading question:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitAnswer = () => {
    if (!currentQuestion) return;

    const answer = currentQuestion.type === 'short-answer' ? textAnswer : selectedAnswer;
    
    if (!answer) {
      alert('Please select or enter an answer before continuing.');
      return;
    }

    const questionResult = {
      questionId: currentQuestion.id,
      domain: currentQuestion.domain,
      difficulty: currentQuestion.difficulty,
      answer,
      timeSpent: (currentQuestion.timeLimit || 60) - timeRemaining,
      timestamp: new Date()
    };

    setAnswers([...answers, questionResult]);

    // Move to next question or complete
    if (questionNumber >= mockQuestions.length) {
      completeAssessment();
    } else {
      setQuestionNumber(questionNumber + 1);
      loadNextQuestion();
    }
  };

  const handleSkipQuestion = () => {
    // Record as skipped
    if (currentQuestion) {
      const questionResult = {
        questionId: currentQuestion.id,
        domain: currentQuestion.domain,
        difficulty: currentQuestion.difficulty,
        answer: null,
        skipped: true,
        timeSpent: currentQuestion.timeLimit || 60,
        timestamp: new Date()
      };
      setAnswers([...answers, questionResult]);
    }

    if (questionNumber >= mockQuestions.length) {
      completeAssessment();
    } else {
      setQuestionNumber(questionNumber + 1);
      loadNextQuestion();
    }
  };

  const completeAssessment = () => {
    const results = {
      sessionId: session.sessionId,
      studentId: student.id,
      totalQuestions: answers.length,
      answers,
      completionTime: new Date(),
      duration: Math.floor((new Date().getTime() - session.startTime.getTime()) / 1000 / 60)
    };

    onComplete(results);
  };

  const playAudio = () => {
    // TODO: Implement text-to-speech or audio playback
    setAudioPlaying(true);
    setTimeout(() => setAudioPlaying(false), 2000);
  };

  const progress = (questionNumber / totalQuestions) * 100;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading next question...</p>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white py-8">
      <div className="max-w-3xl mx-auto px-4">
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Question {questionNumber} of {totalQuestions}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-indigo-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Timer */}
          <div className="flex justify-between items-center mb-6">
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              {currentQuestion.domain.charAt(0).toUpperCase() + currentQuestion.domain.slice(1)}
            </span>
            <div className="flex items-center gap-2 text-gray-600">
              <span className="text-2xl">⏱️</span>
              <span className={`text-lg font-mono ${timeRemaining < 10 ? 'text-red-600 font-bold' : ''}`}>
                {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
              </span>
            </div>
          </div>

          {/* Question Text */}
          <div className="mb-8">
            <div className="flex items-start justify-between gap-4">
              <h2 className="text-2xl font-semibold text-gray-900 leading-relaxed">
                {currentQuestion.questionText}
              </h2>
              <button
                onClick={playAudio}
                disabled={audioPlaying}
                className="flex-shrink-0 p-3 bg-indigo-100 hover:bg-indigo-200 rounded-full transition-colors disabled:opacity-50"
                title="Listen to question"
              >
                <span className="text-2xl">{audioPlaying ? '🔊' : '🔉'}</span>
              </button>
            </div>
          </div>

          {/* Answer Options */}
          <div className="space-y-3 mb-8">
            {currentQuestion.type === 'multiple-choice' && currentQuestion.options && (
              currentQuestion.options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedAnswer(option)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    selectedAnswer === option
                      ? 'border-indigo-600 bg-indigo-50'
                      : 'border-gray-300 hover:border-indigo-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      selectedAnswer === option
                        ? 'border-indigo-600 bg-indigo-600'
                        : 'border-gray-300'
                    }`}>
                      {selectedAnswer === option && (
                        <div className="w-3 h-3 bg-white rounded-full" />
                      )}
                    </div>
                    <span className="text-lg">{option}</span>
                  </div>
                </button>
              ))
            )}

            {currentQuestion.type === 'short-answer' && (
              <textarea
                value={textAnswer}
                onChange={(e) => setTextAnswer(e.target.value)}
                placeholder="Type your answer here..."
                className="w-full p-4 border-2 border-gray-300 rounded-lg focus:border-indigo-600 focus:outline-none resize-none"
                rows={4}
              />
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between gap-4">
            <button
              onClick={handleSkipQuestion}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Skip Question
            </button>
            <button
              onClick={handleSubmitAnswer}
              disabled={!selectedAnswer && !textAnswer}
              className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
              Next Question →
            </button>
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center text-gray-600 text-sm">
          <p>Take your time and do your best. You can skip questions if you're unsure.</p>
        </div>
      </div>
    </div>
  );
};
