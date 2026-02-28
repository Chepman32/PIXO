import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { CheckCircle } from 'phosphor-react-native';
import { useTheme } from '../../app/providers/ThemeProvider';
import { FORMAT_META } from '../../shared/config/formats';
import { SupportedOutputFormat } from '../../types/models';
import { FormatBadge } from '../../shared/ui/FormatBadge';

interface FormatOptionCardProps {
  format: SupportedOutputFormat;
  selected: boolean;
  disabled?: boolean;
  estimatedSize?: string;
  onPress: () => void;
}

export const FormatOptionCard: React.FC<FormatOptionCardProps> = ({
  format,
  selected,
  disabled,
  estimatedSize,
  onPress,
}) => {
  const theme = useTheme();
  const meta = FORMAT_META[format];

  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: selected ? theme.colors.primarySubtle : theme.colors.surface,
          borderColor: selected ? theme.colors.primary : theme.colors.border,
          opacity: disabled ? 0.5 : pressed ? 0.9 : 1,
        },
      ]}
    >
      <FormatBadge format={format} size="lg" />
      <View style={styles.body}>
        <Text style={[theme.typography.titleSmall, { color: theme.colors.textPrimary }]}>{meta.label}</Text>
        <Text style={[theme.typography.bodySmall, { color: theme.colors.textSecondary }]}>{meta.description}</Text>
      </View>
      <View style={styles.trailing}>
        {estimatedSize ? (
          <Text style={[theme.typography.bodySmall, { color: theme.colors.textSecondary }]}>~{estimatedSize}</Text>
        ) : null}
        {selected ? <CheckCircle color={theme.colors.primary} size={18} weight="fill" /> : null}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: 10,
    minHeight: 72,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  body: {
    flex: 1,
    marginLeft: 12,
  },
  trailing: {
    alignItems: 'flex-end',
    gap: 8,
  },
});
