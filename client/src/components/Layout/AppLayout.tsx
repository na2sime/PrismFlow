import React from 'react';
import { motion } from 'framer-motion';
import DockTailwind from '../Dock/DockTailwind';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <div className="relative h-full w-full overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      {/* Main content area */}
      <motion.main
        className="h-full px-8 py-8 pb-32 overflow-y-auto overflow-x-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.6,
          ease: [0.4, 0.0, 0.2, 1]
        }}
      >
        <div className="max-w-7xl mx-auto h-full">
          {children}
        </div>
      </motion.main>

      {/* macOS-style Dock */}
      <DockTailwind />

      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-blue-400/20 rounded-full filter blur-3xl animate-pulse" />
        <div className="absolute top-1/2 -right-32 w-64 h-64 bg-purple-400/20 rounded-full filter blur-3xl animate-pulse animation-delay-1000" />
        <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-green-400/10 rounded-full filter blur-3xl animate-pulse animation-delay-2000" />
      </div>
    </div>
  );
};

export default AppLayout;