import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { darkTheme, lightTheme, Theme } from '../../shared/theme/theme';
import { useAppStore } from './store/useAppStore';

interface ThemeContextValue {
  theme: Theme;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: lightTheme,
});

export const ThemeProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const systemScheme = useColorScheme();
  const preference = useAppStore(state => state.settings.theme);

  const theme = useMemo(() => {
    if (preference === 'dark') {
      return darkTheme;
    }

    if (preference === 'light') {
      return lightTheme;
    }

    return systemScheme === 'dark' ? darkTheme : lightTheme;
  }, [preference, systemScheme]);

  return <ThemeContext.Provider value={{ theme }}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext).theme;
