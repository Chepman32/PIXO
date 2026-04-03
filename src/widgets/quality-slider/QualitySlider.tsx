import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Slider from '@react-native-community/slider';
import { useTheme } from '../../app/providers/ThemeProvider';
import { useStrings } from '../../shared/lib/i18n';

interface QualitySliderProps {
  value: number;
  onChange: (value: number) => void;
}

export const QualitySlider: React.FC<QualitySliderProps> = ({ value, onChange }) => {
  const theme = useTheme();
  const strings = useStrings();

  return (
    <View style={[styles.wrap, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}> 
      <Text style={[theme.typography.titleSmall, { color: theme.colors.textPrimary }]}>{strings.qualitySlider.title}</Text>
      <View style={styles.labels}>
        <Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted }]}>{strings.qualitySlider.low}</Text>
        <Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted }]}>{strings.qualitySlider.medium}</Text>
        <Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted }]}>{strings.qualitySlider.high}</Text>
      </View>
      <Slider
        maximumTrackTintColor={theme.colors.border}
        maximumValue={100}
        minimumTrackTintColor={theme.colors.primary}
        minimumValue={1}
        onValueChange={next => onChange(Math.round(next))}
        step={1}
        thumbTintColor={theme.colors.primary}
        value={value}
      />
      <Text style={[styles.value, theme.typography.headlineSmall, { color: theme.colors.textPrimary }]}>{value}%</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 14,
  },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  value: {
    textAlign: 'center',
  },
});
