import { useColorScheme } from 'react-native';
import { colors, radius, spacing, typography, elevation, motion } from './tokens';

export interface Theme {
  isDark: boolean;
  colors: {
    background: string;
    surface: string;
    surfaceSecondary: string;
    textPrimary: string;
    textSecondary: string;
    textMuted: string;
    border: string;
    overlay: string;
    primary: string;
    primaryLight: string;
    primaryDark: string;
    primarySubtle: string;
    accent: string;
    success: string;
    warning: string;
    error: string;
    white: string;
  };
  spacing: typeof spacing;
  radius: typeof radius;
  typography: typeof typography;
  elevation: typeof elevation;
  motion: typeof motion;
}

export const lightTheme: Theme = {
  isDark: false,
  colors: {
    background: colors.neutral50,
    surface: colors.white,
    surfaceSecondary: colors.neutral100,
    textPrimary: colors.neutral900,
    textSecondary: colors.neutral600,
    textMuted: colors.neutral500,
    border: colors.neutral200,
    overlay: 'rgba(0,0,0,0.45)',
    primary: colors.primary,
    primaryLight: colors.primaryLight,
    primaryDark: colors.primaryDark,
    primarySubtle: colors.primarySubtle,
    accent: colors.accent,
    success: colors.success,
    warning: colors.warning,
    error: colors.error,
    white: colors.white,
  },
  spacing,
  radius,
  typography,
  elevation,
  motion,
};

export const darkTheme: Theme = {
  isDark: true,
  colors: {
    background: colors.dark50,
    surface: colors.dark100,
    surfaceSecondary: colors.dark200,
    textPrimary: colors.dark900,
    textSecondary: colors.dark600,
    textMuted: colors.dark500,
    border: colors.dark300,
    overlay: 'rgba(0,0,0,0.65)',
    primary: colors.primaryLight,
    primaryLight: colors.primary,
    primaryDark: colors.primaryDark,
    primarySubtle: 'rgba(99, 102, 241, 0.20)',
    accent: colors.accentLight,
    success: colors.success,
    warning: colors.warning,
    error: colors.error,
    white: colors.white,
  },
  spacing,
  radius,
  typography,
  elevation,
  motion,
};

export const useSystemTheme = () => {
  const scheme = useColorScheme();
  return scheme === 'dark' ? darkTheme : lightTheme;
};
