import { useState, useEffect } from 'react';
import { Plus, Users, Brain, Target, BarChart3, Home, MessageSquare, User, Award } from 'lucide-react';
import type { Student, ClassroomInsights } from '../types/virtual-brain';
import { VirtualBrainGrid } from '../components/VirtualBrainGrid';
import { ClassroomInsightsPanel } from '../components/ClassroomInsightsPanel';
import { AddStudentWizard } from '../components/StudentOnboarding/AddStudentWizard';
import { StudentProfileView } from '../components/Students/StudentProfileView';
import { StudentListManagement } from '../components/Students/StudentListManagement';
import { IEPAgentInterface } from '../components/IEP/IEPAgentInterface';
import { TeacherProfileSettings } from '../components/Teacher/TeacherProfileSettings';
import { AdvancedAnalyticsDashboard } from '../components/Analytics/AdvancedAnalyticsDashboard';
import { ParentCommunicationHub } from '../components/Communication/ParentCommunicationHub';
import { StudentBrainView } from '../components/VirtualBrain/StudentBrainView';
import { QuickActionsPanel } from '../components/Dashboard/QuickActionsPanel';
import { RealTimeNotifications } from '../components/Notifications/RealTimeNotifications';
import { AlertsDashboard } from '../components/Alerts/AlertsDashboard';
import { ProgressReportsManager } from '../components/Reports/ProgressReportsManager';

