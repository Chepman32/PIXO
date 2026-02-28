import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppHeader } from '../../shared/ui/AppHeader';
import { Screen } from '../../shared/ui/Screen';
import { useTheme } from '../../app/providers/ThemeProvider';
import { RootStackParamList } from '../../app/navigation/types';
import { CONVERSION_MATRIX, FORMAT_META, SUPPORTED_OUTPUT_FORMATS } from '../../shared/config/formats';
import { FormatOptionCard } from '../../widgets/format-selector/FormatOptionCard';
import { Button } from '../../shared/ui/Button';
import { PixoImageConverter } from '../../shared/api/pixoImageConverter';
import { getReadableSize } from '../../shared/lib/file';
import { SupportedOutputFormat } from '../../types/models';

const defaultOptions = {
  quality: 80,
  preserveMetadata: true,
  progressive: true,
  maintainAspectRatio: true,
};

type Props = NativeStackScreenProps<RootStackParamList, 'FormatSelection'>;

export const FormatSelectionScreen: React.FC<Props> = ({ navigation, route }) => {
  const theme = useTheme();
  const { images, initialTarget, options } = route.params;
  const first = images[0];

  const availableFormats = useMemo(() => {
    if (images.length === 1) {
      return CONVERSION_MATRIX[first.format];
    }
    return SUPPORTED_OUTPUT_FORMATS;
  }, [first.format, images.length]);

  const [selected, setSelected] = useState<SupportedOutputFormat | undefined>(
    initialTarget ?? availableFormats[0],
  );
  const [estimates, setEstimates] = useState<Record<SupportedOutputFormat, number>>({} as Record<SupportedOutputFormat, number>);

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      const map = {} as Record<SupportedOutputFormat, number>;
      for (const format of availableFormats) {
        const estimatesForFormat = await Promise.all(
          images.map(image =>
            PixoImageConverter.estimateOutputSize(image.uri, format, options?.quality ?? 80).catch(() => image.fileSize),
          ),
        );
        map[format] = estimatesForFormat.reduce((sum, value) => sum + value, 0);
      }

      if (mounted) {
        setEstimates(map);
      }
    };

    run().catch(() => undefined);

    return () => {
      mounted = false;
    };
  }, [availableFormats, images, options?.quality]);

  return (
    <Screen>
      <AppHeader
        onBack={() => navigation.goBack()}
        onInfo={() =>
          Alert.alert(
            'Format Information',
            'Choose a target format based on compatibility and size. JPG is best for photos, PNG for transparency, WebP for web optimization, HEIC for iOS storage efficiency.',
          )
        }
        title="Select Format"
      />
      <ScrollView contentContainerStyle={[styles.content, { backgroundColor: theme.colors.background }]}> 
        <Text style={[theme.typography.titleSmall, { color: theme.colors.textSecondary }]}>Converting from:</Text>
        <View style={[styles.sourceCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}> 
          <Image source={{ uri: first.uri }} style={styles.sourceThumb} />
          <View style={styles.sourceTextWrap}>
            <Text numberOfLines={1} style={[theme.typography.titleSmall, { color: theme.colors.textPrimary }]}> 
              {images.length === 1 ? first.fileName : `${images.length} images selected`}
            </Text>
            <Text style={[theme.typography.bodySmall, { color: theme.colors.textSecondary }]}> 
              {images.length === 1
                ? `${first.width} × ${first.height} • ${FORMAT_META[first.format].label}`
                : 'Mixed formats'}
            </Text>
          </View>
        </View>

        <Text style={[styles.section, theme.typography.titleSmall, { color: theme.colors.textSecondary }]}>Select output format:</Text>
        {availableFormats.map(format => (
          <FormatOptionCard
            disabled={images.length === 1 && format === first.format}
            estimatedSize={estimates[format] ? getReadableSize(estimates[format]) : undefined}
            format={format}
            key={format}
            onPress={() => setSelected(format)}
            selected={selected === format}
          />
        ))}
      </ScrollView>

      <View style={[styles.footer, { borderTopColor: theme.colors.border, backgroundColor: theme.colors.background }]}> 
        <Button
          disabled={!selected}
          fullWidth
          label="Continue"
          onPress={() => {
            if (!selected) {
              return;
            }

            navigation.navigate('QualitySettings', {
              images,
              targetFormat: selected,
              options: {
                ...defaultOptions,
                ...options,
              },
            });
          }}
        />
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  content: {
    padding: 20,
    paddingBottom: 120,
  },
  sourceCard: {
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    marginTop: 8,
    padding: 12,
  },
  sourceThumb: {
    borderRadius: 8,
    height: 80,
    width: 80,
  },
  sourceTextWrap: {
    flex: 1,
    justifyContent: 'center',
    marginLeft: 12,
  },
  section: {
    marginBottom: 8,
    marginTop: 20,
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
