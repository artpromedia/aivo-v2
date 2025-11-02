import React from 'react';
import { ArrowLeft, Brain, TrendingUp, Clock, Target, Award, BookOpen, Activity } from 'lucide-react';

interface StudentProfileViewProps {
  studentId: string;
  onBack: () => void;
}

export function StudentProfileView({ studentId, onBack }: StudentProfileViewProps) {
  // Mock student data - in production, fetch from API
  const student = {
    id: studentId,
    name: 'Emma Johnson',
    avatar: '👧',
    grade: '3rd Grade',
    age: 8,
    hasIEP: true,
    virtualBrain: {
      status: 'active',
      focusLevel: 82,
      learningTime: 245,
      accuracy: 89,
      currentActivity: 'Math - Fractions',
      adaptationsMade: 156,
      interventions: 3
    },
    recentProgress: [
      { subject: 'Mathematics', score: 92, trend: 'up' },
      { subject: 'Reading', score: 78, trend: 'up' },
      { subject: 'Science', score: 85, trend: 'stable' },
      { subject: 'Writing', score: 71, trend: 'down' }
    ],
    weeklyActivity: [
      { day: 'Mon', minutes: 45, focus: 85 },
      { day: 'Tue', minutes: 52, focus: 78 },
      { day: 'Wed', minutes: 38, focus: 91 },
      { day: 'Thu', minutes: 47, focus: 83 },
      { day: 'Fri', minutes: 41, focus: 88 }
    ]
  };

  const handleReviewIEPGoals = () => {
    console.log('Opening IEP goals review for student:', student.name);
    alert(`Opening IEP Goals Review for ${student.name}\n\nThis will navigate to the detailed IEP goals tracking interface with progress monitoring and goal adjustment capabilities.`);
    // In production: navigate to IEP goals page with student context
  };

  const handleAdjustLearningSettings = () => {
    console.log('Opening learning settings for student:', student.name);
    alert(`Opening Virtual Brain Learning Settings for ${student.name}\n\nThis will open the advanced configuration panel for:\n- Difficulty adjustment\n- Learning style preferences\n- Focus monitoring settings\n- Intervention thresholds`);
    // In production: open learning settings modal or navigate to configuration page
  };

  const handleContactParent = () => {
    console.log('Opening parent communication for student:', student.name);
    alert(`Opening Parent Communication for ${student.name}\n\nThis will open the communication interface to:\n- Send progress updates\n- Schedule conferences\n- Share achievements\n- Discuss concerns`);
    // In production: navigate to parent communication with pre-filled student context
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center mb-8">
        <button
          onClick={onBack}
          className="flex items-center text-gray-600 hover:text-gray-900 mr-6"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Students
        </button>
        <div className="flex items-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center text-2xl mr-4">
            {student.avatar}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{student.name}</h1>
            <p className="text-gray-600">{student.grade} • Age {student.age} {student.hasIEP && '• IEP Student'}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Virtual Brain Status */}
        <div className="lg:col-span-2 space-y-6">
          {/* Current Status Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Virtual Brain Status</h2>
              <div className="flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Active
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <Activity className="h-6 w-6 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{student.virtualBrain.focusLevel}%</div>
                <div className="text-sm text-gray-600">Focus Level</div>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <Clock className="h-6 w-6 text-green-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{student.virtualBrain.learningTime}</div>
                <div className="text-sm text-gray-600">Minutes Today</div>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <Target className="h-6 w-6 text-purple-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{student.virtualBrain.accuracy}%</div>
                <div className="text-sm text-gray-600">Accuracy</div>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <Brain className="h-6 w-6 text-orange-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{student.virtualBrain.adaptationsMade}</div>
                <div className="text-sm text-gray-600">Adaptations</div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-xl">
              <div className="flex items-center">
                <BookOpen className="h-5 w-5 text-blue-600 mr-2" />
                <span className="font-medium text-blue-900">Current Activity:</span>
                <span className="text-blue-800 ml-2">{student.virtualBrain.currentActivity}</span>
              </div>
            </div>
          </div>

          {/* Subject Progress */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Subject Progress</h3>
            <div className="space-y-4">
              {student.recentProgress.map((subject) => (
                <div key={subject.subject} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mr-4">
                      <BookOpen className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{subject.subject}</div>
                      <div className="text-sm text-gray-500">Latest Assessment</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="text-2xl font-bold text-gray-900 mr-3">{subject.score}%</div>
                    <div className={`p-1 rounded-full ${
                      subject.trend === 'up' ? 'bg-green-100 text-green-600' :
                      subject.trend === 'down' ? 'bg-red-100 text-red-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      <TrendingUp className={`h-4 w-4 ${
                        subject.trend === 'down' ? 'rotate-180' : 
                        subject.trend === 'stable' ? 'rotate-90' : ''
                      }`} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Weekly Activity Chart */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">This Week's Activity</h3>
            <div className="flex items-end justify-between h-32 mb-4">
              {student.weeklyActivity.map((day) => (
                <div key={day.day} className="flex flex-col items-center">
                  <div 
                    className="w-8 bg-gradient-to-t from-purple-500 to-purple-300 rounded-t-lg mb-2"
                    style={{ height: `${(day.minutes / 60) * 100}%` }}
                  ></div>
                  <div className="text-xs text-gray-600 font-medium">{day.day}</div>
                  <div className="text-xs text-gray-500">{day.minutes}min</div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Focus Average: 85%</span>
              <span className="text-gray-500">Total: {student.weeklyActivity.reduce((sum, day) => sum + day.minutes, 0)} minutes</span>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button 
                onClick={handleReviewIEPGoals}
                className="w-full text-left px-4 py-3 bg-purple-50 text-purple-700 rounded-xl hover:bg-purple-100 transition-colors"
              >
                <div className="font-medium">Review IEP Goals</div>
                <div className="text-sm text-purple-600">Track progress on individualized goals</div>
              </button>
              <button 
                onClick={handleAdjustLearningSettings}
                className="w-full text-left px-4 py-3 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 transition-colors"
              >
                <div className="font-medium">Adjust Learning Settings</div>
                <div className="text-sm text-blue-600">Modify Virtual Brain parameters</div>
              </button>
              <button 
                onClick={handleContactParent}
                className="w-full text-left px-4 py-3 bg-green-50 text-green-700 rounded-xl hover:bg-green-100 transition-colors"
              >
                <div className="font-medium">Contact Parent</div>
                <div className="text-sm text-green-600">Send progress update or message</div>
              </button>
            </div>
          </div>

          {/* Recent Interventions */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Interventions</h3>
            <div className="space-y-3">
              <div className="p-3 bg-orange-50 rounded-lg">
                <div className="text-sm font-medium text-orange-900">Difficulty Adjustment</div>
                <div className="text-xs text-orange-700">Math problems simplified - 2 hours ago</div>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="text-sm font-medium text-blue-900">Reading Support</div>
                <div className="text-xs text-blue-700">Audio assistance enabled - 1 day ago</div>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="text-sm font-medium text-green-900">Focus Break</div>
                <div className="text-xs text-green-700">5-minute break scheduled - 2 days ago</div>
              </div>
            </div>
          </div>

          {/* Achievement Badges */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Achievements</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 bg-yellow-50 rounded-lg">
                <Award className="h-8 w-8 text-yellow-600 mx-auto mb-1" />
                <div className="text-xs font-medium text-yellow-900">Math Master</div>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <BookOpen className="h-8 w-8 text-blue-600 mx-auto mb-1" />
                <div className="text-xs font-medium text-blue-900">Reading Star</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <Target className="h-8 w-8 text-green-600 mx-auto mb-1" />
                <div className="text-xs font-medium text-green-900">Goal Achiever</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <Brain className="h-8 w-8 text-purple-600 mx-auto mb-1" />
                <div className="text-xs font-medium text-purple-900">Focus Pro</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}