type ActiveView = 'dashboard' | 'students' | 'iep-assistant' | 'analytics' | 'messages' | 'profile';

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
  const [insights] = useState<ClassroomInsights>(mockInsights);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showAddStudentWizard, setShowAddStudentWizard] = useState(false);
  const [activeView, setActiveView] = useState<ActiveView>('dashboard');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [selectedBrainStudent, setSelectedBrainStudent] = useState<Student | null>(null);
  const [showAlertsDialog, setShowAlertsDialog] = useState(false);
  const [showReportsDialog, setShowReportsDialog] = useState(false);

  // Mock teacher data - replace with actual auth context
  const teacher = {
    name: 'Arka Johnson',
    avatar: '👋',
    points: 2400,
    currentCourse: 'Biology Molecular',
    courseProgress: 79,
    classStats: {
      totalStudents: 24,
      activeBrains: 18
    }
  };

  const navigationItems = [
    { id: 'dashboard', icon: Home, label: 'Dashboard' },
    { id: 'students', icon: Users, label: 'Students' },
    { id: 'iep-assistant', icon: Target, label: 'IEP Assistant' },
    { id: 'analytics', icon: BarChart3, label: 'Analytics' },
    { id: 'messages', icon: MessageSquare, label: 'Messages' },
    { id: 'profile', icon: User, label: 'Profile' },
  ];

  const handleStudentClick = (student: Student) => {
    setSelectedBrainStudent(student);
  };

  const handleReorder = (reorderedStudents: Student[]) => {
    setStudents(reorderedStudents);
    // Save order to backend
  };

  const handleAddStudentComplete = (studentData: { firstName: string; lastName: string }) => {
    console.log('New student data:', studentData);
    setShowAddStudentWizard(false);
    
    // In production, redirect to the unified baseline assessment interface
    // The assessment should be the same experience whether initiated by:
    // - Teacher (after student onboarding)
    // - Parent (during license purchase flow)
    // - District admin (bulk student setup)
    
    // Generate session token and redirect to learner-app baseline assessment
    // const sessionToken = generateAssessmentToken(newStudentId);
    // const returnUrl = window.location.origin + '/teacher-dashboard';
    // window.location.href = `/assessment/baseline?studentId=${newStudentId}&token=${sessionToken}&context=teacher-onboarding&returnUrl=${encodeURIComponent(returnUrl)}`;
    
    // For now, show success message with redirect information
    const demoUrl = `/assessment/baseline?studentId=demo-123&token=demo-token&context=teacher-onboarding&returnUrl=${encodeURIComponent(window.location.href)}`;
    
    if (confirm(`Student ${studentData.firstName} ${studentData.lastName} added successfully!\n\nNext: Baseline assessment will be administered to create their Virtual Brain.\n\nIn production, you would be redirected to:\n${demoUrl}\n\nClick OK to see the flow (demo).`)) {
      // In production: window.location.href = demoUrl;
      alert('Demo: In production, the baseline assessment would open here.\n\nAfter completion:\n1. Virtual Brain creation begins automatically\n2. Teacher returns to this dashboard\n3. New student appears in Virtual Brain Grid');
    }
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

  const renderActiveView = () => {
    switch (activeView) {
      case 'students':
        return selectedStudentId ? 
          <StudentProfileView studentId={selectedStudentId} onBack={() => setSelectedStudentId(null)} /> :
          <StudentListManagement />;
      case 'iep-assistant':
        return <IEPAgentInterface />;
      case 'profile':
        return <TeacherProfileSettings />;
      case 'analytics':
        return <AdvancedAnalyticsDashboard />;
      case 'messages':
        return <ParentCommunicationHub />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-purple-800 flex">
      {/* Purple Sidebar */}
      <div className="w-64 bg-gradient-to-b from-purple-600 to-purple-800 text-white flex flex-col">
        {/* Logo */}
        <div className="p-6">
          <div className="w-10 h-10 bg-white bg-opacity-20 rounded-xl flex items-center justify-center mb-6">
            <Brain className="h-6 w-6 text-white" />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4">
          <div className="space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id as ActiveView)}
                  className={`w-full flex items-center px-4 py-3 rounded-xl text-left transition-colors ${
                    isActive 
                      ? 'bg-white bg-opacity-20 text-white' 
                      : 'text-purple-200 hover:bg-white hover:bg-opacity-10 hover:text-white'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Notifications */}
        <div className="px-4 pb-4">
          <RealTimeNotifications isEnabled={true} />
        </div>

        {/* User Profile */}
        <div className="p-4 border-t border-purple-500">
          <button 
            onClick={() => setActiveView('profile')}
            className="w-full flex items-center px-4 py-3 rounded-xl text-purple-200 hover:bg-white hover:bg-opacity-10 hover:text-white transition-colors"
          >
            <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-3">
              <User className="h-4 w-4" />
            </div>
            <div className="text-left">
              <div className="font-medium text-white">{teacher.name}</div>
              <div className="text-sm text-purple-200">Teacher</div>
            </div>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-gray-50 overflow-auto">
        {selectedBrainStudent ? (
          <StudentBrainView 
            student={selectedBrainStudent} 
            onBack={() => setSelectedBrainStudent(null)} 
          />
        ) : activeView === 'dashboard' ? (
          <div className="p-8">
            {/* Welcome Header with modern design */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Hello, {teacher.name} {teacher.avatar}
                  </h1>
                  <p className="text-gray-600 mt-1">
                    Nice to have you back, what an exciting day!<br />
                    Get ready and continue your Virtual Brain classroom management.
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center bg-yellow-100 rounded-xl px-4 py-2">
                    <Award className="h-5 w-5 text-yellow-600 mr-2" />
                    <span className="font-semibold text-yellow-900">{teacher.points} XP</span>
                    <span className="text-yellow-700 text-sm ml-2">Point</span>
                  </div>
                  <button 
                    onClick={() => setShowAddStudentWizard(true)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 flex items-center"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Student
                  </button>
                </div>
              </div>
            </div>

            {/* Enhanced Dashboard Components with modern styling */}
            <div className="space-y-8">
              {/* Quick Actions Panel */}
              <QuickActionsPanel
                onViewStudentBrains={() => {
                  // Scroll to Virtual Brain Grid section
                  const brainGridSection = document.querySelector('#virtual-brain-grid');
                  if (brainGridSection) {
                    brainGridSection.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                onOpenIEPAssistant={() => setActiveView('iep-assistant')}
                onViewAnalytics={() => setActiveView('analytics')}
                onSendMessage={() => setActiveView('messages')}
                onAddStudent={() => setShowAddStudentWizard(true)}
                onReviewAlerts={() => setShowAlertsDialog(true)}
                onGenerateReport={() => setShowReportsDialog(true)}
              />

              {/* Classroom Insights with modern card design */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">📊 Classroom Insights</h2>
                <ClassroomInsightsPanel insights={insights} />
              </div>

              {/* Virtual Brain Grid with modern styling */}
              <div id="virtual-brain-grid" className="bg-white rounded-2xl p-6 shadow-sm border">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">🧠 Student Virtual Brains</h2>
                <VirtualBrainGrid
                  students={students}
                  onStudentClick={handleStudentClick}
                  onReorder={handleReorder}
                />
              </div>
            </div>
          </div>
        ) : (
          renderActiveView()
        )}
      </div>



      {/* Add Student Wizard Modal */}
      {showAddStudentWizard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <AddStudentWizard
              onComplete={handleAddStudentComplete}
              onCancel={() => setShowAddStudentWizard(false)}
            />
          </div>
        </div>
      )}

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

      {/* Alerts Dashboard */}
      <AlertsDashboard
        isOpen={showAlertsDialog}
        onClose={() => setShowAlertsDialog(false)}
        onStudentSelect={(studentId) => {
          const student = students.find(s => s.id === studentId);
          if (student) {
            setSelectedBrainStudent(student);
            setShowAlertsDialog(false);
          }
        }}
      />

      {/* Progress Reports Manager */}
      <ProgressReportsManager
        isOpen={showReportsDialog}
        onClose={() => setShowReportsDialog(false)}
      />
    </div>
  );
}
