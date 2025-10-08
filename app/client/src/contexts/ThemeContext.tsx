import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Theme, ThemeType, getTheme } from '../themes';
import { apiService } from '../services/api';

interface ThemeContextType {
  theme: Theme;
  themeType: ThemeType;
  setTheme: (themeType: ThemeType) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [themeType, setThemeType] = useState<ThemeType>('dark');
  const [theme, setThemeState] = useState<Theme>(getTheme('dark'));

  useEffect(() => {
    // Load theme from localStorage or user preferences
    const loadTheme = () => {
      const user = localStorage.getItem('user');
      if (user) {
        try {
          const userData = JSON.parse(user);
          const savedTheme = (userData.theme as ThemeType) || 'dark';
          setThemeType(savedTheme);
          setThemeState(getTheme(savedTheme));
        } catch (error) {
          console.error('Error loading theme:', error);
        }
      } else {
        // Fallback to localStorage
        const savedTheme = (localStorage.getItem('theme') as ThemeType) || 'dark';
        setThemeType(savedTheme);
        setThemeState(getTheme(savedTheme));
      }
    };

    loadTheme();

    // Listen for theme updates
    const handleThemeUpdate = (event: CustomEvent) => {
      const newTheme = event.detail.theme as ThemeType;
      setThemeType(newTheme);
      setThemeState(getTheme(newTheme));
    };

    window.addEventListener('themeUpdated', handleThemeUpdate as EventListener);

    return () => {
      window.removeEventListener('themeUpdated', handleThemeUpdate as EventListener);
    };
  }, []);

  const setTheme = async (newThemeType: ThemeType) => {
    try {
      // Update backend
      await apiService.updateProfile({ theme: newThemeType });

      // Update local state
      setThemeType(newThemeType);
      setThemeState(getTheme(newThemeType));

      // Update localStorage
      localStorage.setItem('theme', newThemeType);

      // Update user object in localStorage
      const user = localStorage.getItem('user');
      if (user) {
        const userData = JSON.parse(user);
        userData.theme = newThemeType;
        localStorage.setItem('user', JSON.stringify(userData));
      }

      // Dispatch event for other components
      window.dispatchEvent(new CustomEvent('themeUpdated', { detail: { theme: newThemeType } }));
    } catch (error) {
      console.error('Error updating theme:', error);
      throw error;
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, themeType, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
