/* eslint-disable react/no-unstable-nested-components */
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  ClockCounterClockwise,
  GearSix,
  House,
  Images,
} from 'phosphor-react-native';
import { MainTabParamList } from './types';
import { HomeScreen } from '../../pages/home/HomeScreen';
import { ConvertScreen } from '../../pages/convert/ConvertScreen';
import { HistoryScreen } from '../../pages/history/HistoryScreen';
import { SettingsScreen } from '../../pages/settings/SettingsScreen';
import { useTheme } from '../providers/ThemeProvider';

const Tab = createBottomTabNavigator<MainTabParamList>();

export const TabNavigator: React.FC = () => {
  const theme = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarStyle: {
          borderTopColor: theme.colors.border,
          backgroundColor: theme.colors.surface,
          height: 70,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarIcon: ({ color, focused }) => {
          const weight = focused ? 'fill' : 'regular';
          switch (route.name) {
            case 'Home':
              return <House color={color} size={22} weight={weight} />;
            case 'Convert':
              return <Images color={color} size={22} weight={weight} />;
            case 'History':
              return <ClockCounterClockwise color={color} size={22} weight={weight} />;
            case 'Settings':
              return <GearSix color={color} size={22} weight={weight} />;
            default:
              return null;
          }
        },
      })}
    >
      <Tab.Screen component={HomeScreen} name="Home" />
      <Tab.Screen component={ConvertScreen} name="Convert" />
      <Tab.Screen component={HistoryScreen} name="History" />
      <Tab.Screen component={SettingsScreen} name="Settings" />
    </Tab.Navigator>
  );
};
