import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Children from './pages/Children';
import Analytics from './pages/Analytics';
import Messages from './pages/Messages';
import Billing from './pages/Billing';
import Settings from './pages/Settings';
import Reports from './pages/Reports';
import Calendar from './pages/Calendar';
import AIInsights from './pages/AIInsights';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

const App: React.FC = () => {
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route 
          path="/login" 
          element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
          } 
        />
        
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Layout>
                <Routes>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/children" element={<Children />} />
                  <Route path="/children/:childId" element={<Children />} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/messages" element={<Messages />} />
                  <Route path="/messages/:conversationId" element={<Messages />} />
                  <Route path="/billing" element={<Billing />} />
                  <Route path="/reports" element={<Reports />} />
                  <Route path="/calendar" element={<Calendar />} />
                  <Route path="/ai-insights" element={<AIInsights />} />
                  <Route path="/settings" element={<Settings />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
};

export default App;