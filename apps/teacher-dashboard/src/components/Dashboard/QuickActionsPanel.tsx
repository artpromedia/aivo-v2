import React, { useState, useEffect } from 'react';
import { 
  Zap, Users, Brain, AlertTriangle, Clock, TrendingUp, 
  MessageSquare, Target, BookOpen, RefreshCw, Settings,
  Play, Pause
} from 'lucide-react';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
  priority: 'high' | 'medium' | 'low';
  category: 'immediate' | 'planning' | 'monitoring' | 'communication';
  isActive?: boolean;
  count?: number;
}

interface QuickActionsPanelProps {
  onViewStudentBrains: () => void;
  onOpenIEPAssistant: () => void;
  onViewAnalytics: () => void;
  onSendMessage: () => void;
  onAddStudent: () => void;
  onReviewAlerts: () => void;
  onGenerateReport: () => void;
}

export function QuickActionsPanel({
  onViewStudentBrains,
  onOpenIEPAssistant,
  onViewAnalytics,
  onSendMessage,
  onAddStudent,
  onReviewAlerts,
  onGenerateReport
}: QuickActionsPanelProps) {
  const [activeFilter, setActiveFilter] = useState<'all' | 'immediate' | 'planning' | 'monitoring' | 'communication'>('all');
  const [isLiveMode, setIsLiveMode] = useState(true);
  const [pendingAlerts, setPendingAlerts] = useState(3);
  const [activeBrains, setActiveBrains] = useState(18);

  // Mock real-time updates
  useEffect(() => {
    if (!isLiveMode) return;

    const interval = setInterval(() => {
      // Simulate changing metrics
      setPendingAlerts(prev => Math.max(0, prev + (Math.random() > 0.7 ? 1 : -1)));
      setActiveBrains(prev => Math.max(0, Math.min(25, prev + (Math.random() - 0.5) * 2)));
    }, 5000);

    return () => clearInterval(interval);
  }, [isLiveMode]);

  const handleQuickActionsSettings = () => {
    console.log('Opening Quick Actions settings');
    alert('Quick Actions Settings\n\n• Customize action categories\n• Set notification preferences\n• Configure live monitoring\n• Manage dashboard layout\n\nSettings panel will be implemented with customization options.');
  };

  const quickActions: QuickAction[] = [
    {
      id: 'monitor-brains',
      title: 'Monitor Virtual Brains',
      description: 'View real-time brain activity and focus levels',
      icon: Brain,
      action: onViewStudentBrains,
      priority: 'high',
      category: 'immediate',
      count: activeBrains
    },
    {
      id: 'review-alerts',
      title: 'Review Alerts',
      description: 'Check pending interventions and suggestions',
      icon: AlertTriangle,
      action: onReviewAlerts,
      priority: 'high',
      category: 'immediate',
      count: pendingAlerts
    },
    {
      id: 'iep-assistant',
      title: 'IEP Assistant',
      description: 'AI-powered IEP goal generation and compliance',
      icon: Target,
      action: onOpenIEPAssistant,
      priority: 'medium',
      category: 'planning'
    },
    {
      id: 'analytics',
      title: 'View Analytics',
      description: 'Classroom performance trends and insights',
      icon: TrendingUp,
      action: onViewAnalytics,
      priority: 'medium',
      category: 'monitoring'
    },
    {
      id: 'send-message',
      title: 'Message Parents',
      description: 'Send updates and schedule conferences',
      icon: MessageSquare,
      action: onSendMessage,
      priority: 'low',
      category: 'communication'
    },
    {
      id: 'add-student',
      title: 'Add Student',
      description: 'Onboard new student with Virtual Brain setup',
      icon: Users,
      action: onAddStudent,
      priority: 'low',
      category: 'planning'
    },
    {
      id: 'schedule-break',
      title: 'Schedule Class Break',
      description: 'Trigger synchronized break for all active brains',
      icon: Clock,
      action: () => {
        if (confirm('Schedule a 10-minute break for all active Virtual Brains?')) {
          alert('Break scheduled! All Virtual Brains will pause learning activities.');
        }
      },
      priority: 'medium',
      category: 'immediate'
    },
    {
      id: 'focus-boost',
      title: 'Focus Boost',
      description: 'Activate attention enhancement for struggling students',
      icon: Zap,
      action: () => {
        if (confirm('Activate Focus Boost for students with focus levels below 60%?')) {
          alert('Focus Boost activated! Enhanced engagement protocols initiated.');
        }
      },
      priority: 'high',
      category: 'immediate'
    },
    {
      id: 'learning-insights',
      title: 'Generate Learning Report',
      description: 'Create weekly progress summary for parents',
      icon: BookOpen,
      action: onGenerateReport,
      priority: 'low',
      category: 'communication'
    }
  ];

  const filteredActions = quickActions.filter(action => 
    activeFilter === 'all' || action.category === activeFilter
  );

  const getPriorityColor = (priority: QuickAction['priority']) => {
    switch (priority) {
      case 'high': return 'border-red-200 bg-red-50 hover:bg-red-100';
      case 'medium': return 'border-yellow-200 bg-yellow-50 hover:bg-yellow-100';
      case 'low': return 'border-green-200 bg-green-50 hover:bg-green-100';
    }
  };

  const getPriorityDot = (priority: QuickAction['priority']) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
    }
  };

  const categories = [
    { id: 'all', label: 'All Actions', count: quickActions.length },
    { id: 'immediate', label: 'Immediate', count: quickActions.filter(a => a.category === 'immediate').length },
    { id: 'planning', label: 'Planning', count: quickActions.filter(a => a.category === 'planning').length },
    { id: 'monitoring', label: 'Monitoring', count: quickActions.filter(a => a.category === 'monitoring').length },
    { id: 'communication', label: 'Communication', count: quickActions.filter(a => a.category === 'communication').length }
  ];

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
            <Zap className="h-4 w-4 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
            <p className="text-sm text-gray-600">Manage your classroom efficiently</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className={`flex items-center px-3 py-2 rounded-lg ${
            isLiveMode ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
          }`}>
            <div className={`w-2 h-2 rounded-full mr-2 ${
              isLiveMode ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
            }`} />
            <span className="text-sm font-medium">{isLiveMode ? 'Live' : 'Paused'}</span>
          </div>
          
          <button
            onClick={() => setIsLiveMode(!isLiveMode)}
            className={`p-2 rounded-lg ${
              isLiveMode ? 'bg-orange-100 text-orange-600 hover:bg-orange-200' : 'bg-green-100 text-green-600 hover:bg-green-200'
            }`}
            title={isLiveMode ? 'Pause real-time updates' : 'Resume real-time updates'}
          >
            {isLiveMode ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </button>

          <button 
            onClick={handleQuickActionsSettings}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            title="Quick Actions Settings"
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200 pb-4">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setActiveFilter(category.id as typeof activeFilter)}
            className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeFilter === category.id
                ? 'bg-blue-100 text-blue-700 border border-blue-200'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <span>{category.label}</span>
            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
              activeFilter === category.id
                ? 'bg-blue-200 text-blue-800'
                : 'bg-gray-200 text-gray-600'
            }`}>
              {category.count}
            </span>
          </button>
        ))}
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredActions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              onClick={action.action}
              className={`p-4 rounded-xl border-2 text-left transition-all hover:scale-105 hover:shadow-md ${getPriorityColor(action.priority)}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                    <Icon className="h-5 w-5 text-gray-700" />
                  </div>
                  <div className={`w-2 h-2 rounded-full ${getPriorityDot(action.priority)}`} />
                </div>
                {action.count !== undefined && (
                  <span className="px-2 py-1 bg-white rounded-full text-sm font-semibold text-gray-700 shadow-sm">
                    {action.count}
                  </span>
                )}
              </div>
              
              <h3 className="font-semibold text-gray-900 mb-1">{action.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{action.description}</p>
              
              <div className="mt-3 flex items-center text-xs text-gray-500">
                <span className="capitalize">{action.category.replace('-', ' ')}</span>
                <span className="mx-2">•</span>
                <span className="capitalize">{action.priority} priority</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Emergency Actions */}
      <div className="mt-6 p-4 bg-red-50 rounded-xl border border-red-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <div>
              <h3 className="font-semibold text-red-900">Emergency Actions</h3>
              <p className="text-sm text-red-700">Quick access to critical interventions</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => {
                if (confirm('Pause ALL Virtual Brain activities immediately?')) {
                  alert('Emergency pause activated. All Virtual Brains are now in safe mode.');
                }
              }}
              className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium"
            >
              Emergency Pause
            </button>
            <button
              onClick={() => {
                if (confirm('Send immediate alert to all parents about classroom situation?')) {
                  alert('Emergency notifications sent to all parents and administrators.');
                }
              }}
              className="px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm font-medium"
            >
              Alert Parents
            </button>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="mt-6 flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center space-x-4">
          <span>Last updated: {new Date().toLocaleTimeString()}</span>
          <span>•</span>
          <span>{activeBrains} active brains</span>
          <span>•</span>
          <span>{pendingAlerts} pending alerts</span>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="flex items-center space-x-1 text-blue-600 hover:text-blue-800"
        >
          <RefreshCw className="h-3 w-3" />
          <span>Refresh</span>
        </button>
      </div>
    </div>
  );
}