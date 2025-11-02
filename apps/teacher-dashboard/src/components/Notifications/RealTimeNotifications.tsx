import { useState, useEffect } from 'react';
import { X, Bell, AlertTriangle, CheckCircle, Info, Brain } from 'lucide-react';

interface Notification {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info' | 'brain-alert';
  title: string;
  message: string;
  timestamp: Date;
  studentName?: string;
  brainId?: string;
  isRead: boolean;
  actions?: {
    label: string;
    action: () => void;
    style: 'primary' | 'secondary' | 'danger';
  }[];
}

interface RealTimeNotificationsProps {
  isEnabled: boolean;
}

export function RealTimeNotifications({ isEnabled }: RealTimeNotificationsProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Simulate real-time notifications
  useEffect(() => {
    if (!isEnabled) return;

    const generateNotification = () => {
      const notificationTypes = [
        {
          type: 'brain-alert' as const,
          title: 'Focus Drop Alert',
          message: 'Focus level dropped to 35%, intervention recommended',
          studentName: 'Emma Johnson'
        },
        {
          type: 'success' as const,
          title: 'Learning Milestone',
          message: 'Completed 25 consecutive correct math problems',
          studentName: 'Marcus Chen'
        },
        {
          type: 'warning' as const,
          title: 'Adaptation Needed',
          message: 'Current difficulty level too easy, suggest increase',
          studentName: 'Sophia Williams'
        },
        {
          type: 'info' as const,
          title: 'IEP Review Due',
          message: 'Quarterly IEP review scheduled for next week',
          studentName: 'Alex Rodriguez'
        },
        {
          type: 'error' as const,
          title: 'Connection Issue',
          message: 'Virtual Brain temporarily disconnected',
          studentName: 'Isabella Martinez'
        }
      ];

      const template = notificationTypes[Math.floor(Math.random() * notificationTypes.length)];
      
      const newNotification: Notification = {
        id: Date.now().toString(),
        ...template,
        timestamp: new Date(),
        brainId: `brain-${Math.floor(Math.random() * 100)}`,
        isRead: false,
        actions: template.type === 'brain-alert' ? [
          {
            label: 'Send Break',
            action: () => alert(`Sending break suggestion to ${template.studentName}`),
            style: 'primary'
          },
          {
            label: 'View Brain',
            action: () => alert(`Opening ${template.studentName}'s Virtual Brain monitor`),
            style: 'secondary'
          }
        ] : template.type === 'warning' ? [
          {
            label: 'Apply',
            action: () => alert(`Applying suggested adaptation for ${template.studentName}`),
            style: 'primary'
          },
          {
            label: 'Modify',
            action: () => alert(`Opening modification dialog for ${template.studentName}`),
            style: 'secondary'
          }
        ] : undefined
      };

      setNotifications(prev => [newNotification, ...prev.slice(0, 19)]); // Keep last 20
      setUnreadCount(prev => prev + 1);
    };

    // Generate initial notification
    generateNotification();

    const interval = setInterval(generateNotification, 8000 + Math.random() * 12000);
    return () => clearInterval(interval);
  }, [isEnabled]);

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, isRead: true } : notif
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })));
    setUnreadCount(0);
  };

  const dismissNotification = (id: string) => {
    const notification = notifications.find(n => n.id === id);
    if (notification && !notification.isRead) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'error': return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'info': return <Info className="h-5 w-5 text-blue-500" />;
      case 'brain-alert': return <Brain className="h-5 w-5 text-purple-500" />;
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

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="relative p-2 text-purple-200 hover:text-white rounded-lg hover:bg-white hover:bg-opacity-10 transition-colors"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Panel */}
      {isVisible && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-xl shadow-xl border border-gray-200 max-h-96 overflow-hidden z-50">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Notifications</h3>
              <div className="flex items-center space-x-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => setIsVisible(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
          
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p>No notifications</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-gray-100 hover:bg-gray-50 ${
                    !notification.isRead ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className={`text-sm font-medium text-gray-900 ${
                          !notification.isRead ? 'font-semibold' : ''
                        }`}>
                          {notification.title}
                        </h4>
                        <div className="flex items-center space-x-2">
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full" />
                          )}
                          <button
                            onClick={() => dismissNotification(notification.id)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 text-xs text-gray-500">
                          {notification.studentName && (
                            <span>{notification.studentName}</span>
                          )}
                          <span>{formatTime(notification.timestamp)}</span>
                        </div>
                        
                        {!notification.isRead && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="text-xs text-blue-600 hover:text-blue-800"
                          >
                            Mark read
                          </button>
                        )}
                      </div>
                      
                      {notification.actions && (
                        <div className="flex space-x-2 mt-3">
                          {notification.actions.map((action, index) => (
                            <button
                              key={index}
                              onClick={() => {
                                action.action();
                                markAsRead(notification.id);
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
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}