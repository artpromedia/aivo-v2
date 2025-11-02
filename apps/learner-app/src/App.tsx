import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useUserStore } from './stores/userStore';
import { useOfflineStore } from './stores/offlineStore';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LoadingSpinner } from './components/LoadingSpinner';
import { Navigation } from './components/Navigation';
import { SkipLink } from './components/SkipLink';

// Lazy load pages
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Lessons = React.lazy(() => import('./pages/Lessons'));
const LessonViewer = React.lazy(() => import('./pages/LessonViewer'));
const Assessments = React.lazy(() => import('./pages/Assessments'));
const AssessmentViewer = React.lazy(() => import('./pages/AssessmentViewer'));
const BaselineAssessment = React.lazy(() => import('./pages/BaselineAssessment'));
const Progress = React.lazy(() => import('./pages/Progress'));
const Profile = React.lazy(() => import('./pages/Profile'));
const Settings = React.lazy(() => import('./pages/Settings'));
const Login = React.lazy(() => import('./pages/Login'));
const Welcome = React.lazy(() => import('./pages/Welcome'));

function App() {
  const { user, isAuthenticated } = useUserStore();
  const { setOnlineStatus } = useOfflineStore();

  useEffect(() => {
    // Initialize online status
    setOnlineStatus(navigator.onLine);
    
    // Apply saved theme and accessibility settings
    if (user) {
      document.documentElement.className = `theme-${user.preferences.theme}`;
      
      // Apply accessibility settings
      if (user.preferences.accessibility.fontSize !== 'medium') {
        document.documentElement.style.setProperty('--accessibility-font-size', 
          user.preferences.accessibility.fontSize === 'small' ? '0.875rem' :
          user.preferences.accessibility.fontSize === 'large' ? '1.125rem' : '1.25rem'
        );
      }
      
      if (user.preferences.accessibility.highContrast) {
        document.body.classList.add('high-contrast');
      }
      
      if (user.preferences.accessibility.reducedMotion) {
        document.body.classList.add('reduced-motion');
      }
    }
  }, [user, setOnlineStatus]);

  if (!isAuthenticated) {
    return (
      <Router>
        <ErrorBoundary>
          <SkipLink />
          <React.Suspense fallback={<LoadingSpinner />}>
            <Routes>
              <Route path="/welcome" element={<Welcome />} />
              <Route path="/login" element={<Login />} />
              <Route path="*" element={<Navigate to="/welcome" replace />} />
            </Routes>
          </React.Suspense>
        </ErrorBoundary>
      </Router>
    );
  }

  return (
    <Router>
      <ErrorBoundary>
        <SkipLink />
        <div className={`min-h-screen ${user?.preferences.theme === 'k5' ? 'bg-k5-background' : 
          user?.preferences.theme === 'middle' ? 'bg-middle-background' : 'bg-high-background'}`}>
          <Navigation />
          
          <main id="main-content" className="pb-20 md:pb-0 md:pl-64">
            <React.Suspense fallback={<LoadingSpinner />}>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/lessons" element={<Lessons />} />
                <Route path="/lessons/:id" element={<LessonViewer />} />
                <Route path="/assessments" element={<Assessments />} />
                <Route path="/assessments/:id" element={<AssessmentViewer />} />
                <Route path="/assessment/baseline" element={<BaselineAssessment />} />
                <Route path="/progress" element={<Progress />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </React.Suspense>
          </main>
        </div>
      </ErrorBoundary>
    </Router>
  );
}

export default App;