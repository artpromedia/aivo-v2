import React, { useState } from 'react';
import { User, Mail, Lock, Bell, Settings, Eye, EyeOff, Camera, Save, Shield } from 'lucide-react';

export function TeacherProfileSettings() {
  const [activeSection, setActiveSection] = useState<'profile' | 'security' | 'notifications' | 'preferences'>('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);

  const handleChangePhoto = () => {
    console.log('Changing teacher profile photo');
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        if (file.size > 2 * 1024 * 1024) {
          alert('File size must be less than 2MB');
          return;
        }
        console.log('Profile photo selected:', file.name);
        // In production: upload to cloud storage and update teacher profile
        alert(`Profile photo "${file.name}" will be uploaded. Photo update functionality will be implemented with backend integration.`);
      }
    };
    input.click();
  };

  // Mock teacher data - replace with actual auth context
  const [teacherData, setTeacherData] = useState({
    firstName: 'Arka',
    lastName: 'Johnson',
    email: 'arka.johnson@school.edu',
    phone: '+1 (555) 123-4567',
    school: 'Riverside Elementary',
    grade: '3rd Grade',
    subjects: ['Mathematics', 'Science', 'Reading'],
    avatar: '👋',
    joinDate: '2023-08-15'
  });

  const [securityData, setSecurityData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactorEnabled: true,
    lastPasswordChange: '2025-09-15'
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    weeklyReports: true,
    studentProgress: true,
    iepUpdates: true,
    brainSuggestions: true,
    parentMessages: true
  });

  const handleSaveProfile = () => {
    // Save profile data
    alert('Profile updated successfully!');
  };

  const handleChangePassword = () => {
    if (securityData.newPassword !== securityData.confirmPassword) {
      alert('New passwords do not match!');
      return;
    }
    // Change password logic
    alert('Password changed successfully!');
    setSecurityData(prev => ({
      ...prev,
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }));
  };

  const renderProfile = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Personal Information</h3>
        
        {/* Avatar Section */}
        <div className="flex items-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-3xl mr-6">
            {teacherData.avatar}
          </div>
          <div>
            <button 
              onClick={handleChangePhoto}
              className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Camera className="h-4 w-4 mr-2" />
              Change Photo
            </button>
            <p className="text-sm text-gray-500 mt-1">JPG, GIF or PNG. Max size of 2MB.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
            <input
              type="text"
              value={teacherData.firstName}
              onChange={(e) => setTeacherData(prev => ({ ...prev, firstName: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
            <input
              type="text"
              value={teacherData.lastName}
              onChange={(e) => setTeacherData(prev => ({ ...prev, lastName: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={teacherData.email}
              onChange={(e) => setTeacherData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
            <input
              type="tel"
              value={teacherData.phone}
              onChange={(e) => setTeacherData(prev => ({ ...prev, phone: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">School</label>
            <input
              type="text"
              value={teacherData.school}
              onChange={(e) => setTeacherData(prev => ({ ...prev, school: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Grade Level</label>
            <select
              value={teacherData.grade}
              onChange={(e) => setTeacherData(prev => ({ ...prev, grade: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="K">Kindergarten</option>
              <option value="1st Grade">1st Grade</option>
              <option value="2nd Grade">2nd Grade</option>
              <option value="3rd Grade">3rd Grade</option>
              <option value="4th Grade">4th Grade</option>
              <option value="5th Grade">5th Grade</option>
            </select>
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Subjects Taught</label>
          <div className="flex flex-wrap gap-2">
            {['Mathematics', 'Science', 'Reading', 'Writing', 'Social Studies', 'Art', 'Music', 'Physical Education'].map((subject) => (
              <label key={subject} className="flex items-center">
                <input
                  type="checkbox"
                  checked={teacherData.subjects.includes(subject)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setTeacherData(prev => ({ ...prev, subjects: [...prev.subjects, subject] }));
                    } else {
                      setTeacherData(prev => ({ ...prev, subjects: prev.subjects.filter(s => s !== subject) }));
                    }
                  }}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded mr-2"
                />
                <span className="text-sm text-gray-700">{subject}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            onClick={handleSaveProfile}
            className="flex items-center px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );

  const renderSecurity = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Password & Security</h3>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
            <div className="relative">
              <input
                type={showCurrentPassword ? "text" : "password"}
                value={securityData.currentPassword}
                onChange={(e) => setSecurityData(prev => ({ ...prev, currentPassword: e.target.value }))}
                className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={securityData.newPassword}
                onChange={(e) => setSecurityData(prev => ({ ...prev, newPassword: e.target.value }))}
                className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
            <input
              type="password"
              value={securityData.confirmPassword}
              onChange={(e) => setSecurityData(prev => ({ ...prev, confirmPassword: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <Shield className="h-5 w-5 text-purple-600 mr-3" />
              <div>
                <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                <p className="text-sm text-gray-600">Add an extra layer of security</p>
              </div>
            </div>
            <button
              onClick={() => setSecurityData(prev => ({ ...prev, twoFactorEnabled: !prev.twoFactorEnabled }))}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                securityData.twoFactorEnabled ? 'bg-purple-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  securityData.twoFactorEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="text-sm text-gray-600">
            Last password change: {new Date(securityData.lastPasswordChange).toLocaleDateString()}
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleChangePassword}
              className="flex items-center px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Lock className="h-4 w-4 mr-2" />
              Update Password
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotifications = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Notification Preferences</h3>
        
        <div className="space-y-6">
          {[
            { key: 'emailNotifications', label: 'Email Notifications', description: 'Receive notifications via email' },
            { key: 'pushNotifications', label: 'Push Notifications', description: 'Receive push notifications in browser' },
            { key: 'weeklyReports', label: 'Weekly Reports', description: 'Get weekly classroom summary reports' },
            { key: 'studentProgress', label: 'Student Progress Alerts', description: 'Notifications about student achievements and concerns' },
            { key: 'iepUpdates', label: 'IEP Updates', description: 'Notifications about IEP goal progress and reviews' },
            { key: 'brainSuggestions', label: 'Virtual Brain Suggestions', description: 'Alerts when Virtual Brains make adaptation suggestions' },
            { key: 'parentMessages', label: 'Parent Messages', description: 'Notifications when parents send messages' }
          ].map((setting) => (
            <div key={setting.key} className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">{setting.label}</p>
                <p className="text-sm text-gray-600">{setting.description}</p>
              </div>
              <button
                onClick={() => setNotificationSettings(prev => ({ 
                  ...prev, 
                  [setting.key]: !prev[setting.key as keyof typeof prev] 
                }))}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                  notificationSettings[setting.key as keyof typeof notificationSettings] ? 'bg-purple-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    notificationSettings[setting.key as keyof typeof notificationSettings] ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderPreferences = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Classroom Preferences</h3>
        <div className="text-center py-12">
          <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Classroom and system preferences will be available here.</p>
        </div>
      </div>
    </div>
  );

  const sections = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'preferences', label: 'Preferences', icon: Settings }
  ];

  return (
    <div className="p-8">
      <div className="flex items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Profile & Settings</h1>
      </div>

      <div className="flex space-x-8">
        {/* Sidebar Navigation */}
        <div className="w-64 space-y-2">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id as any)}
                className={`w-full flex items-center px-4 py-3 text-left rounded-xl transition-colors ${
                  activeSection === section.id
                    ? 'bg-purple-100 text-purple-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="h-5 w-5 mr-3" />
                {section.label}
              </button>
            );
          })}
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {activeSection === 'profile' && renderProfile()}
          {activeSection === 'security' && renderSecurity()}
          {activeSection === 'notifications' && renderNotifications()}
          {activeSection === 'preferences' && renderPreferences()}
        </div>
      </div>
    </div>
  );
}