import React from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { TabNavigator } from './TabNavigator';
import { SplashScreen } from '../../pages/splash/SplashScreen';
import { FormatSelectionScreen } from '../../pages/format-selection/FormatSelectionScreen';
import { QualitySettingsScreen } from '../../pages/quality/QualitySettingsScreen';
import { ConversionProgressScreen } from '../../pages/progress/ConversionProgressScreen';
import { ConversionCompleteScreen } from '../../pages/complete/ConversionCompleteScreen';
import { PreviewScreen } from '../../pages/preview/PreviewScreen';
import { useTheme } from '../providers/ThemeProvider';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  const theme = useTheme();

  const navTheme = {
    ...(theme.isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(theme.isDark ? DarkTheme.colors : DefaultTheme.colors),
      background: theme.colors.background,
      card: theme.colors.surface,
      text: theme.colors.textPrimary,
      border: theme.colors.border,
      primary: theme.colors.primary,
      notification: theme.colors.accent,
    },
  };

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen component={SplashScreen} name="Splash" />
        <Stack.Screen component={TabNavigator} name="MainTabs" />
        <Stack.Screen component={FormatSelectionScreen} name="FormatSelection" />
        <Stack.Screen component={QualitySettingsScreen} name="QualitySettings" />
        <Stack.Screen component={ConversionProgressScreen} name="ConversionProgress" />
        <Stack.Screen component={ConversionCompleteScreen} name="ConversionComplete" />
        <Stack.Screen component={PreviewScreen} name="Preview" />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
