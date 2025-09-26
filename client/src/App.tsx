import React from 'react';
import AppLayout from './components/Layout/AppLayout';
import Dashboard from './pages/Dashboard/Dashboard';
import './styles/globals.css';

function App() {
  return (
    <AppLayout>
      <Dashboard />
    </AppLayout>
  );
}

export default App;
