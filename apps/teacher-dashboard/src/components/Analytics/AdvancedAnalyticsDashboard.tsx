import React, { useState, useEffect } from 'react';
import {
  BarChart3, TrendingUp, TrendingDown, Brain, Target, Clock, 
  Users, AlertTriangle, CheckCircle, Activity, Zap, Eye,
  Calendar, Filter, Download, RefreshCw, Settings, ArrowUp, ArrowDown
} from 'lucide-react';

interface AnalyticsData {
  overview: {
    totalStudents: number;
    activeBrains: number;
    averageFocus: number;
    interventionsToday: number;
    avgLearningTime: number;
    successRate: number;
  };
  trends: {
    focusLevels: Array<{ date: string; average: number; max: number; min: number }>;
    interventions: Array<{ date: string; count: number; successful: number }>;
    learningTime: Array<{ date: string; total: number; perStudent: number }>;
    engagement: Array<{ date: string; score: number; }>;
  };
  brainFleet: Array<{
    id: string;
    studentName: string;
    currentActivity: string;
    focusLevel: number;
    status: 'active' | 'idle' | 'intervention' | 'error';
    lastUpdate: string;
    sessionsToday: number;
    adaptationsMade: number;
  }>;
  subjectPerformance: Array<{
    subject: string;
    averageScore: number;
    trend: 'up' | 'down' | 'stable';
    studentsCount: number;
    interventionRate: number;
  }>;
  iepMetrics: {
    studentsWithIEP: number;
    goalsOnTrack: number;
    goalsBehind: number;
    upcomingReviews: number;
    complianceScore: number;
  };
}

