import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { SetupProvider, useSetup } from './contexts/SetupContext';
import ProtectedRoute from './components/ProtectedRoute';
import Setup from './pages/Setup/Setup';
import Login from './pages/Login/Login';
import Dashboard from './pages/Dashboard/Dashboard';

const AppRoutes: React.FC = () => {
  const { setupStatus, loading } = useSetup();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Chargement...</p>
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
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <Router>
      <SetupProvider>
        <AppRoutes />
      </SetupProvider>
    </Router>
  );
}

export default App;
