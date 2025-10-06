import React, { useState } from 'react';
import Sidebar from '../Sidebar/Sidebar';
import LanguageSwitcher from '../LanguageSwitcher/LanguageSwitcher';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      <main className="flex-1 overflow-auto bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
        <div className="absolute top-4 right-4 z-10">
          <LanguageSwitcher />
        </div>
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