export function AdvancedAnalyticsDashboard() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'24h' | '7d' | '30d' | '90d'>('7d');
  const [refreshing, setRefreshing] = useState(false);

  // Mock data generation
  useEffect(() => {
    const generateMockData = (): AnalyticsData => {
      const now = new Date();
      const dates = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        return date.toISOString().split('T')[0];
      }).reverse();

      return {
        overview: {
          totalStudents: 24,
          activeBrains: 18,
          averageFocus: 78,
          interventionsToday: 12,
          avgLearningTime: 145, // minutes
          successRate: 85
        },
        trends: {
          focusLevels: dates.map(date => ({
            date,
            average: Math.floor(Math.random() * 20) + 70,
            max: Math.floor(Math.random() * 10) + 90,
            min: Math.floor(Math.random() * 20) + 50
          })),
          interventions: dates.map(date => ({
            date,
            count: Math.floor(Math.random() * 15) + 5,
            successful: Math.floor(Math.random() * 10) + 15
          })),
          learningTime: dates.map(date => ({
            date,
            total: Math.floor(Math.random() * 500) + 2000,
            perStudent: Math.floor(Math.random() * 50) + 100
          })),
          engagement: dates.map(date => ({
            date,
            score: Math.floor(Math.random() * 20) + 75
          }))
        },
        brainFleet: [
          {
            id: 'brain-1',
            studentName: 'Emma Johnson',
            currentActivity: 'Math - Fraction Practice',
            focusLevel: 82,
            status: 'active',
            lastUpdate: '2 minutes ago',
            sessionsToday: 3,
            adaptationsMade: 7
          },
          {
            id: 'brain-2',
            studentName: 'Marcus Williams',
            currentActivity: 'Reading - Comprehension',
            focusLevel: 94,
            status: 'active',
            lastUpdate: '1 minute ago',
            sessionsToday: 2,
            adaptationsMade: 4
          },
          {
            id: 'brain-3',
            studentName: 'Sophia Chen',
            currentActivity: 'Science - Ecosystems',
            focusLevel: 45,
            status: 'intervention',
            lastUpdate: '30 seconds ago',
            sessionsToday: 4,
            adaptationsMade: 12
          },
          {
            id: 'brain-4',
            studentName: 'Aiden Rodriguez',
            currentActivity: 'Idle',
            focusLevel: 0,
            status: 'idle',
            lastUpdate: '15 minutes ago',
            sessionsToday: 1,
            adaptationsMade: 2
          }
        ],
        subjectPerformance: [
          { subject: 'Mathematics', averageScore: 78, trend: 'up', studentsCount: 24, interventionRate: 15 },
          { subject: 'Reading', averageScore: 82, trend: 'stable', studentsCount: 24, interventionRate: 12 },
          { subject: 'Science', averageScore: 75, trend: 'down', studentsCount: 20, interventionRate: 18 },
          { subject: 'Social Studies', averageScore: 80, trend: 'up', studentsCount: 18, interventionRate: 10 }
        ],
        iepMetrics: {
          studentsWithIEP: 8,
          goalsOnTrack: 24,
          goalsBehind: 6,
          upcomingReviews: 3,
          complianceScore: 95
        }
      };
    };

    setIsLoading(true);
    setTimeout(() => {
      setAnalyticsData(generateMockData());
      setIsLoading(false);
    }, 1000);
  }, [selectedTimeRange]);

  const handleExportAnalytics = () => {
    if (!analyticsData) {
      alert('No data available to export');
      return;
    }
    
    // Create comprehensive analytics export
    const exportData = {
      overview: analyticsData.overview,
      timeRange: selectedTimeRange,
      exportDate: new Date().toISOString(),
      subjectPerformance: analyticsData.subjectPerformance,
      iepMetrics: analyticsData.iepMetrics,
      trends: {
        focusLevelsLastWeek: analyticsData.trends.focusLevels.slice(-7),
        learningTimeLastWeek: analyticsData.trends.learningTime.slice(-7),
        interventionsLastWeek: analyticsData.trends.interventions.slice(-7)
      }
    };
    
    const jsonContent = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `analytics-report-${selectedTimeRange}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    console.log('Exported analytics data for time range:', selectedTimeRange);
  };

  const handleRefreshAnalytics = () => {
    setRefreshing(true);
    // Use the existing useEffect logic to refresh data
    setTimeout(() => {
      setAnalyticsData(prev => prev ? {...prev} : null);
      setRefreshing(false);
    }, 1500);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh delay
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  };

  const getBrainStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'intervention': return 'text-red-600 bg-red-100';
      case 'idle': return 'text-gray-600 bg-gray-100';
      case 'error': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <ArrowUp className="h-4 w-4 text-green-500" />;
      case 'down': return <ArrowDown className="h-4 w-4 text-red-500" />;
      default: return <div className="h-4 w-4 bg-gray-400 rounded-full" />;
    }
  };

  if (isLoading || !analyticsData) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
          <span className="ml-2 text-gray-600">Loading analytics...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <BarChart3 className="h-6 w-6 text-blue-600 mr-2" />
            Analytics Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Real-time insights into Virtual Brain performance and student progress
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 flex items-center"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button 
            onClick={handleExportAnalytics}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Students</p>
              <p className="text-2xl font-bold text-gray-900">{analyticsData.overview.totalStudents}</p>
            </div>
            <Users className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Brains</p>
              <p className="text-2xl font-bold text-gray-900">{analyticsData.overview.activeBrains}</p>
            </div>
            <Brain className="h-8 w-8 text-purple-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Focus</p>
              <p className="text-2xl font-bold text-gray-900">{analyticsData.overview.averageFocus}%</p>
            </div>
            <Eye className="h-8 w-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Interventions</p>
              <p className="text-2xl font-bold text-gray-900">{analyticsData.overview.interventionsToday}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-orange-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Learning Time</p>
              <p className="text-2xl font-bold text-gray-900">{analyticsData.overview.avgLearningTime}m</p>
            </div>
            <Clock className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Success Rate</p>
              <p className="text-2xl font-bold text-gray-900">{analyticsData.overview.successRate}%</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Focus Trends Chart */}
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Focus Levels Trend</h3>
            <TrendingUp className="h-5 w-5 text-green-500" />
          </div>
          <div className="h-48 flex items-end justify-between space-x-2">
            {analyticsData.trends.focusLevels.map((day, index) => (
              <div key={day.date} className="flex flex-col items-center">
                <div className="relative w-8 bg-gray-200 rounded-t" style={{ height: '120px' }}>
                  <div 
                    className="absolute bottom-0 w-full bg-blue-500 rounded-t transition-all duration-500"
                    style={{ height: `${(day.average / 100) * 120}px` }}
                  />
                </div>
                <span className="text-xs text-gray-600 mt-2">
                  {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                </span>
                <span className="text-xs font-medium text-gray-900">{day.average}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Real-time Brain Fleet Status */}
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Live Brain Fleet</h3>
            <Activity className="h-5 w-5 text-purple-500" />
          </div>
          <div className="space-y-3 max-h-48 overflow-y-auto">
            {analyticsData.brainFleet.map((brain) => (
              <div key={brain.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    brain.status === 'active' ? 'bg-green-400' :
                    brain.status === 'intervention' ? 'bg-red-400 animate-pulse' :
                    brain.status === 'idle' ? 'bg-gray-400' :
                    'bg-orange-400'
                  }`} />
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{brain.studentName}</p>
                    <p className="text-xs text-gray-600">{brain.currentActivity}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{brain.focusLevel}%</p>
                  <p className="text-xs text-gray-500">{brain.lastUpdate}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Subject Performance */}
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Subject Performance</h3>
          <div className="space-y-4">
            {analyticsData.subjectPerformance.map((subject) => (
              <div key={subject.subject} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    {getTrendIcon(subject.trend)}
                    <span className="font-medium text-gray-900">{subject.subject}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-4 text-sm">
                  <span className="text-gray-600">{subject.studentsCount} students</span>
                  <span className="font-medium text-gray-900">{subject.averageScore}%</span>
                  <span className="text-red-600">{subject.interventionRate}% interventions</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* IEP Metrics */}
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">IEP Tracking</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Students with IEP</span>
              <span className="font-medium text-gray-900">{analyticsData.iepMetrics.studentsWithIEP}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Goals on Track</span>
              <span className="font-medium text-green-600">{analyticsData.iepMetrics.goalsOnTrack}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Goals Behind</span>
              <span className="font-medium text-red-600">{analyticsData.iepMetrics.goalsBehind}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Upcoming Reviews</span>
              <span className="font-medium text-orange-600">{analyticsData.iepMetrics.upcomingReviews}</span>
            </div>
            <div className="pt-3 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Compliance Score</span>
                <div className="flex items-center space-x-2">
                  <div className="w-16 h-2 bg-gray-200 rounded-full">
                    <div 
                      className="h-2 bg-green-500 rounded-full transition-all duration-500"
                      style={{ width: `${analyticsData.iepMetrics.complianceScore}%` }}
                    />
                  </div>
                  <span className="font-medium text-gray-900">{analyticsData.iepMetrics.complianceScore}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Intervention Analytics */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Intervention Analytics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Zap className="h-8 w-8 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">87</p>
            <p className="text-sm text-gray-600">Total Interventions (7 days)</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">74</p>
            <p className="text-sm text-gray-600">Successful Interventions</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">85%</p>
            <p className="text-sm text-gray-600">Success Rate</p>
          </div>
        </div>
      </div>
    </div>
  );
}