import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ClockCounterClockwise } from 'phosphor-react-native';
import { useTheme } from '../../app/providers/ThemeProvider';
import { Button } from './Button';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionLabel,
  onAction,
}) => {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <ClockCounterClockwise color={theme.colors.textMuted} size={56} />
      <Text style={[theme.typography.headlineSmall, { color: theme.colors.textPrimary }, styles.title]}>
        {title}
      </Text>
      <Text style={[theme.typography.bodyMedium, { color: theme.colors.textSecondary }, styles.description]}>
        {description}
      </Text>
      {actionLabel && onAction ? (
        <View style={styles.action}>
          <Button label={actionLabel} onPress={onAction} />
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 36,
  },
  title: {
    marginTop: 16,
    textAlign: 'center',
  },
  description: {
    marginTop: 8,
    textAlign: 'center',
  },
  action: {
    marginTop: 20,
    minWidth: 180,
  },
});
