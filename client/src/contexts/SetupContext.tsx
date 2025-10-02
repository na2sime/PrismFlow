import React, { createContext, useState, useEffect, useContext } from 'react';
import { apiService } from '../services/api';

interface SetupStatus {
  isCompleted: boolean;
  hasAdminUser: boolean;
  hasFirstProject: boolean;
  version: string;
}

interface SetupContextType {
  setupStatus: SetupStatus | null;
  loading: boolean;
  checkSetupStatus: () => Promise<void>;
}

const SetupContext = createContext<SetupContextType | undefined>(undefined);

export const SetupProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [setupStatus, setSetupStatus] = useState<SetupStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const checkSetupStatus = async () => {
    setLoading(true);
    try {
      const response = await apiService.getSetupStatus();
      if (response.success) {
        setSetupStatus(response.data);
      }
    } catch (error) {
      console.error('Error checking setup status:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkSetupStatus();
  }, []);

  return (
    <SetupContext.Provider value={{ setupStatus, loading, checkSetupStatus }}>
      {children}
    </SetupContext.Provider>
  );
};

export const useSetup = () => {
  const context = useContext(SetupContext);
  if (context === undefined) {
    throw new Error('useSetup must be used within a SetupProvider');
  }
  return context;
};
