import { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, Brain, X, Settings, Bell } from 'lucide-react';

interface Alert {
  id: string;
  type: 'intervention' | 'suggestion' | 'achievement' | 'warning' | 'system';
  priority: 'urgent' | 'high' | 'medium' | 'low';
  title: string;
  message: string;
  studentName?: string;
  studentId?: string;
  brainId?: string;
  timestamp: Date;
  isRead: boolean;
  actions?: {
    label: string;
    action: () => void;
    style: 'primary' | 'secondary' | 'danger';
  }[];
}

interface AlertsDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  onStudentSelect?: (studentId: string) => void;
}

export function AlertsDashboard({ isOpen, onClose, onStudentSelect }: AlertsDashboardProps) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [filteredAlerts, setFilteredAlerts] = useState<Alert[]>([]);
  const [filterType, setFilterType] = useState<'all' | Alert['type']>('all');
  const [filterPriority, setFilterPriority] = useState<'all' | Alert['priority']>('all');

  // Mock alerts - in production this would come from WebSocket or API
  useEffect(() => {
    const mockAlerts: Alert[] = [
      {
        id: '1',
        type: 'intervention',
        priority: 'urgent',
        title: 'Immediate Attention Needed',
        message: 'Focus level has dropped to 25% for 10 minutes straight. Immediate intervention required.',
        studentName: 'Emma Johnson',
        studentId: 'student-1',
        brainId: 'brain-1',
        timestamp: new Date(Date.now() - 1000 * 60 * 5),
        isRead: false,
        actions: [
          {
            label: 'Send Break',
            action: () => console.log('Sending break to Emma Johnson'),
            style: 'primary'
          },
          {
            label: 'View Brain',
            action: () => onStudentSelect?.('student-1'),
            style: 'secondary'
          }
        ]
      },
      {
        id: '2',
        type: 'suggestion',
        priority: 'high',
        title: 'Difficulty Adjustment Recommended',
        message: 'Math problems are too easy (95% accuracy for 30 minutes). Consider increasing difficulty.',
        studentName: 'Marcus Chen',
        studentId: 'student-2',
        brainId: 'brain-2',
        timestamp: new Date(Date.now() - 1000 * 60 * 15),
        isRead: false,
        actions: [
          {
            label: 'Apply Suggestion',
            action: () => console.log('Applying difficulty increase for Marcus Chen'),
            style: 'primary'
          },
          {
            label: 'Customize',
            action: () => console.log('Opening customization for Marcus Chen'),
            style: 'secondary'
          }
        ]
      },
      {
        id: '3',
        type: 'achievement',
        priority: 'medium',
        title: 'Learning Milestone Reached',
        message: 'Completed 50 consecutive correct reading comprehension questions!',
        studentName: 'Sophia Williams',
        studentId: 'student-3',
        brainId: 'brain-3',
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
        isRead: true
      },
      {
        id: '4',
        type: 'warning',
        priority: 'high',
        title: 'Connection Issue',
        message: 'Virtual Brain has been offline for 5 minutes. Attempting reconnection...',
        studentName: 'Isabella Martinez',
        studentId: 'student-4',
        brainId: 'brain-4',
        timestamp: new Date(Date.now() - 1000 * 60 * 45),
        isRead: false,
        actions: [
          {
            label: 'Force Reconnect',
            action: () => console.log('Force reconnecting Isabella Martinez Virtual Brain'),
            style: 'primary'
          }
        ]
      },
      {
        id: '5',
        type: 'system',
        priority: 'low',
        title: 'Weekly Report Available',
        message: 'Classroom analytics report for this week is ready for review.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
        isRead: false,
        actions: [
          {
            label: 'View Report',
            action: () => console.log('Opening weekly report'),
            style: 'secondary'
          }
        ]
      }
    ];

    setAlerts(mockAlerts);
  }, [onStudentSelect]);

  // Filter alerts based on selected filters
  useEffect(() => {
    let filtered = alerts;
    
    if (filterType !== 'all') {
      filtered = filtered.filter(alert => alert.type === filterType);
    }
    
    if (filterPriority !== 'all') {
      filtered = filtered.filter(alert => alert.priority === filterPriority);
    }

    // Sort by priority and timestamp
    const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
    filtered.sort((a, b) => {
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      return b.timestamp.getTime() - a.timestamp.getTime();
    });

    setFilteredAlerts(filtered);
  }, [alerts, filterType, filterPriority]);

  const markAsRead = (id: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === id ? { ...alert, isRead: true } : alert
    ));
  };

  const dismissAlert = (id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  const markAllAsRead = () => {
    setAlerts(prev => prev.map(alert => ({ ...alert, isRead: true })));
  };

  const getIcon = (type: Alert['type']) => {
    switch (type) {
      case 'intervention': return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'suggestion': return <Brain className="h-5 w-5 text-blue-500" />;
      case 'achievement': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'system': return <Settings className="h-5 w-5 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: Alert['priority']) => {
    switch (priority) {
      case 'urgent': return 'border-red-500 bg-red-50';
      case 'high': return 'border-orange-500 bg-orange-50';
      case 'medium': return 'border-yellow-500 bg-yellow-50';
      case 'low': return 'border-gray-500 bg-gray-50';
    }
  };

  const formatTime = (timestamp: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - timestamp.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 24 * 60) return `${Math.floor(diffMins / 60)}h ago`;
    return timestamp.toLocaleDateString();
  };

  const unreadCount = alerts.filter(a => !a.isRead).length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Bell className="h-6 w-6 text-red-500" />
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Alerts Dashboard</h2>
                <p className="text-sm text-gray-600">
                  {filteredAlerts.length} alerts • {unreadCount} unread
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Mark all read
                </button>
              )}
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mr-2">Type:</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as typeof filterType)}
                className="px-3 py-1 border border-gray-300 rounded text-sm"
              >
                <option value="all">All Types</option>
                <option value="intervention">Interventions</option>
                <option value="suggestion">Suggestions</option>
                <option value="achievement">Achievements</option>
                <option value="warning">Warnings</option>
                <option value="system">System</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mr-2">Priority:</label>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value as typeof filterPriority)}
                className="px-3 py-1 border border-gray-300 rounded text-sm"
              >
                <option value="all">All Priorities</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Alerts List */}
        <div className="max-h-96 overflow-y-auto">
          {filteredAlerts.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <CheckCircle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No alerts match your filters</p>
            </div>
          ) : (
            filteredAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 border-b border-gray-100 hover:bg-gray-50 ${
                  !alert.isRead ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    {getIcon(alert.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className={`font-medium text-gray-900 ${
                        !alert.isRead ? 'font-semibold' : ''
                      }`}>
                        {alert.title}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                          getPriorityColor(alert.priority)
                        }`}>
                          {alert.priority.toUpperCase()}
                        </span>
                        <button
                          onClick={() => dismissAlert(alert.id)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">{alert.message}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 text-xs text-gray-500">
                        {alert.studentName && <span>Student: {alert.studentName}</span>}
                        <span>{formatTime(alert.timestamp)}</span>
                      </div>
                      
                      <div className="flex space-x-2">
                        {!alert.isRead && (
                          <button
                            onClick={() => markAsRead(alert.id)}
                            className="text-xs text-blue-600 hover:text-blue-800"
                          >
                            Mark read
                          </button>
                        )}
                        
                        {alert.actions?.map((action, index) => (
                          <button
                            key={index}
                            onClick={() => {
                              action.action();
                              markAsRead(alert.id);
                            }}
                            className={`px-3 py-1 text-xs rounded font-medium ${
                              action.style === 'primary'
                                ? 'bg-blue-600 text-white hover:bg-blue-700'
                                : action.style === 'danger'
                                ? 'bg-red-600 text-white hover:bg-red-700'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                          >
                            {action.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <span>
              Showing {filteredAlerts.length} of {alerts.length} alerts
            </span>
            <button
              onClick={() => {
                setAlerts([]);
              }}
              className="text-red-600 hover:text-red-800"
            >
              Clear all alerts
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}