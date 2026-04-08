import React, { useEffect, useMemo, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { InfoModal } from '../../shared/ui/InfoModal';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppHeader } from '../../shared/ui/AppHeader';
import { Screen } from '../../shared/ui/Screen';
import { useTheme } from '../../app/providers/ThemeProvider';
import { RootStackParamList } from '../../app/navigation/types';
import { CONVERSION_MATRIX, FORMAT_META, SUPPORTED_OUTPUT_FORMATS } from '../../shared/config/formats';
import { FormatOptionCard } from '../../widgets/format-selector/FormatOptionCard';
import { Button } from '../../shared/ui/Button';
import { SquozeImageConverter } from '../../shared/api/squozeImageConverter';
import { getReadableSize } from '../../shared/lib/file';
import { SupportedOutputFormat } from '../../types/models';
import { useStrings } from '../../shared/lib/i18n';

const defaultOptions = {
  quality: 80,
  preserveMetadata: true,
  progressive: true,
  maintainAspectRatio: true,
};

type Props = NativeStackScreenProps<RootStackParamList, 'FormatSelection'>;

export const FormatSelectionScreen: React.FC<Props> = ({ navigation, route }) => {
  const theme = useTheme();
  const strings = useStrings();
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
  const [infoVisible, setInfoVisible] = useState(false);
  const [estimates, setEstimates] = useState<Record<SupportedOutputFormat, number>>({} as Record<SupportedOutputFormat, number>);

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      const map = {} as Record<SupportedOutputFormat, number>;
      for (const format of availableFormats) {
        const estimatesForFormat = await Promise.all(
          images.map(image =>
            SquozeImageConverter.estimateOutputSize(image.uri, format, options?.quality ?? 80).catch(() => image.fileSize),
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
          setInfoVisible(true)
        }
        title={strings.formatSelection.title}
      />
      <ScrollView contentContainerStyle={[styles.content, { backgroundColor: theme.colors.background }]}> 
        <Text style={[theme.typography.titleSmall, { color: theme.colors.textSecondary }]}>{strings.formatSelection.convertingFrom}</Text>
        <View style={[styles.sourceCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}> 
          {images.length === 1 ? (
            <Image source={{ uri: first.uri }} style={styles.sourceThumb} />
          ) : (
            <View style={styles.collage}>
              {images.slice(0, 4).map((image, index) => {
                const showOverflow = index === 3 && images.length > 4;
                return (
                  <View key={image.id} style={styles.collageCell}>
                    <Image source={{ uri: image.uri }} style={styles.collageThumb} />
                    {showOverflow ? (
                      <View style={styles.collageOverlay}>
                        <Text style={[theme.typography.labelLarge, styles.collageOverlayText]}>
                          +{images.length - 4}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                );
              })}
            </View>
          )}
          <View style={styles.sourceTextWrap}>
            <Text numberOfLines={1} style={[theme.typography.titleSmall, { color: theme.colors.textPrimary }]}> 
              {images.length === 1 ? first.fileName : strings.formatSelection.imagesSelected(images.length)}
            </Text>
            <Text style={[theme.typography.bodySmall, { color: theme.colors.textSecondary }]}> 
              {images.length === 1
                ? `${first.width} × ${first.height} • ${FORMAT_META[first.format].label}`
                : strings.formatSelection.mixedFormats}
            </Text>
          </View>
        </View>

        <Text style={[styles.section, theme.typography.titleSmall, { color: theme.colors.textSecondary }]}>{strings.formatSelection.selectOutputFormat}</Text>
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
          label={strings.common.continue}
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
      <InfoModal
        visible={infoVisible}
        title={strings.formatSelection.infoTitle}
        body={strings.formatSelection.infoBody}
        onClose={() => setInfoVisible(false)}
      />
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
  collage: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    height: 80,
    width: 80,
  },
  collageCell: {
    borderRadius: 8,
    height: 38,
    overflow: 'hidden',
    position: 'relative',
    width: 38,
  },
  collageThumb: {
    height: '100%',
    width: '100%',
  },
  collageOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
  },
  collageOverlayText: {
    color: '#FFFFFF',
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
