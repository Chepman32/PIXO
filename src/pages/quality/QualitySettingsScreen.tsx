import React, { useEffect, useMemo, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CaretDown, CaretUp } from 'phosphor-react-native';
import { AppHeader } from '../../shared/ui/AppHeader';
import { Screen } from '../../shared/ui/Screen';
import { RootStackParamList } from '../../app/navigation/types';
import { useTheme } from '../../app/providers/ThemeProvider';
import { QualitySlider } from '../../widgets/quality-slider/QualitySlider';
import { Button } from '../../shared/ui/Button';
import { PixoImageConverter } from '../../shared/api/pixoImageConverter';
import { getReadableSize } from '../../shared/lib/file';
import { ConversionOptions } from '../../types/models';

type Props = NativeStackScreenProps<RootStackParamList, 'QualitySettings'>;

const advancedItemStyles = StyleSheet.create({
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  rowText: {
    flex: 1,
    marginRight: 10,
  },
});

export const QualitySettingsScreen: React.FC<Props> = ({ route, navigation }) => {
  const theme = useTheme();
  const { images, targetFormat, options } = route.params;

  const [form, setForm] = useState<ConversionOptions>({
    quality: options?.quality ?? 80,
    preserveMetadata: options?.preserveMetadata ?? true,
    compressionLevel: options?.compressionLevel ?? 6,
    progressive: options?.progressive ?? true,
    stripColorProfile: options?.stripColorProfile ?? false,
    maxDimension: options?.maxDimension,
    maintainAspectRatio: options?.maintainAspectRatio ?? true,
    keepAlpha: options?.keepAlpha ?? true,
    webpLossless: options?.webpLossless ?? false,
    pdfMode: options?.pdfMode ?? 'single',
  });

  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [estimatedSize, setEstimatedSize] = useState(0);

  useEffect(() => {
    let mounted = true;
    Promise.all(
      images.map(item =>
        PixoImageConverter.estimateOutputSize(item.uri, targetFormat, form.quality).catch(
          () => item.fileSize,
        ),
      ),
    ).then(values => {
      if (!mounted) {
        return;
      }
      setEstimatedSize(values.reduce((sum, next) => sum + next, 0));
    });

    return () => {
      mounted = false;
    };
  }, [form.quality, images, targetFormat]);

  const sourceSize = useMemo(
    () => images.reduce((sum, item) => sum + item.fileSize, 0),
    [images],
  );

  const delta = sourceSize > 0 ? ((estimatedSize - sourceSize) / sourceSize) * 100 : 0;

  return (
    <Screen>
      <AppHeader onBack={() => navigation.goBack()} title="Quality Settings" />
      <ScrollView contentContainerStyle={[styles.content, { backgroundColor: theme.colors.background }]}> 
        <View style={[styles.previewCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}> 
          <Text style={[theme.typography.titleSmall, { color: theme.colors.textPrimary, marginBottom: 10 }]}>Before / After</Text>
          <View style={styles.previewRow}>
            <View style={styles.previewCell}>
              <Image source={{ uri: images[0].uri }} style={styles.previewImage} />
              <Text style={[theme.typography.bodySmall, { color: theme.colors.textSecondary }]}>Original</Text>
              <Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted }]}>{getReadableSize(sourceSize)}</Text>
            </View>
            <View style={styles.previewCell}>
              <Image source={{ uri: images[0].uri }} style={styles.previewImage} />
              <Text style={[theme.typography.bodySmall, { color: theme.colors.textSecondary }]}>Preview</Text>
              <Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted }]}>{getReadableSize(estimatedSize)}</Text>
            </View>
          </View>
        </View>

        <QualitySlider
          onChange={quality => setForm(prev => ({ ...prev, quality }))}
          value={form.quality}
        />

        <View style={[styles.estimateCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}> 
          <Text style={[theme.typography.titleSmall, { color: theme.colors.textPrimary }]}>Output Size Estimate</Text>
          <View style={[styles.progressTrack, { backgroundColor: theme.colors.border }]}> 
            <View
              style={[
                styles.progressFill,
                {
                  backgroundColor: delta <= 0 ? theme.colors.success : theme.colors.warning,
                  width: `${Math.min(100, Math.max(8, (estimatedSize / Math.max(sourceSize * 2, 1)) * 100))}%`,
                },
              ]}
            />
          </View>
          <Text style={[theme.typography.bodyMedium, { color: theme.colors.textSecondary }]}> 
            {getReadableSize(estimatedSize)} {delta <= 0 ? '(smaller)' : '(larger)'}
          </Text>
          <Text
            style={[
              theme.typography.bodySmall,
              { color: delta <= 0 ? theme.colors.success : theme.colors.warning, marginTop: 2 },
            ]}
          >
            {delta <= 0 ? '↓' : '↑'} {Math.abs(delta).toFixed(0)}% {delta <= 0 ? 'smaller' : 'larger'} than original
          </Text>
        </View>

        <Pressable
          onPress={() => setAdvancedOpen(prev => !prev)}
          style={[styles.advancedHeader, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
        >
          <Text style={[theme.typography.titleSmall, { color: theme.colors.textPrimary }]}>Advanced Options</Text>
          {advancedOpen ? (
            <CaretUp color={theme.colors.textSecondary} size={16} />
          ) : (
            <CaretDown color={theme.colors.textSecondary} size={16} />
          )}
        </Pressable>

        {advancedOpen ? (
          <View style={[styles.advancedPanel, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}> 
            <View style={advancedItemStyles.row}>
              <Text style={[advancedItemStyles.rowText, theme.typography.bodyMedium, { color: theme.colors.textPrimary }]}>Preserve EXIF Data</Text>
              <Switch
                onValueChange={value => setForm(prev => ({ ...prev, preserveMetadata: value }))}
                value={form.preserveMetadata}
              />
            </View>
            {targetFormat === 'jpg' ? (
              <View style={advancedItemStyles.row}>
                <Text style={[advancedItemStyles.rowText, theme.typography.bodyMedium, { color: theme.colors.textPrimary }]}>Progressive Loading</Text>
                <Switch
                  onValueChange={value => setForm(prev => ({ ...prev, progressive: value }))}
                  value={Boolean(form.progressive)}
                />
              </View>
            ) : null}
            <View style={advancedItemStyles.row}>
              <Text style={[advancedItemStyles.rowText, theme.typography.bodyMedium, { color: theme.colors.textPrimary }]}>Strip Color Profile</Text>
              <Switch
                onValueChange={value => setForm(prev => ({ ...prev, stripColorProfile: value }))}
                value={Boolean(form.stripColorProfile)}
              />
            </View>
            <View style={advancedItemStyles.row}>
              <Text style={[advancedItemStyles.rowText, theme.typography.bodyMedium, { color: theme.colors.textPrimary }]}>Max Dimension (px)</Text>
              <TextInput
                keyboardType="number-pad"
                onChangeText={value =>
                  setForm(prev => ({
                    ...prev,
                    maxDimension: value ? Number(value) : undefined,
                  }))
                }
                placeholder="None"
                placeholderTextColor={theme.colors.textMuted}
                style={[
                  styles.dimensionInput,
                  {
                    borderColor: theme.colors.border,
                    color: theme.colors.textPrimary,
                  },
                ]}
                value={form.maxDimension ? String(form.maxDimension) : ''}
              />
            </View>
          </View>
        ) : null}

        <View style={styles.presetButton}>
          <Button
            fullWidth
            label="Save as Preset"
            onPress={() => {
              // Preset creation will be expanded in a dedicated management flow.
            }}
            variant="secondary"
          />
        </View>
      </ScrollView>

      <View style={[styles.footer, { borderTopColor: theme.colors.border, backgroundColor: theme.colors.background }]}> 
        <Button
          fullWidth
          label="Convert Now"
          onPress={() =>
            navigation.navigate('ConversionProgress', {
              images,
              targetFormat,
              options: form,
            })
          }
        />
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  content: {
    gap: 12,
    padding: 20,
    paddingBottom: 120,
  },
  previewCard: {
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 14,
  },
  previewRow: {
    flexDirection: 'row',
    gap: 10,
  },
  previewCell: {
    alignItems: 'center',
    flex: 1,
  },
  previewImage: {
    borderRadius: 10,
    height: 120,
    marginBottom: 8,
    width: '100%',
  },
  estimateCard: {
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 14,
  },
  progressTrack: {
    borderRadius: 4,
    height: 8,
    marginVertical: 10,
    overflow: 'hidden',
  },
  progressFill: {
    borderRadius: 4,
    height: 8,
  },
  advancedHeader: {
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 14,
  },
  advancedPanel: {
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    marginTop: -6,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  dimensionInput: {
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    minWidth: 76,
    paddingHorizontal: 10,
    paddingVertical: 6,
    textAlign: 'right',
  },
  presetButton: {
    marginTop: 4,
  },
  footer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    bottom: 0,
    left: 0,
    padding: 16,
    position: 'absolute',
    right: 0,
  },
});
