import React, { useState, useEffect } from 'react';
import { Target, TrendingUp, Calendar, CheckCircle, AlertCircle, Brain, FileText, Users, Search, Loader2, Plus, BookOpen, Edit3, Save, X } from 'lucide-react';

export function IEPAssistantInterface() {
  const [activeTab, setActiveTab] = useState<'overview' | 'goals' | 'progress' | 'reports'>('overview');

  const handleAddNewGoal = () => {
    // TODO: Integrate with IEP goal creation modal
    console.log('Opening goal creation modal...');
    alert('Goal creation interface will open here. Integration with IEP Agent for SMART goal generation.');
  };

  const handleGenerateReport = () => {
    const reportData = {
      generatedDate: new Date().toISOString(),
      studentsCount: iepStudents.length,
      summary: {
        totalGoals: iepStudents.reduce((total, student) => total + student.iepGoals, 0),
        averageProgress: Math.round(iepStudents.reduce((total, student) => total + student.progressPercentage, 0) / iepStudents.length),
        studentsOnTrack: iepStudents.filter(s => s.progressPercentage >= 70).length,
        studentsNeedingSupport: iepStudents.filter(s => s.progressPercentage < 70).length
      },
      studentDetails: iepStudents
    };
    
    const reportText = `
IEP COMPLIANCE REPORT
Generated: ${new Date(reportData.generatedDate).toLocaleString()}

=== SUMMARY ===
Total Students: ${reportData.studentsCount}
Total Goals: ${reportData.summary.totalGoals}
Average Progress: ${reportData.summary.averageProgress}%
Students On Track: ${reportData.summary.studentsOnTrack}
Students Needing Support: ${reportData.summary.studentsNeedingSupport}

=== STUDENT DETAILS ===
${reportData.studentDetails.map(student => 
  `${student.name} (${student.grade}): ${student.progressPercentage}% - ${student.iepGoals} goals - Status: ${student.status}`
).join('\n')}
    `.trim();
    
    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `iep-report-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    console.log('Generated IEP report for', reportData.studentsCount, 'students');
  };

  // Mock IEP data
  const iepStudents = [
    {
      id: '1',
      name: 'Emma Johnson',
      avatar: '👧',
      grade: '3rd Grade',
      iepGoals: 4,
      goalsOnTrack: 3,
      needsAttention: 1,
      nextReview: '2025-03-15',
      virtualBrainAlignment: 92
    },
    {
      id: '2',
      name: 'Marcus Williams',
      avatar: '👦',
      grade: '4th Grade',
      iepGoals: 6,
      goalsOnTrack: 5,
      needsAttention: 1,
      nextReview: '2025-04-20',
      virtualBrainAlignment: 88
    }
  ];

  const recentGoals = [
    {
      id: '1',
      student: 'Emma Johnson',
      goal: 'Read 50 sight words with 80% accuracy',
      progress: 76,
      status: 'on-track',
      dueDate: '2025-12-15',
      brainAdaptations: 12
    },
    {
      id: '2',
      student: 'Marcus Williams',
      goal: 'Complete 2-step math problems independently',
      progress: 45,
      status: 'needs-attention',
      dueDate: '2025-11-30',
      brainAdaptations: 8
    },
    {
      id: '3',
      student: 'Emma Johnson',
      goal: 'Write sentences with proper capitalization',
      progress: 88,
      status: 'exceeding',
      dueDate: '2025-01-10',
      brainAdaptations: 15
    }
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">{iepStudents.length}</span>
          </div>
          <h3 className="font-semibold text-gray-900">IEP Students</h3>
          <p className="text-sm text-gray-600">Active in classroom</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <Target className="h-6 w-6 text-green-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">{iepStudents.reduce((sum, s) => sum + s.goalsOnTrack, 0)}</span>
          </div>
          <h3 className="font-semibold text-gray-900">Goals On Track</h3>
          <p className="text-sm text-gray-600">Meeting expectations</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-orange-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">{iepStudents.reduce((sum, s) => sum + s.needsAttention, 0)}</span>
          </div>
          <h3 className="font-semibold text-gray-900">Needs Attention</h3>
          <p className="text-sm text-gray-600">Require intervention</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Brain className="h-6 w-6 text-purple-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">90%</span>
          </div>
          <h3 className="font-semibold text-gray-900">Brain Alignment</h3>
          <p className="text-sm text-gray-600">Average alignment score</p>
        </div>
      </div>

      {/* Student IEP Cards */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Student IEP Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {iepStudents.map((student) => (
            <div key={student.id} className="bg-white rounded-2xl p-6 shadow-sm border">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center text-xl mr-4">
                  {student.avatar}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{student.name}</h3>
                  <p className="text-sm text-gray-600">{student.grade}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-900">{student.iepGoals}</div>
                  <div className="text-xs text-gray-600">Total Goals</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">{student.goalsOnTrack}</div>
                  <div className="text-xs text-gray-600">On Track</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-orange-600">{student.needsAttention}</div>
                  <div className="text-xs text-gray-600">Attention</div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Virtual Brain Alignment</span>
                  <span className="font-semibold text-purple-600">{student.virtualBrainAlignment}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-600 h-2 rounded-full" 
                    style={{ width: `${student.virtualBrainAlignment}%` }}
                  ></div>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  Next Review: {new Date(student.nextReview).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Goal Progress */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Goal Progress</h2>
        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
          <div className="divide-y divide-gray-200">
            {recentGoals.map((goal) => (
              <div key={goal.id} className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-gray-900">{goal.goal}</h4>
                    <p className="text-sm text-gray-600">{goal.student} • Due {new Date(goal.dueDate).toLocaleDateString()}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm ${
                    goal.status === 'on-track' ? 'bg-green-100 text-green-800' :
                    goal.status === 'needs-attention' ? 'bg-orange-100 text-orange-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {goal.status === 'on-track' ? 'On Track' :
                     goal.status === 'needs-attention' ? 'Needs Attention' :
                     'Exceeding'}
                  </div>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Progress</span>
                  <span className="font-semibold text-gray-900">{goal.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                  <div 
                    className={`h-2 rounded-full ${
                      goal.status === 'on-track' ? 'bg-green-600' :
                      goal.status === 'needs-attention' ? 'bg-orange-600' :
                      'bg-blue-600'
                    }`}
                    style={{ width: `${goal.progress}%` }}
                  ></div>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Brain className="h-4 w-4 mr-2" />
                  {goal.brainAdaptations} Virtual Brain adaptations made
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderGoals = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">IEP Goals Management</h2>
        <button 
          onClick={handleAddNewGoal}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          Add New Goal
        </button>
      </div>
      <div className="bg-white rounded-2xl p-8 shadow-sm border text-center">
        <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Goals Management</h3>
        <p className="text-gray-600">Detailed IEP goals management interface will be implemented here.</p>
      </div>
    </div>
  );

  const renderProgress = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Progress Tracking</h2>
      <div className="bg-white rounded-2xl p-8 shadow-sm border text-center">
        <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Progress Analytics</h3>
        <p className="text-gray-600">Detailed progress tracking and analytics will be implemented here.</p>
      </div>
    </div>
  );

  const renderReports = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">IEP Reports</h2>
        <button 
          onClick={handleGenerateReport}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          Generate Report
        </button>
      </div>
      <div className="bg-white rounded-2xl p-8 shadow-sm border text-center">
        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Report Generation</h3>
        <p className="text-gray-600">IEP report generation and management interface will be implemented here.</p>
      </div>
    </div>
  );

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">IEP Assistant</h1>
          <p className="text-gray-600">Individualized Education Program management and tracking</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search students or goals..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: Target },
            { id: 'goals', label: 'Goals', icon: CheckCircle },
            { id: 'progress', label: 'Progress', icon: TrendingUp },
            { id: 'reports', label: 'Reports', icon: FileText }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'goals' && renderGoals()}
      {activeTab === 'progress' && renderProgress()}
      {activeTab === 'reports' && renderReports()}
    </div>
  );
}