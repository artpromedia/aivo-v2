import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useUserStore } from '../stores/userStore';
import { 
  Home, 
  BookOpen, 
  FileText, 
  TrendingUp, 
  User, 
  Settings, 
  Menu, 
  X
} from 'lucide-react';

export const Navigation: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useUserStore();
  const location = useLocation();
  
  if (!user) return null;

  const ageGroup = user.preferences.theme;
  
  const navigationItems = [
    { 
      path: '/dashboard', 
      icon: Home, 
      label: ageGroup === 'k5' ? 'Home 🏠' : 'Dashboard'
    },
    { 
      path: '/lessons', 
      icon: BookOpen, 
      label: ageGroup === 'k5' ? 'Learn & Play 🎮' : ageGroup === 'middle' ? 'Lessons' : 'Coursework'
    },
    { 
      path: '/assessments', 
      icon: FileText, 
      label: ageGroup === 'k5' ? 'Fun Quizzes 🧩' : ageGroup === 'middle' ? 'Tests' : 'Assessments'
    },
    { 
      path: '/progress', 
      icon: TrendingUp, 
      label: ageGroup === 'k5' ? 'My Stars ⭐' : 'Progress'
    },
    { 
      path: '/profile', 
      icon: User, 
      label: ageGroup === 'k5' ? 'About Me 👤' : 'Profile'
    },
    { 
      path: '/settings', 
      icon: Settings, 
      label: ageGroup === 'k5' ? 'Settings 🛠️' : 'Settings'
    }
  ];

  const getThemeClasses = () => {
    switch (ageGroup) {
      case 'k5':
        return {
          bg: 'bg-k5-primary',
          text: 'text-white',
          activeLink: 'bg-k5-accent text-k5-text',
          link: 'text-white hover:bg-k5-secondary'
        };
      case 'middle':
        return {
          bg: 'bg-middle-primary',
          text: 'text-white',
          activeLink: 'bg-middle-accent text-middle-text',
          link: 'text-white hover:bg-middle-secondary'
        };
      default:
        return {
          bg: 'bg-high-primary',
          text: 'text-white',
          activeLink: 'bg-high-accent text-high-text',
          link: 'text-white hover:bg-high-secondary'
        };
    }
  };

  const theme = getThemeClasses();

  return (
    <>
      {/* Mobile Header */}
      <div className={`md:hidden ${theme.bg} p-4 flex items-center justify-between`}>
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
            <span className="text-lg font-bold text-blue-600">A</span>
          </div>
          <h1 className={`${theme.text} font-bold text-lg`}>
            {ageGroup === 'k5' ? 'Aivo Fun!' : 'Aivo'}
          </h1>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`${theme.text} p-2 rounded-md hover:bg-black/20`}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsOpen(false)}
          />
          <div className={`absolute top-0 left-0 w-80 h-full ${theme.bg} shadow-lg`}>
            <div className="p-4">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                    <span className="text-lg font-bold text-blue-600">A</span>
                  </div>
                  <h1 className={`${theme.text} font-bold text-lg`}>
                    {ageGroup === 'k5' ? 'Aivo Fun!' : 'Aivo'}
                  </h1>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className={`${theme.text} p-2 rounded-md hover:bg-black/20`}
                >
                  <X size={24} />
                </button>
              </div>

              <nav className="space-y-2">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                        isActive ? theme.activeLink : theme.link
                      }`}
                    >
                      <Icon size={ageGroup === 'k5' ? 24 : 20} />
                      <span className={`font-medium ${
                        ageGroup === 'k5' ? 'text-lg' : 'text-base'
                      }`}>
                        {item.label}
                      </span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className={`hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 ${theme.bg}`}>
        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4 mb-6">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <span className="text-xl font-bold text-blue-600">A</span>
            </div>
            <h1 className={`ml-3 ${theme.text} font-bold text-xl`}>
              {ageGroup === 'k5' ? 'Aivo Fun!' : 'Aivo'}
            </h1>
          </div>

          <nav className="flex-1 px-4 space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive ? theme.activeLink : theme.link
                  }`}
                >
                  <Icon size={ageGroup === 'k5' ? 24 : 20} />
                  <span className={`font-medium ${
                    ageGroup === 'k5' ? 'text-lg' : 'text-base'
                  }`}>
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </>
  );
};