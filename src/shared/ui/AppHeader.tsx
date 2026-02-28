import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ArrowLeft, GearSix, Info } from 'phosphor-react-native';
import { useTheme } from '../../app/providers/ThemeProvider';
import { haptic } from '../lib/haptics';

interface AppHeaderProps {
  title: string;
  onBack?: () => void;
  onSettings?: () => void;
  onInfo?: () => void;
  rightSlot?: React.ReactNode;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  onBack,
  onSettings,
  onInfo,
  rightSlot,
}) => {
  const theme = useTheme();

  const renderRight = () => {
    if (rightSlot) {
      return rightSlot;
    }

    if (onSettings) {
      return (
        <Pressable
          accessibilityLabel="Open settings"
          accessibilityRole="button"
          hitSlop={10}
          onPress={() => {
            haptic.light();
            onSettings();
          }}
          style={styles.iconButton}
        >
          <GearSix color={theme.colors.textSecondary} size={24} weight="regular" />
        </Pressable>
      );
    }

    if (onInfo) {
      return (
        <Pressable
          accessibilityLabel="Open format info"
          accessibilityRole="button"
          hitSlop={10}
          onPress={() => {
            haptic.light();
            onInfo();
          }}
          style={styles.iconButton}
        >
          <Info color={theme.colors.textSecondary} size={22} weight="regular" />
        </Pressable>
      );
    }

    return <View style={styles.placeholder} />;
  };

  return (
    <View style={[styles.container, { borderBottomColor: theme.colors.border }]}> 
      {onBack ? (
        <Pressable
          accessibilityLabel="Go back"
          accessibilityRole="button"
          hitSlop={10}
          onPress={() => {
            haptic.light();
            onBack();
          }}
          style={styles.iconButton}
        >
          <ArrowLeft color={theme.colors.textPrimary} size={24} weight="regular" />
        </Pressable>
      ) : (
        <View style={styles.placeholder} />
      )}
      <Text numberOfLines={1} style={[styles.title, theme.typography.titleMedium, { color: theme.colors.textPrimary }]}> 
        {title}
      </Text>
      {renderRight()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    height: 56,
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  title: {
    flex: 1,
    textAlign: 'center',
  },
  iconButton: {
    alignItems: 'center',
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  placeholder: {
    width: 44,
    height: 44,
  },
});
