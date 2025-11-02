import React, { useState, useEffect } from 'react';
import {
  ArrowLeft, Brain, Activity, Zap, Target, TrendingUp, TrendingDown,
  Clock, Eye, AlertTriangle, CheckCircle, Settings, Pause, Play,
  RefreshCw, Download, BarChart3, Users, BookOpen, Lightbulb,
  MessageCircle, Star, Award, Calendar, Filter, MoreHorizontal
} from 'lucide-react';
import type { Student } from '../../types/virtual-brain';

interface StudentBrainViewProps {
  student: Student;
  onBack: () => void;
}

interface BrainActivity {
  id: string;
  timestamp: string;
  type: 'adaptation' | 'intervention' | 'achievement' | 'challenge';
  title: string;
  description: string;
  subject: string;
  impact: number;
  data?: any;
}

interface RealTimeMetric {
  name: string;
  value: number;
  trend: 'up' | 'down' | 'stable';
  color: string;
  unit?: string;
}

export function StudentBrainView({ student, onBack }: StudentBrainViewProps) {
  const [isLive, setIsLive] = useState(true);
  const [timeRange, setTimeRange] = useState<'1h' | '4h' | '24h' | '7d'>('4h');
  const [activeTab, setActiveTab] = useState<'overview' | 'adaptations' | 'progress' | 'insights'>('overview');
  const [brainActivities, setBrainActivities] = useState<BrainActivity[]>([]);
  const [realTimeMetrics, setRealTimeMetrics] = useState<RealTimeMetric[]>([]);

  const brain = student.virtualBrain;

  // Mock real-time data
  useEffect(() => {
    const mockActivities: BrainActivity[] = [
      {
        id: '1',
        timestamp: '2024-11-02T10:15:00Z',
        type: 'adaptation',
        title: 'Difficulty Increased',
        description: 'Increased math problem complexity from basic to intermediate level',
        subject: 'Mathematics',
        impact: 85,
        data: { from: 'basic', to: 'intermediate', accuracy: '95%' }
      },
      {
        id: '2',
        timestamp: '2024-11-02T10:08:00Z',
        type: 'achievement',
        title: 'Focus Milestone',
        description: 'Maintained focus above 80% for 15 consecutive minutes',
        subject: 'Reading',
        impact: 92,
        data: { duration: 15, averageFocus: 87 }
      },
      {
        id: '3',
        timestamp: '2024-11-02T09:45:00Z',
        type: 'intervention',
        title: 'Break Suggested',
        description: 'Focus dropped to 45%, suggested 5-minute break',
        subject: 'Science',
        impact: 78,
        data: { focusLevel: 45, breakDuration: 5 }
      }
    ];

    const mockMetrics: RealTimeMetric[] = [
      { name: 'Current Focus', value: brain?.currentState.focusLevel || 0, trend: 'up', color: 'text-green-600', unit: '%' },
      { name: 'Adaptations/Hour', value: 12, trend: 'stable', color: 'text-blue-600' },
      { name: 'Success Rate', value: brain?.metrics.successRate || 0, trend: 'up', color: 'text-purple-600', unit: '%' },
      { name: 'Engagement Score', value: brain?.metrics.engagementScore || 0, trend: 'down', color: 'text-orange-600' }
    ];

    setBrainActivities(mockActivities);
    setRealTimeMetrics(mockMetrics);
  }, [brain]);

  // Real-time updates simulation
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      // Update metrics with small random changes
      setRealTimeMetrics(prev => prev.map(metric => ({
        ...metric,
        value: Math.max(0, Math.min(100, metric.value + (Math.random() - 0.5) * 5))
      })));
    }, 3000);

    return () => clearInterval(interval);
  }, [isLive]);

  const handleAcceptSuggestion = (suggestionId: string) => {
    // In production, this would make an API call to accept the suggestion
    console.log('Accepting suggestion:', suggestionId);
    alert(`Suggestion accepted! The Virtual Brain will implement this adaptation for ${student.name}.`);
    
    // Update the suggestion status in the brain data
    if (brain?.suggestions) {
      const updatedSuggestions = brain.suggestions.map(s => 
        s.id === suggestionId ? { ...s, status: 'accepted' as const } : s
      );
      // In production, this would trigger a state update
      console.log('Updated suggestions:', updatedSuggestions);
    }
  };

  const handleRejectSuggestion = (suggestionId: string) => {
    const reason = prompt('Optional: Why are you rejecting this suggestion?');
    console.log('Rejecting suggestion:', suggestionId, 'Reason:', reason);
    alert(`Suggestion rejected. The Virtual Brain will note your feedback${reason ? ': ' + reason : ''}.`);
    
    // Update the suggestion status in the brain data
    if (brain?.suggestions) {
      const updatedSuggestions = brain.suggestions.map(s => 
        s.id === suggestionId ? { ...s, status: 'rejected' as const } : s
      );
      // In production, this would trigger a state update
      console.log('Updated suggestions:', updatedSuggestions);
    }
  };

  const handleExportReport = () => {
    const reportData = {
      student: {
        name: student.name,
        id: student.id,
        grade: student.gradeLevel
      },
      exportDate: new Date().toISOString(),
      summary: {
        averageFocus: realTimeMetrics.find(m => m.name === 'Average Focus')?.value || 0,
        learningTime: realTimeMetrics.find(m => m.name === 'Learning Time')?.value || 0,
        interventionsActive: realTimeMetrics.find(m => m.name === 'Active Interventions')?.value || 0,
        accuracyRate: realTimeMetrics.find(m => m.name === 'Accuracy Rate')?.value || 0
      },
      recentActivity: brainActivities.slice(0, 10),
      suggestions: brain?.suggestions || [],
      virtualBrainStatus: brain?.status || 'none'
    };
    
    const reportText = `
AIVO Virtual Brain Report
Student: ${reportData.student.name} (Grade ${reportData.student.grade})
Generated: ${new Date(reportData.exportDate).toLocaleString()}

=== SUMMARY ===
Average Focus: ${reportData.summary.averageFocus}%
Learning Time Today: ${reportData.summary.learningTime} minutes
Active Interventions: ${reportData.summary.interventionsActive}
Accuracy Rate: ${reportData.summary.accuracyRate}%
Virtual Brain Status: ${reportData.virtualBrainStatus}

=== RECENT ACTIVITY ===
${reportData.recentActivity.map(activity => 
  `${new Date(activity.timestamp).toLocaleString()}: ${activity.title} (${activity.subject})`
).join('\n')}

=== AI SUGGESTIONS ===
${reportData.suggestions.map((suggestion: any) => 
  `${suggestion.suggestion}: ${suggestion.reasoning} (Priority: ${suggestion.priority})`
).join('\n')}
    `.trim();
    
    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `brain-report-${student.name.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    console.log('Exported brain report for student:', student.name);
  };

  const handleInitializeBrain = () => {
    console.log('Initializing Virtual Brain for student:', student.name);
    alert(`Initializing Virtual Brain for ${student.name}. This will start the AI-powered learning analysis and personalization engine.`);
  };

  const handleRefreshActivity = () => {
    console.log('Refreshing brain activity feed for student:', student.name);
    alert('Refreshing live brain activity feed...\n\nThis will fetch the latest Virtual Brain activities, learning adaptations, and real-time monitoring data.');
    // In production: trigger activity feed refresh from real-time API
  };

  const getActivityIcon = (type: BrainActivity['type']) => {
    switch (type) {
      case 'adaptation': return <Zap className="h-4 w-4 text-blue-500" />;
      case 'intervention': return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'achievement': return <Award className="h-4 w-4 text-green-500" />;
      case 'challenge': return <Target className="h-4 w-4 text-red-500" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-3 w-3 text-green-500" />;
      case 'down': return <TrendingDown className="h-3 w-3 text-red-500" />;
      default: return <div className="h-3 w-3 bg-gray-400 rounded-full" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 24 * 60) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  };

  if (!brain) {
    return (
      <div className="p-8">
        <button
          onClick={onBack}
          className="flex items-center text-gray-600 hover:text-gray-800 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </button>
        <div className="bg-white rounded-xl p-8 shadow-sm border text-center">
          <Brain className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">{student.name}</h3>
          <p className="text-gray-600 mb-6">No Virtual Brain active for this student</p>
          <button 
            onClick={handleInitializeBrain}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Initialize Virtual Brain
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="flex items-center text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back
          </button>
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
              {student.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{student.name}</h1>
              <p className="text-gray-600">{student.gradeLevel} • Virtual Brain ID: {brain.id}</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className={`flex items-center px-3 py-2 rounded-lg ${
            isLive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
          }`}>
            <div className={`w-2 h-2 rounded-full mr-2 ${
              isLive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
            }`} />
            {isLive ? 'Live' : 'Paused'}
          </div>
          
          <button
            onClick={() => setIsLive(!isLive)}
            className={`p-2 rounded-lg ${
              isLive ? 'bg-orange-100 text-orange-600 hover:bg-orange-200' : 'bg-green-100 text-green-600 hover:bg-green-200'
            }`}
          >
            {isLive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </button>
          
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="1h">Last Hour</option>
            <option value="4h">Last 4 Hours</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
          </select>
          
          <button 
            onClick={handleExportReport}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </button>
        </div>
      </div>

      {/* Real-time Metrics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {realTimeMetrics.map((metric) => (
          <div key={metric.name} className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">{metric.name}</h3>
              {getTrendIcon(metric.trend)}
            </div>
            <div className="flex items-baseline space-x-1">
              <span className={`text-2xl font-bold ${metric.color}`}>
                {Math.round(metric.value)}
              </span>
              {metric.unit && <span className="text-sm text-gray-500">{metric.unit}</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Brain Status Card */}
      <div className="bg-white rounded-xl p-6 shadow-sm border mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Virtual Brain Status</h2>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            brain.status === 'active' ? 'bg-green-100 text-green-800' :
            brain.status === 'processing' ? 'bg-blue-100 text-blue-800' :
            brain.status === 'idle' ? 'bg-gray-100 text-gray-800' :
            'bg-red-100 text-red-800'
          }`}>
            {brain.status.charAt(0).toUpperCase() + brain.status.slice(1)}
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Current Activity</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Subject:</span>
                <span className="font-medium text-gray-900">{brain.currentState.currentSubject}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Activity:</span>
                <span className="font-medium text-gray-900">{brain.currentState.currentActivity}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Focus Level:</span>
                <div className="flex items-center space-x-3">
                  <div className="w-24 h-2 bg-gray-200 rounded-full">
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 ${
                        brain.currentState.focusLevel >= 70 ? 'bg-green-500' :
                        brain.currentState.focusLevel >= 40 ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${brain.currentState.focusLevel}%` }}
                    />
                  </div>
                  <span className="font-medium text-gray-900">{brain.currentState.focusLevel}%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Last Adaptation:</span>
                <span className="font-medium text-gray-900">
                  {formatTimestamp(brain.currentState.lastAdaptation)}
                </span>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Session Statistics</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Documents Processed:</span>
                <span className="font-medium text-gray-900">{brain.currentState.documentsProcessed}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Adaptations Made:</span>
                <span className="font-medium text-gray-900">{brain.currentState.adaptationsMade}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Interventions:</span>
                <span className="font-medium text-gray-900">{brain.currentState.interventionsTriggered}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Success Rate:</span>
                <span className="font-medium text-gray-900">{brain.metrics.successRate}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Real-time Activity', icon: Activity },
            { id: 'adaptations', label: 'Adaptations', icon: Zap },
            { id: 'progress', label: 'Learning Progress', icon: TrendingUp },
            { id: 'insights', label: 'AI Insights', icon: Brain }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
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
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Live Brain Activity Feed</h3>
              <button 
                onClick={handleRefreshActivity}
                className="p-2 text-gray-400 hover:text-gray-600"
                title="Refresh activity feed"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
            
            <div className="space-y-4">
              {brainActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0 mt-1">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-sm font-medium text-gray-900">{activity.title}</h4>
                      <span className="text-xs text-gray-500">{formatTimestamp(activity.timestamp)}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{activity.description}</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span className="px-2 py-1 bg-white rounded">{activity.subject}</span>
                      <span className="flex items-center">
                        <BarChart3 className="h-3 w-3 mr-1" />
                        Impact: {activity.impact}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'adaptations' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Adaptation Patterns</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm text-blue-900">Difficulty Adjustments</span>
                  <span className="font-semibold text-blue-900">23 today</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="text-sm text-green-900">Pacing Changes</span>
                  <span className="font-semibold text-green-900">8 today</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <span className="text-sm text-purple-900">Content Switching</span>
                  <span className="font-semibold text-purple-900">4 today</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Success Metrics</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Adaptation Acceptance Rate</span>
                  <span className="font-semibold text-gray-900">{brain.metrics.adaptationAcceptanceRate}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Learning Velocity</span>
                  <span className="font-semibold text-gray-900">{brain.metrics.progressVelocity}x</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Engagement Score</span>
                  <span className="font-semibold text-gray-900">{brain.metrics.engagementScore}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'progress' && (
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Learning Progress Analysis</h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Strength Areas</h4>
              <div className="space-y-2">
                {brain.learningProfile.strengthAreas.map((area, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-green-50 rounded">
                    <span className="text-sm text-green-900">{area}</span>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Challenge Areas</h4>
              <div className="space-y-2">
                {brain.learningProfile.challengeAreas.map((area, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-red-50 rounded">
                    <span className="text-sm text-red-900">{area}</span>
                    <Target className="h-4 w-4 text-red-500" />
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Learning Style</h4>
              <div className="p-4 bg-purple-50 rounded-lg text-center">
                <BookOpen className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                <span className="text-sm font-medium text-purple-900 capitalize">
                  {brain.learningProfile.learningStyle}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'insights' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">AI-Generated Insights</h3>
            
            <div className="space-y-6">
              <div className="border-l-4 border-blue-500 bg-blue-50 p-4 rounded-r-lg">
                <div className="flex items-start space-x-3">
                  <Lightbulb className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900">Learning Pattern Detected</h4>
                    <p className="text-sm text-blue-800 mt-1">
                      {student.name} shows peak focus during morning sessions (9-11 AM) with 85% effectiveness. 
                      Consider scheduling challenging subjects during this optimal time window.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="border-l-4 border-green-500 bg-green-50 p-4 rounded-r-lg">
                <div className="flex items-start space-x-3">
                  <Star className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-green-900">Strength Utilization</h4>
                    <p className="text-sm text-green-800 mt-1">
                      Strong visual learning preference detected. Math performance improves 40% when using 
                      visual aids and diagrams. Recommend incorporating more visual elements.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="border-l-4 border-orange-500 bg-orange-50 p-4 rounded-r-lg">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-orange-900">Intervention Opportunity</h4>
                    <p className="text-sm text-orange-800 mt-1">
                      Reading comprehension scores below grade level. The Virtual Brain suggests 
                      implementing guided reading sessions with immediate feedback loops.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Pending Suggestions</h3>
              <div className="space-y-3">
                {brain.suggestions.filter(s => s.status === 'pending').map((suggestion) => (
                  <div key={suggestion.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 mb-1">{suggestion.suggestion}</h4>
                        <p className="text-sm text-gray-600 mb-2">{suggestion.reasoning}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span className={`px-2 py-1 rounded-full ${
                            suggestion.priority === 'high' ? 'bg-red-100 text-red-800' :
                            suggestion.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {suggestion.priority} priority
                          </span>
                          <span>{formatTimestamp(suggestion.createdAt)}</span>
                        </div>
                      </div>
                      <div className="flex space-x-2 ml-4">
                        <button 
                          onClick={() => handleAcceptSuggestion(suggestion.id)}
                          className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                        >
                          Accept
                        </button>
                        <button 
                          onClick={() => handleRejectSuggestion(suggestion.id)}
                          className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommended Actions</h3>
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 text-sm">Schedule Parent Conference</h4>
                  <p className="text-xs text-blue-800 mt-1">Discuss recent progress improvements</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <h4 className="font-medium text-purple-900 text-sm">Update IEP Goals</h4>
                  <p className="text-xs text-purple-800 mt-1">Current goals may be too easy</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <h4 className="font-medium text-green-900 text-sm">Peer Collaboration</h4>
                  <p className="text-xs text-green-800 mt-1">Strong candidate for peer tutoring</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}