import React, { useState } from 'react';
import { useUserStore } from '../stores/userStore';
import { AgeGroup, Badge } from '../types';
import { 
  Volume2, 
  Type, 
  Contrast, 
  Zap, 
  Eye,
  Keyboard,
  MousePointer
} from 'lucide-react';

const Settings: React.FC = () => {
  const { user, updateAccessibilitySettings, updateUserPreferences } = useUserStore();
  const [activeTab, setActiveTab] = useState<'accessibility' | 'preferences' | 'account'>('accessibility');
  
  if (!user) return null;

  const ageGroup: AgeGroup = user.preferences.theme;
  
  const themeClasses: Record<AgeGroup, {
    container: string;
    surface: string;
    primary: string;
    text: string;
  }> = {
    k5: {
      container: 'bg-k5-background text-k5-text',
      surface: 'bg-k5-surface',
      primary: 'bg-k5-primary text-white',
      text: 'text-k5-text'
    },
    middle: {
      container: 'bg-middle-background text-middle-text',
      surface: 'bg-middle-surface',
      primary: 'bg-middle-primary text-white', 
      text: 'text-middle-text'
    },
    high: {
      container: 'bg-high-background text-high-text',
      surface: 'bg-high-surface', 
      primary: 'bg-high-primary text-white',
      text: 'text-high-text'
    }
  };

  const theme = themeClasses[ageGroup];  const tabs = [
    { id: 'accessibility', label: ageGroup === 'k5' ? 'Easy Settings 🛠️' : 'Accessibility', icon: Eye },
    { id: 'preferences', label: ageGroup === 'k5' ? 'My Favorites ⭐' : 'Preferences', icon: Zap },
    { id: 'account', label: ageGroup === 'k5' ? 'About Me 👤' : 'Account', icon: MousePointer }
  ];

  return (
    <div className={`min-h-screen ${theme.container}`}>
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className={`text-3xl font-bold mb-8 ${
          ageGroup === 'k5' ? 'text-k5-primary' : 
          ageGroup === 'middle' ? 'text-middle-primary' : 'text-high-primary'
        }`}>
          {ageGroup === 'k5' ? 'My Settings 🛠️' : 'Settings'}
        </h1>

        {/* Tab Navigation */}
        <div className={`flex space-x-4 mb-8 p-2 ${theme.surface} rounded-lg`}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'accessibility' | 'preferences' | 'account')}
                className={`flex items-center space-x-2 px-4 py-3 rounded-md transition-colors ${
                  activeTab === tab.id 
                    ? theme.primary 
                    : `${theme.text} hover:bg-gray-100`
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Accessibility Tab */}
        {activeTab === 'accessibility' && (
          <div className={`${theme.surface} rounded-lg p-6 space-y-8`}>
            <h2 className="text-xl font-semibold mb-4">
              {ageGroup === 'k5' ? 'Make it just right for you! 🎯' : 'Accessibility Settings'}
            </h2>

            {/* Font Size */}
            <div className="space-y-3">
              <label className="flex items-center space-x-2 font-medium">
                <Type className="w-5 h-5" />
                <span>{ageGroup === 'k5' ? 'Text Size 📏' : 'Font Size'}</span>
              </label>
              <div className="flex space-x-3">
                {['small', 'medium', 'large', 'extra-large'].map((size) => (
                  <button
                    key={size}
                    onClick={() => updateAccessibilitySettings({ fontSize: size as 'small' | 'medium' | 'large' | 'extra-large' })}
                    className={`px-4 py-2 rounded-md border transition-colors ${
                      user.preferences.accessibility.fontSize === size
                        ? theme.primary
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {size === 'small' && 'Aa'}
                    {size === 'medium' && 'Aa'}
                    {size === 'large' && 'Aa'}
                    {size === 'extra-large' && 'Aa'}
                  </button>
                ))}
              </div>
            </div>

            {/* High Contrast */}
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 font-medium">
                <Contrast className="w-5 h-5" />
                <span>{ageGroup === 'k5' ? 'Extra Clear Colors 🌈' : 'High Contrast Mode'}</span>
              </label>
              <button
                onClick={() => updateAccessibilitySettings({ 
                  highContrast: !user.preferences.accessibility.highContrast 
                })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  user.preferences.accessibility.highContrast ? theme.primary : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    user.preferences.accessibility.highContrast ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Reduced Motion */}
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 font-medium">
                <Zap className="w-5 h-5" />
                <span>{ageGroup === 'k5' ? 'Gentle Animations 🌊' : 'Reduce Motion'}</span>
              </label>
              <button
                onClick={() => updateAccessibilitySettings({ 
                  reducedMotion: !user.preferences.accessibility.reducedMotion 
                })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  user.preferences.accessibility.reducedMotion ? theme.primary : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    user.preferences.accessibility.reducedMotion ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Keyboard Navigation */}
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 font-medium">
                <Keyboard className="w-5 h-5" />
                <span>{ageGroup === 'k5' ? 'Keyboard Helper 💻' : 'Keyboard Navigation'}</span>
              </label>
              <button
                onClick={() => updateAccessibilitySettings({ 
                  keyboardNavigation: !user.preferences.accessibility.keyboardNavigation 
                })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  user.preferences.accessibility.keyboardNavigation ? theme.primary : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    user.preferences.accessibility.keyboardNavigation ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Screen Reader */}
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 font-medium">
                <Volume2 className="w-5 h-5" />
                <span>{ageGroup === 'k5' ? 'Read Aloud Helper 🔊' : 'Screen Reader Support'}</span>
              </label>
              <button
                onClick={() => updateAccessibilitySettings({ 
                  screenReader: !user.preferences.accessibility.screenReader 
                })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  user.preferences.accessibility.screenReader ? theme.primary : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    user.preferences.accessibility.screenReader ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        )}

        {/* Preferences Tab */}
        {activeTab === 'preferences' && (
          <div className={`${theme.surface} rounded-lg p-6 space-y-6`}>
            <h2 className="text-xl font-semibold mb-4">
              {ageGroup === 'k5' ? 'Choose Your Style! 🎨' : 'App Preferences'}
            </h2>

            {/* Theme Selection */}
            <div className="space-y-3">
              <label className="font-medium">
                {ageGroup === 'k5' ? 'Pick Your Theme! 🌟' : 'Theme'}
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { id: 'k5', name: 'Elementary Explorer', age: 'K-5', colors: ['bg-red-400', 'bg-teal-400', 'bg-yellow-400'] },
                  { id: 'middle', name: 'Middle School Modern', age: '6-8', colors: ['bg-purple-400', 'bg-indigo-400', 'bg-pink-400'] },
                  { id: 'high', name: 'High School Professional', age: '9-12', colors: ['bg-blue-500', 'bg-slate-700', 'bg-cyan-400'] }
                ].map((themeOption) => (
                  <button
                    key={themeOption.id}
                    onClick={() => updateUserPreferences({ theme: themeOption.id as AgeGroup })}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      user.preferences.theme === themeOption.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex space-x-2 mb-2">
                      {themeOption.colors.map((color, index) => (
                        <div key={index} className={`w-4 h-4 rounded-full ${color}`} />
                      ))}
                    </div>
                    <h3 className="font-medium">{themeOption.name}</h3>
                    <p className="text-sm text-gray-500">{themeOption.age}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Language */}
            <div className="space-y-3">
              <label className="font-medium">
                {ageGroup === 'k5' ? 'Language 🌍' : 'Language'}
              </label>
              <select 
                value={user.preferences.language}
                onChange={(e) => updateUserPreferences({ language: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="en-US">English (US)</option>
                <option value="en-GB">English (UK)</option>
                <option value="es-ES">Español</option>
                <option value="fr-FR">Français</option>
                <option value="de-DE">Deutsch</option>
              </select>
            </div>

            {/* Notifications */}
            <div className="flex items-center justify-between">
              <label className="font-medium">
                {ageGroup === 'k5' ? 'Helpful Reminders 🔔' : 'Notifications'}
              </label>
              <button
                onClick={() => updateUserPreferences({ 
                  notifications: !user.preferences.notifications 
                })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  user.preferences.notifications ? theme.primary : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    user.preferences.notifications ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        )}

        {/* Account Tab */}
        {activeTab === 'account' && (
          <div className={`${theme.surface} rounded-lg p-6 space-y-6`}>
            <h2 className="text-xl font-semibold mb-4">
              {ageGroup === 'k5' ? 'About You! 👋' : 'Account Information'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block font-medium mb-2">
                  {ageGroup === 'k5' ? 'Your Name 📝' : 'Name'}
                </label>
                <input
                  type="text"
                  value={user.name}
                  readOnly
                  className="w-full p-3 border border-gray-300 rounded-md bg-gray-50"
                />
              </div>

              <div>
                <label className="block font-medium mb-2">
                  {ageGroup === 'k5' ? 'Your Grade 🎒' : 'Grade Level'}
                </label>
                <input
                  type="number"
                  value={user.gradeLevel}
                  readOnly
                  className="w-full p-3 border border-gray-300 rounded-md bg-gray-50"
                />
              </div>

              <div>
                <label className="block font-medium mb-2">
                  {ageGroup === 'k5' ? 'Your Points ⭐' : 'Total Points'}
                </label>
                <input
                  type="text"
                  value={user.progress.totalPoints.toLocaleString()}
                  readOnly
                  className="w-full p-3 border border-gray-300 rounded-md bg-gray-50"
                />
              </div>

              <div>
                <label className="block font-medium mb-2">
                  {ageGroup === 'k5' ? 'Your Level 🚀' : 'Current Level'}
                </label>
                <input
                  type="text"
                  value={user.progress.level}
                  readOnly
                  className="w-full p-3 border border-gray-300 rounded-md bg-gray-50"
                />
              </div>
            </div>

            {ageGroup === 'k5' && (
              <div className="mt-6">
                <h3 className="font-medium mb-3">Your Awesome Badges! 🏆</h3>
                <div className="grid grid-cols-4 gap-4">
                  {user.progress.badges.slice(0, 8).map((badge: Badge, index: number) => (
                    <div key={index} className="text-center p-2">
                      <div className="text-2xl mb-1">🏆</div>
                      <div className="text-xs text-gray-600">{badge.name}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;