import React from 'react';
import { StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider, useTheme } from './providers/ThemeProvider';
import { AppBootstrap } from './providers/AppBootstrap';
import { RootNavigator } from './navigation/RootNavigator';
import { ToastProvider } from './providers/ToastProvider';

const AppBody: React.FC = () => {
  const theme = useTheme();

  return (
    <>
      <StatusBar
        animated
        backgroundColor="transparent"
        barStyle={theme.isDark ? 'light-content' : 'dark-content'}
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
          <AppBody />
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};
