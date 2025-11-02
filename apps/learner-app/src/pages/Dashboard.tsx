import React from 'react';
import { useUserStore } from '../stores/userStore';

const Dashboard: React.FC = () => {
  const { user } = useUserStore();
  
  if (!user) return null;

  const ageGroup = user.preferences.theme;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className={`text-3xl font-bold ${
          ageGroup === 'k5' ? 'text-k5-primary' : 
          ageGroup === 'middle' ? 'text-middle-primary' : 'text-high-primary'
        }`}>
          {ageGroup === 'k5' ? `Hi ${user.name}! 🌟` : 
           ageGroup === 'middle' ? `Welcome back, ${user.name}!` : 
           `Dashboard - ${user.name}`}
        </h1>
        <p className="text-gray-600 mt-2">
          {ageGroup === 'k5' ? "Let's learn and have fun today!" :
           ageGroup === 'middle' ? "Ready to continue your learning adventure?" :
           "Track your academic progress and goals"}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Progress Overview */}
        <div className={`p-6 rounded-${ageGroup} shadow-${ageGroup} ${
          ageGroup === 'k5' ? 'bg-k5-surface' : 
          ageGroup === 'middle' ? 'bg-middle-surface' : 'bg-high-surface'
        }`}>
          <h2 className="text-lg font-semibold mb-4">
            {ageGroup === 'k5' ? 'My Stars ⭐' : 'Progress Overview'}
          </h2>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Level {user.progress.level}</span>
                <span>{user.progress.totalPoints} points</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    ageGroup === 'k5' ? 'bg-k5-primary' : 
                    ageGroup === 'middle' ? 'bg-middle-primary' : 'bg-high-primary'
                  }`}
                  style={{ width: '65%' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className={`p-6 rounded-${ageGroup} shadow-${ageGroup} ${
          ageGroup === 'k5' ? 'bg-k5-surface' : 
          ageGroup === 'middle' ? 'bg-middle-surface' : 'bg-high-surface'
        }`}>
          <h2 className="text-lg font-semibold mb-4">
            {ageGroup === 'k5' ? 'What I Did 📚' : 'Recent Activity'}
          </h2>
          <div className="space-y-2">
            <p className="text-sm text-gray-600">Math Lesson - 95% complete</p>
            <p className="text-sm text-gray-600">Science Quiz - Completed</p>
            <p className="text-sm text-gray-600">Reading Assignment - In Progress</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className={`p-6 rounded-${ageGroup} shadow-${ageGroup} ${
          ageGroup === 'k5' ? 'bg-k5-surface' : 
          ageGroup === 'middle' ? 'bg-middle-surface' : 'bg-high-surface'
        }`}>
          <h2 className="text-lg font-semibold mb-4">
            {ageGroup === 'k5' ? 'Fun Stuff! 🎮' : 'Quick Actions'}
          </h2>
          <div className="space-y-2">
            <button className={`w-full text-left px-3 py-2 rounded-md ${
              ageGroup === 'k5' ? 'bg-k5-primary/10 hover:bg-k5-primary/20 text-k5-primary' :
              ageGroup === 'middle' ? 'bg-middle-primary/10 hover:bg-middle-primary/20 text-middle-primary' :
              'bg-high-primary/10 hover:bg-high-primary/20 text-high-primary'
            }`}>
              Continue Learning
            </button>
            <button className={`w-full text-left px-3 py-2 rounded-md ${
              ageGroup === 'k5' ? 'bg-k5-secondary/10 hover:bg-k5-secondary/20 text-k5-secondary' :
              ageGroup === 'middle' ? 'bg-middle-secondary/10 hover:bg-middle-secondary/20 text-middle-secondary' :
              'bg-high-secondary/10 hover:bg-high-secondary/20 text-high-secondary'
            }`}>
              Take Assessment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;