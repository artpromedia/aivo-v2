import React from 'react';
import { 
  TrendingUp, 
  Clock, 
  Trophy, 
  BookOpen, 
  Users, 
  MessageSquare,
  Calendar,
  AlertCircle,
  CheckCircle,
  Star,
  ArrowRight
} from 'lucide-react';
import { useChildrenStore } from '../stores/childrenStore';
import { useNotificationStore } from '../stores/notificationStore';

const Dashboard: React.FC = () => {
  const { selectedChild, getActiveChildren } = useChildrenStore();
  const { getUnreadNotifications } = useNotificationStore();
  
  const activeChildren = getActiveChildren();
  const recentNotifications = getUnreadNotifications().slice(0, 5);
  
  // Mock data for demonstration
  const weeklyStats = {
    totalLessons: 32,
    totalTime: 240, // minutes
    averageScore: 87,
    streakDays: 5
  };

  const recentAchievements = [
    { id: 1, childName: 'Emma', achievement: 'Math Whiz', icon: '🏆', time: '2 hours ago' },
    { id: 2, childName: 'Lucas', achievement: 'Reading Champion', icon: '📚', time: '1 day ago' },
    { id: 3, childName: 'Emma', achievement: '5-Day Streak', icon: '🔥', time: '2 days ago' }
  ];

  const upcomingEvents = [
    { id: 1, title: 'Math Assessment', child: 'Emma', date: 'Today 3:00 PM', type: 'assessment' },
    { id: 2, title: 'Parent-Teacher Meeting', child: 'Lucas', date: 'Tomorrow 2:00 PM', type: 'meeting' },
    { id: 3, title: 'Science Project Due', child: 'Emma', date: 'Friday 5:00 PM', type: 'assignment' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            {selectedChild ? `Viewing ${selectedChild.name}'s progress` : `Overview of all ${activeChildren.length} children`}
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button className="btn-primary">
            <MessageSquare className="w-4 h-4 mr-2" />
            Messages
          </button>
          <button className="btn-secondary">
            <Calendar className="w-4 h-4 mr-2" />
            Calendar
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="p-2 bg-primary-100 rounded-lg">
                <BookOpen className="w-6 h-6 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">This Week</p>
                <p className="text-2xl font-semibold text-gray-900">{weeklyStats.totalLessons}</p>
                <p className="text-xs text-gray-500">Lessons completed</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="p-2 bg-success-100 rounded-lg">
                <Clock className="w-6 h-6 text-success-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Learning Time</p>
                <p className="text-2xl font-semibold text-gray-900">{Math.floor(weeklyStats.totalTime / 60)}h {weeklyStats.totalTime % 60}m</p>
                <p className="text-xs text-gray-500">This week</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="p-2 bg-warning-100 rounded-lg">
                <Trophy className="w-6 h-6 text-warning-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Average Score</p>
                <p className="text-2xl font-semibold text-gray-900">{weeklyStats.averageScore}%</p>
                <p className="text-xs text-success-500">↑ +5% from last week</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="p-2 bg-danger-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-danger-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Streak</p>
                <p className="text-2xl font-semibold text-gray-900">{weeklyStats.streakDays}</p>
                <p className="text-xs text-gray-500">Days in a row</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Children Overview */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900">Children Overview</h3>
              <p className="text-sm text-gray-500">Track progress across all your children</p>
            </div>
            <div className="card-content">
              <div className="space-y-4">
                {activeChildren.map((child: any) => (
                  <div key={child.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <img
                        src={child.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(child.name)}&size=40&background=6366f1&color=ffffff`}
                        alt={child.name}
                        className="w-10 h-10 rounded-full"
                      />
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">{child.name}</h4>
                        <p className="text-xs text-gray-500">Grade {child.gradeLevel} • {child.ageGroup.toUpperCase()}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-6 text-sm">
                      <div className="text-center">
                        <p className="font-medium text-gray-900">{child.progress.totalLessonsCompleted}</p>
                        <p className="text-xs text-gray-500">Lessons</p>
                      </div>
                      <div className="text-center">
                        <p className="font-medium text-gray-900">{child.progress.averageScore}%</p>
                        <p className="text-xs text-gray-500">Average</p>
                      </div>
                      <div className="text-center">
                        <p className="font-medium text-gray-900">{child.progress.currentStreak}</p>
                        <p className="text-xs text-gray-500">Streak</p>
                      </div>
                      <button className="text-primary-600 hover:text-primary-700">
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="space-y-6">
          {/* Recent Achievements */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900">Recent Achievements</h3>
            </div>
            <div className="card-content">
              <div className="space-y-3">
                {recentAchievements.map((achievement: any) => (
                  <div key={achievement.id} className="flex items-center space-x-3">
                    <span className="text-2xl">{achievement.icon}</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {achievement.childName} earned "{achievement.achievement}"
                      </p>
                      <p className="text-xs text-gray-500">{achievement.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900">Upcoming Events</h3>
            </div>
            <div className="card-content">
              <div className="space-y-3">
                {upcomingEvents.map((event: any) => (
                  <div key={event.id} className="flex items-start space-x-3">
                    <div className={`p-1 rounded ${
                      event.type === 'assessment' ? 'bg-warning-100' : 
                      event.type === 'meeting' ? 'bg-primary-100' : 'bg-success-100'
                    }`}>
                      {event.type === 'assessment' ? (
                        <AlertCircle className={`w-4 h-4 ${
                          event.type === 'assessment' ? 'text-warning-600' : 
                          event.type === 'meeting' ? 'text-primary-600' : 'text-success-600'
                        }`} />
                      ) : event.type === 'meeting' ? (
                        <Users className="w-4 h-4 text-primary-600" />
                      ) : (
                        <CheckCircle className="w-4 h-4 text-success-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{event.title}</p>
                      <p className="text-xs text-gray-500">{event.child} • {event.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
            </div>
            <div className="card-content">
              <div className="space-y-2">
                <button className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-gray-50 transition-colors">
                  📊 Generate Progress Report
                </button>
                <button className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-gray-50 transition-colors">
                  ⚙️ Set Learning Goals
                </button>
                <button className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-gray-50 transition-colors">
                  👨‍🏫 Message Teacher
                </button>
                <button className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-gray-50 transition-colors">
                  📅 Schedule Assessment
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Notifications */}
      {recentNotifications.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Recent Notifications</h3>
          </div>
          <div className="card-content">
            <div className="space-y-3">
              {recentNotifications.map((notification: any) => (
                <div key={notification.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className={`p-1 rounded-full ${
                    notification.priority === 'high' ? 'bg-red-100' :
                    notification.priority === 'medium' ? 'bg-yellow-100' : 'bg-blue-100'
                  }`}>
                    <Star className={`w-4 h-4 ${
                      notification.priority === 'high' ? 'text-red-600' :
                      notification.priority === 'medium' ? 'text-yellow-600' : 'text-blue-600'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                    <p className="text-xs text-gray-500">{notification.message}</p>
                  </div>
                  <div className="text-xs text-gray-400">
                    {new Date(notification.createdAt).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;