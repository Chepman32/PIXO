import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { FORMAT_META } from '../config/formats';
import { ImageFormat } from '../../types/models';

interface FormatBadgeProps {
  format: ImageFormat;
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = {
  sm: { box: 20, font: 9 },
  md: { box: 24, font: 10 },
  lg: { box: 44, font: 12 },
};

export const FormatBadge: React.FC<FormatBadgeProps> = ({ format, size = 'md' }) => {
  const meta = FORMAT_META[format];
  const metrics = sizeMap[size];

  return (
    <View
      style={[
        styles.badge,
        {
          width: metrics.box,
          height: metrics.box,
          borderRadius: metrics.box * 0.28,
          backgroundColor: meta.color,
        },
      ]}
    >
      <Text style={[styles.text, { fontSize: metrics.font }]}>{meta.label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#FFFFFF',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
});
