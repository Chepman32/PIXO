import React from 'react';
import { StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider, useTheme } from './providers/ThemeProvider';
import { AppBootstrap } from './providers/AppBootstrap';
import { RootNavigator } from './navigation/RootNavigator';
import { ToastProvider } from './providers/ToastProvider';
import { I18nProvider } from '../shared/lib/i18n';

const AppBody: React.FC = () => {
  const theme = useTheme();

  return (
    <>
      <StatusBar
        animated
        backgroundColor="transparent"
        barStyle={theme.isDark ? 'light-content' : 'dark-content'}
        translucent={false}
      />
      <AppBootstrap>
        <ToastProvider>
          <RootNavigator />
        </ToastProvider>
      </AppBootstrap>
    </>
  );
};

export const App: React.FC = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <I18nProvider>
            <AppBody />
          </I18nProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};
