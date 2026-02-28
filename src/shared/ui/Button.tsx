import React, { useMemo, useRef } from 'react';
import {
  ActivityIndicator,
  Animated,
  Pressable,
  StyleSheet,
  Text,
  ViewStyle,
} from 'react-native';
import { useTheme } from '../../app/providers/ThemeProvider';
import { haptic } from '../lib/haptics';

export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'small' | 'medium' | 'large';
  label: string;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onPress: () => void;
}

const sizeMap = {
  small: { height: 36, horizontal: 12, textStyle: 'labelMedium' as const },
  medium: { height: 44, horizontal: 16, textStyle: 'bodyMedium' as const },
  large: { height: 52, horizontal: 20, textStyle: 'labelLarge' as const },
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  label,
  loading,
  disabled,
  fullWidth,
  leftIcon,
  rightIcon,
  onPress,
}) => {
  const theme = useTheme();
  const scale = useRef(new Animated.Value(1)).current;

  const palette = useMemo(() => {
    switch (variant) {
      case 'secondary':
        return {
          background: theme.colors.surfaceSecondary,
          border: 'transparent',
          text: theme.colors.textPrimary,
        };
      case 'outline':
        return {
          background: 'transparent',
          border: theme.colors.primary,
          text: theme.colors.primary,
        };
      case 'ghost':
        return {
          background: 'transparent',
          border: 'transparent',
          text: theme.colors.textSecondary,
        };
      case 'destructive':
        return {
          background: theme.colors.error,
          border: 'transparent',
          text: theme.colors.white,
        };
      case 'primary':
      default:
        return {
          background: theme.colors.primary,
          border: 'transparent',
          text: theme.colors.white,
        };
    }
  }, [theme, variant]);

  const metrics = sizeMap[size];
  const textStyle = theme.typography[metrics.textStyle];

  const animateScale = (toValue: number) => {
    Animated.spring(scale, {
      toValue,
      useNativeDriver: true,
      speed: 24,
      bounciness: toValue < 1 ? 0 : 6,
    }).start();
  };

  const handlePress = () => {
    haptic.light();
    onPress();
  };

  const containerStyle: ViewStyle = {
    height: metrics.height,
    paddingHorizontal: metrics.horizontal,
    borderRadius: theme.radius.md,
    backgroundColor: palette.background,
    borderWidth: variant === 'outline' ? 1 : 0,
    borderColor: palette.border,
    opacity: disabled ? 0.5 : 1,
    width: fullWidth ? '100%' : undefined,
  };

  return (
    <Animated.View style={[{ transform: [{ scale }] }, fullWidth && styles.fullWidth]}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: Boolean(disabled), busy: Boolean(loading) }}
        disabled={disabled || loading}
        onPress={handlePress}
        onPressIn={() => animateScale(0.97)}
        onPressOut={() => animateScale(1)}
        style={[styles.base, containerStyle]}
      >
        {loading ? (
          <ActivityIndicator color={palette.text} size="small" />
        ) : (
          <>
            {leftIcon}
            <Text
              numberOfLines={1}
              style={[styles.label, textStyle, { color: palette.text }]}
            >
              {label}
            </Text>
            {rightIcon}
          </>
        )}
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  fullWidth: {
    width: '100%',
  },
  base: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  label: {
    includeFontPadding: false,
  },
});
