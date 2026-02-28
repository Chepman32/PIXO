import React from 'react';
import { Pressable, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { useTheme } from '../../app/providers/ThemeProvider';

interface CardProps {
  variant?: 'elevated' | 'outlined' | 'filled';
  padding?: 'none' | 'small' | 'medium' | 'large';
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}

const paddingMap = {
  none: 0,
  small: 12,
  medium: 16,
  large: 24,
};

export const Card: React.FC<CardProps> = ({
  variant = 'elevated',
  padding = 'medium',
  onPress,
  style,
  children,
}) => {
  const theme = useTheme();
  const baseStyle: ViewStyle = {
    borderRadius: theme.radius.md,
    padding: paddingMap[padding],
    backgroundColor: variant === 'filled' ? theme.colors.surfaceSecondary : theme.colors.surface,
    borderWidth: variant === 'outlined' ? 1 : 0,
    borderColor: variant === 'outlined' ? theme.colors.border : 'transparent',
    ...(variant === 'elevated' ? theme.elevation.low : undefined),
  };

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.wrapper,
          baseStyle,
          style,
          pressed && styles.pressed,
        ]}
      >
        {children}
      </Pressable>
    );
  }

  return <View style={[styles.wrapper, baseStyle, style]}>{children}</View>;
};

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.985 }],
  },
});
