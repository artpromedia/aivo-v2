import { useState, useEffect } from 'react';
import type { Student, ClassroomInsights, BrainSuggestion } from '../types/virtual-brain';
import { VirtualBrainGrid } from '../components/VirtualBrainGrid';
import { ClassroomInsightsPanel } from '../components/ClassroomInsightsPanel';
import { BrainSuggestionsQueue } from '../components/BrainSuggestionsQueue';

// Mock data - will be replaced with API calls
const mockStudents: Student[] = [
  {
    id: '1',
    name: 'Emma Johnson',
    gradeLevel: '3rd Grade',
    hasIEP: true,
    parentConsent: true,
    lastActive: new Date().toISOString(),
    virtualBrain: {
      id: 'brain-1',
      studentId: '1',
      createdAt: '2025-01-15T09:00:00Z',
      lastUpdated: new Date().toISOString(),
      status: 'active',
      learningProfile: {
        learningStyle: 'visual',
        optimalTimes: [
          { start: '09:00', end: '11:00', effectiveness: 85 },
          { start: '14:00', end: '15:00', effectiveness: 72 }
        ],
        strengthAreas: ['Math', 'Science'],
        challengeAreas: ['Reading Comprehension'],
        pacePreference: 'moderate',
        focusPatterns: []
      },
      currentState: {
        currentActivity: 'Math worksheet - Fractions',
        currentSubject: 'Mathematics',
        focusLevel: 82,
        lastAdaptation: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        documentsProcessed: 47,
        adaptationsMade: 156,
        interventionsTriggered: 3
      },
      metrics: {
        totalLearningTime: 2340,
        averageFocus: 78,
        successRate: 85,
        adaptationAcceptanceRate: 92,
        progressVelocity: 1.4,
        engagementScore: 88
      },
      suggestions: [
        {
          id: 'sug-1',
          brainId: 'brain-1',
          type: 'difficulty',
          priority: 'medium',
          suggestion: 'Increase problem complexity for multiplication',
          reasoning: 'Student has achieved 95% accuracy on current level for 3 consecutive sessions',
          proposedChange: {
            type: 'difficulty_adjustment',
            before: { level: 'basic', max_digits: 2 },
            after: { level: 'intermediate', max_digits: 3 },
            expectedImpact: '+15% engagement, maintains 85-90% accuracy'
          },
          createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          status: 'pending'
        }
      ]
    }
  },
  // Add more mock students here
];

const mockInsights: ClassroomInsights = {
  totalBrainsActive: 23,
  averageFocus: 78,
  brainsNeedingIntervention: 3,
  documentsBeingProcessed: 5,
  nextIEPReview: '2025-03-15',
  trends: [
    {
      metric: 'Average Focus',
      direction: 'up',
      change: 5,
      period: 'Last 7 days'
    },
    {
      metric: 'Intervention Rate',
      direction: 'down',
      change: 12,
      period: 'Last 7 days'
    }
  ]
};

export function DashboardPage() {
  const [students, setStudents] = useState<Student[]>(mockStudents);
  const [insights, setInsights] = useState<ClassroomInsights>(mockInsights);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'suggestions' | 'iep'>('overview');

  // Collect all suggestions from all brains
  const allSuggestions: BrainSuggestion[] = students
    .flatMap(student => student.virtualBrain?.suggestions || []);

  const handleStudentClick = (student: Student) => {
    setSelectedStudent(student);
    // Could open a modal or navigate to detail page
  };

  const handleReorder = (reorderedStudents: Student[]) => {
    setStudents(reorderedStudents);
    // Save order to backend
  };

  const handleAcceptSuggestion = (suggestionId: string, note?: string) => {
    console.log('Accepting suggestion:', suggestionId, note);
    // Update suggestion status and apply changes
    setStudents(students.map(student => ({
      ...student,
      virtualBrain: student.virtualBrain ? {
        ...student.virtualBrain,
        suggestions: student.virtualBrain.suggestions.map(s =>
          s.id === suggestionId ? { ...s, status: 'accepted' as const, teacherNote: note } : s
        )
      } : undefined
    })));
  };

  const handleRejectSuggestion = (suggestionId: string, note?: string) => {
    console.log('Rejecting suggestion:', suggestionId, note);
    setStudents(students.map(student => ({
      ...student,
      virtualBrain: student.virtualBrain ? {
        ...student.virtualBrain,
        suggestions: student.virtualBrain.suggestions.map(s =>
          s.id === suggestionId ? { ...s, status: 'rejected' as const, teacherNote: note } : s
        )
      } : undefined
    })));
  };

  const handleModifySuggestion = (suggestionId: string, modification: string, note?: string) => {
    console.log('Modifying suggestion:', suggestionId, modification, note);
    setStudents(students.map(student => ({
      ...student,
      virtualBrain: student.virtualBrain ? {
        ...student.virtualBrain,
        suggestions: student.virtualBrain.suggestions.map(s =>
          s.id === suggestionId ? { ...s, status: 'modified' as const, teacherNote: note } : s
        )
      } : undefined
    })));
  };

  useEffect(() => {
    // WebSocket connection for real-time updates
    // const ws = new WebSocket('ws://localhost:3000/teacher-dashboard');
    // ws.onmessage = (event) => {
    //   const data = JSON.parse(event.data);
    //   // Handle real-time updates
    // };
    // return () => ws.close();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Teacher Dashboard</h1>
          <p className="text-sm text-gray-600 mt-1">
            Virtual Brain Classroom Management
          </p>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              📊 Overview
            </button>
            <button
              onClick={() => setActiveTab('suggestions')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'suggestions'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              🧠 Brain Suggestions {allSuggestions.filter(s => s.status === 'pending').length > 0 && (
                <span className="ml-2 bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-xs">
                  {allSuggestions.filter(s => s.status === 'pending').length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('iep')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'iep'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              📋 IEP Assistant
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Classroom Insights */}
            <ClassroomInsightsPanel insights={insights} />

            {/* Virtual Brain Grid */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Student Virtual Brains</h2>
              <VirtualBrainGrid
                students={students}
                onStudentClick={handleStudentClick}
                onReorder={handleReorder}
              />
            </div>
          </div>
        )}

        {activeTab === 'suggestions' && (
          <BrainSuggestionsQueue
            suggestions={allSuggestions}
            students={students}
            onAccept={handleAcceptSuggestion}
            onReject={handleRejectSuggestion}
            onModify={handleModifySuggestion}
          />
        )}

        {activeTab === 'iep' && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">IEP Assistant</h3>
            <p className="text-gray-600">IEP management features coming soon...</p>
          </div>
        )}
      </main>

      {/* Selected Student Modal (placeholder) */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4">
            <h2 className="text-2xl font-bold mb-4">{selectedStudent.name}</h2>
            <p className="text-gray-600 mb-4">Detailed view coming soon...</p>
            <button
              onClick={() => setSelectedStudent(null)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
