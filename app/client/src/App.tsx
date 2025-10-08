import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { SetupProvider, useSetup } from './contexts/SetupContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './components/Layout/MainLayout';
import Setup from './pages/Setup/Setup';
import Login from './pages/Login/Login';
import Dashboard from './pages/Dashboard/Dashboard';
import Users from './pages/Admin/Users';
import Roles from './pages/Admin/Roles';
import Settings from './pages/Settings/Settings';
import Projects from './pages/Projects/Projects';
import { useTranslation } from 'react-i18next';

const AppRoutes: React.FC = () => {
  const { setupStatus, loading } = useSetup();
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  // Redirect to setup if not completed
  if (setupStatus && !setupStatus.isCompleted) {
    return (
      <Routes>
        <Route path="/setup" element={<Setup />} />
        <Route path="*" element={<Navigate to="/setup" replace />} />
      </Routes>
    );
  }

  // Normal app routes after setup is complete
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Routes>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/tasks" element={<div className="p-8"><h1 className="text-2xl font-bold">Tâches</h1></div>} />
                <Route path="/team" element={<div className="p-8"><h1 className="text-2xl font-bold">Équipe</h1></div>} />
                <Route path="/admin/users" element={<Users />} />
                <Route path="/admin/roles" element={<Roles />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </MainLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

function App() {
  return (
    <Router>
      <SetupProvider>
        <ThemeProvider>
          <AppRoutes />
        </ThemeProvider>
      </SetupProvider>
    </Router>
  );
}

export default App;
