export type ThemeType = 'light' | 'dark' | 'purple-night' | 'howl';

export interface Theme {
  id: ThemeType;
  name: string;
  colors: {
    // Main backgrounds
    primary: string;
    secondary: string;
    tertiary: string;

    // Gradients
    gradient: string;

    // Text
    textPrimary: string;
    textSecondary: string;
    textTertiary: string;

    // Interactive elements
    accent: string;
    accentHover: string;

    // Surfaces (cards, modals, etc.)
    surface: string;
    surfaceHover: string;
    surfaceBorder: string;

    // Status colors
    success: string;
    warning: string;
    error: string;
    info: string;

    // Glassmorphism
    glassBackground: string;
    glassBorder: string;
  };
}

export const themes: Record<ThemeType, Theme> = {
  light: {
    id: 'light',
    name: 'Light',
    colors: {
      primary: '#FFFFFF',
      secondary: '#F5F5F7',
      tertiary: '#E5E5E7',
      gradient: 'linear-gradient(135deg, #F5F7FA 0%, #E8EAF6 100%)',
      textPrimary: '#1D1D1F',
      textSecondary: '#6E6E73',
      textTertiary: '#86868B',
      accent: '#007AFF',
      accentHover: '#0051D5',
      surface: '#FFFFFF',
      surfaceHover: '#F5F5F7',
      surfaceBorder: '#D2D2D7',
      success: '#34C759',
      warning: '#FF9500',
      error: '#FF3B30',
      info: '#007AFF',
      glassBackground: 'rgba(255, 255, 255, 0.7)',
      glassBorder: 'rgba(0, 0, 0, 0.1)',
    },
  },
  dark: {
    id: 'dark',
    name: 'Dark',
    colors: {
      primary: '#000000',
      secondary: '#1C1C1E',
      tertiary: '#2C2C2E',
      gradient: 'linear-gradient(135deg, #1C1C1E 0%, #2C2C2E 100%)',
      textPrimary: '#FFFFFF',
      textSecondary: '#AEAEB2',
      textTertiary: '#8E8E93',
      accent: '#0A84FF',
      accentHover: '#409CFF',
      surface: '#1C1C1E',
      surfaceHover: '#2C2C2E',
      surfaceBorder: '#38383A',
      success: '#30D158',
      warning: '#FF9F0A',
      error: '#FF453A',
      info: '#0A84FF',
      glassBackground: 'rgba(28, 28, 30, 0.7)',
      glassBorder: 'rgba(255, 255, 255, 0.1)',
    },
  },
  'purple-night': {
    id: 'purple-night',
    name: 'Purple Night',
    colors: {
      primary: '#0F0A1E',
      secondary: '#1A1233',
      tertiary: '#251B47',
      gradient: 'linear-gradient(135deg, #0F0A1E 0%, #1A1233 25%, #2D1B69 100%)',
      textPrimary: '#FFFFFF',
      textSecondary: '#D4C5F9',
      textTertiary: '#9B8AC4',
      accent: '#8B5CF6',
      accentHover: '#A78BFA',
      surface: '#1A1233',
      surfaceHover: '#251B47',
      surfaceBorder: 'rgba(139, 92, 246, 0.3)',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#8B5CF6',
      glassBackground: 'rgba(26, 18, 51, 0.6)',
      glassBorder: 'rgba(139, 92, 246, 0.2)',
    },
  },
  howl: {
    id: 'howl',
    name: 'Howl',
    colors: {
      primary: '#0A192F',
      secondary: '#112240',
      tertiary: '#1D3557',
      gradient: 'linear-gradient(135deg, #0A192F 0%, #112240 50%, #1E3A5F 100%)',
      textPrimary: '#E6F1FF',
      textSecondary: '#64FFDA',
      textTertiary: '#8892B0',
      accent: '#64FFDA',
      accentHover: '#52E3C2',
      surface: '#112240',
      surfaceHover: '#1D3557',
      surfaceBorder: 'rgba(100, 255, 218, 0.2)',
      success: '#64FFDA',
      warning: '#FFA726',
      error: '#FF5252',
      info: '#64FFDA',
      glassBackground: 'rgba(17, 34, 64, 0.7)',
      glassBorder: 'rgba(100, 255, 218, 0.2)',
    },
  },
};

export const getTheme = (themeId: ThemeType): Theme => {
  return themes[themeId] || themes.dark;
};
