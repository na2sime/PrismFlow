import React, { ReactNode } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

interface ThemeLayoutProps {
  children: ReactNode;
  className?: string;
}

const ThemeLayout: React.FC<ThemeLayoutProps> = ({ children, className = '' }) => {
  const { theme } = useTheme();

  return (
    <div
      className={`min-h-screen ${className}`}
      style={{
        background: theme.colors.gradient,
        color: theme.colors.textPrimary,
      }}
    >
      <style>{`
        :root {
          --color-primary: ${theme.colors.primary};
          --color-secondary: ${theme.colors.secondary};
          --color-tertiary: ${theme.colors.tertiary};
          --color-text-primary: ${theme.colors.textPrimary};
          --color-text-secondary: ${theme.colors.textSecondary};
          --color-text-tertiary: ${theme.colors.textTertiary};
          --color-accent: ${theme.colors.accent};
          --color-accent-hover: ${theme.colors.accentHover};
          --color-surface: ${theme.colors.surface};
          --color-surface-hover: ${theme.colors.surfaceHover};
          --color-surface-border: ${theme.colors.surfaceBorder};
          --color-success: ${theme.colors.success};
          --color-warning: ${theme.colors.warning};
          --color-error: ${theme.colors.error};
          --color-info: ${theme.colors.info};
          --color-glass-bg: ${theme.colors.glassBackground};
          --color-glass-border: ${theme.colors.glassBorder};
        }
      `}</style>
      {children}
    </div>
  );
};

export default ThemeLayout;
