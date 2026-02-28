import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { ArrowDown, ArrowRight } from 'phosphor-react-native';
import { HistoryItem } from '../../types/models';
import { getReadableSize } from '../../shared/lib/file';
import { formatTime } from '../../shared/lib/date';
import { useTheme } from '../../app/providers/ThemeProvider';
import { FormatBadge } from '../../shared/ui/FormatBadge';

interface ConversionHistoryCardProps {
  item: HistoryItem;
  onPress: () => void;
}

export const ConversionHistoryCard: React.FC<ConversionHistoryCardProps> = ({ item, onPress }) => {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
        },
        theme.elevation.low,
        pressed && styles.pressed,
      ]}
    >
      <Image source={{ uri: item.source.uri }} style={styles.thumb} />
      <View style={styles.body}>
        <Text numberOfLines={1} style={[theme.typography.titleSmall, { color: theme.colors.textPrimary }]}>
          {item.source.fileName}
        </Text>
        <View style={styles.row}>
          <FormatBadge format={item.source.format} size="sm" />
          <ArrowRight color={theme.colors.textMuted} size={12} />
          <FormatBadge format={item.outputFormat} size="sm" />
          <Text style={[theme.typography.bodySmall, { color: theme.colors.textSecondary, marginLeft: 8 }]}> 
            {getReadableSize(item.size.convertedSize)}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted }]}>
            {formatTime(item.createdAt)}
          </Text>
          <View style={styles.deltaWrap}>
            <ArrowDown color={theme.colors.success} size={12} />
            <Text style={[theme.typography.bodySmall, { color: theme.colors.success }]}> 
              {Math.abs(item.size.deltaPercent).toFixed(0)}%
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    marginHorizontal: 20,
    marginVertical: 6,
    padding: 10,
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.985 }],
  },
  thumb: {
    borderRadius: 8,
    height: 60,
    width: 60,
  },
  body: {
    flex: 1,
    gap: 3,
    marginLeft: 12,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
    justifyContent: 'space-between',
  },
  deltaWrap: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 2,
  },
});
