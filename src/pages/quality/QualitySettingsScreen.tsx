import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Image,
  type LayoutChangeEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CaretDown } from 'phosphor-react-native';
import { AppHeader } from '../../shared/ui/AppHeader';
import { Screen } from '../../shared/ui/Screen';
import { RootStackParamList } from '../../app/navigation/types';
import { useTheme } from '../../app/providers/ThemeProvider';
import { QualitySlider } from '../../widgets/quality-slider/QualitySlider';
import { Button } from '../../shared/ui/Button';
import { SquozeImageConverter } from '../../shared/api/squozeImageConverter';
import { FORMAT_META } from '../../shared/config/formats';
import { getReadableSize } from '../../shared/lib/file';
import { ConversionOptions } from '../../types/models';
import { useStrings } from '../../shared/lib/i18n';

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
  const strings = useStrings();
  const { images, targetFormat, options } = route.params;
  const scrollRef = useRef<ScrollView>(null);

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
  const [advancedContentHeight, setAdvancedContentHeight] = useState(0);
  const [advancedHeaderY, setAdvancedHeaderY] = useState(0);
  const accordionHeight = useRef(new Animated.Value(0)).current;
  const accordionProgress = useRef(new Animated.Value(0)).current;
  const supportsQuality = Boolean(FORMAT_META[targetFormat].lossy);
  const estimateQuality = supportsQuality ? form.quality : 100;

  useEffect(() => {
    let mounted = true;
    Promise.all(
      images.map(item =>
        SquozeImageConverter.estimateOutputSize(item.uri, targetFormat, estimateQuality).catch(
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
  }, [estimateQuality, images, targetFormat]);

  const sourceSize = useMemo(
    () => images.reduce((sum, item) => sum + item.fileSize, 0),
    [images],
  );

  const delta = sourceSize > 0 ? ((estimatedSize - sourceSize) / sourceSize) * 100 : 0;
  const chevronRotation = accordionProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });
  const advancedPanelOpacity = accordionProgress.interpolate({
    inputRange: [0, 0.55, 1],
    outputRange: [0, 0.35, 1],
  });
  const advancedPanelTranslateY = accordionProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [-12, 0],
  });
  const advancedPanelMarginTop = accordionProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -6],
  });

  const animateAccordion = (nextOpen: boolean, nextHeight = advancedContentHeight) => {
    const velocity = nextOpen ? 2.4 : -2;

    Animated.parallel([
      Animated.spring(accordionProgress, {
        toValue: nextOpen ? 1 : 0,
        velocity,
        tension: 170,
        friction: 20,
        useNativeDriver: false,
      }),
      Animated.spring(accordionHeight, {
        toValue: nextOpen ? nextHeight : 0,
        velocity,
        tension: 180,
        friction: 22,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const handleToggleAdvanced = () => {
    const nextOpen = !advancedOpen;
    setAdvancedOpen(nextOpen);
    animateAccordion(nextOpen);
    if (nextOpen) {
      setTimeout(() => {
        scrollRef.current?.scrollTo({
          animated: true,
          y: Math.max(0, advancedHeaderY - 24),
        });
      }, 110);
    }
  };

  const handleAdvancedLayout = (event: LayoutChangeEvent) => {
    const nextHeight = Math.ceil(event.nativeEvent.layout.height);
    if (!nextHeight || nextHeight === advancedContentHeight) {
      return;
    }

    setAdvancedContentHeight(nextHeight);
    if (advancedOpen) {
      animateAccordion(true, nextHeight);
    } else {
      accordionHeight.setValue(0);
    }
  };

  return (
    <Screen>
      <AppHeader onBack={() => navigation.goBack()} title={strings.quality.title} />
      <ScrollView
        contentContainerStyle={[styles.content, { backgroundColor: theme.colors.background }]}
        ref={scrollRef}
      > 
        <View style={[styles.previewCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}> 
          <Text style={[theme.typography.titleSmall, { color: theme.colors.textPrimary, marginBottom: 10 }]}>{strings.quality.beforeAfter}</Text>
          <View style={styles.previewRow}>
            <View style={styles.previewCell}>
              <Image source={{ uri: images[0].uri }} style={styles.previewImage} />
              <Text style={[theme.typography.bodySmall, { color: theme.colors.textSecondary }]}>{strings.common.original}</Text>
              <Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted }]}>{getReadableSize(sourceSize)}</Text>
            </View>
            <View style={styles.previewCell}>
              <Image source={{ uri: images[0].uri }} style={styles.previewImage} />
              <Text style={[theme.typography.bodySmall, { color: theme.colors.textSecondary }]}>{strings.common.preview}</Text>
              <Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted }]}>{getReadableSize(estimatedSize)}</Text>
            </View>
          </View>
        </View>

        {supportsQuality ? (
          <QualitySlider
            onChange={quality => setForm(prev => ({ ...prev, quality }))}
            value={form.quality}
          />
        ) : null}

        <View style={[styles.estimateCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}> 
          <Text style={[theme.typography.titleSmall, { color: theme.colors.textPrimary }]}>{strings.quality.outputSizeEstimate}</Text>
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
            {strings.quality.estimatedSizeLine(getReadableSize(estimatedSize), delta <= 0)}
          </Text>
          <Text
            style={[
              theme.typography.bodySmall,
              { color: delta <= 0 ? theme.colors.success : theme.colors.warning, marginTop: 2 },
            ]}
          >
            {strings.quality.deltaLine(delta, delta <= 0)}
          </Text>
        </View>

        <Pressable
          onLayout={event => setAdvancedHeaderY(event.nativeEvent.layout.y)}
          onPress={handleToggleAdvanced}
          style={[styles.advancedHeader, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
        >
          <Text style={[theme.typography.titleSmall, { color: theme.colors.textPrimary }]}>{strings.quality.advancedOptions}</Text>
          <Animated.View style={{ transform: [{ rotate: chevronRotation }] }}>
            <CaretDown color={theme.colors.textSecondary} size={16} />
          </Animated.View>
        </Pressable>

        <Animated.View
          pointerEvents={advancedOpen ? 'auto' : 'none'}
          style={[
            styles.advancedPanelWrap,
            {
              height: accordionHeight,
              marginTop: advancedPanelMarginTop,
              opacity: advancedPanelOpacity,
              transform: [{ translateY: advancedPanelTranslateY }],
            },
          ]}
        >
          <View
            onLayout={handleAdvancedLayout}
            style={[styles.advancedPanel, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
          >
            <View style={advancedItemStyles.row}>
              <Text style={[advancedItemStyles.rowText, theme.typography.bodyMedium, { color: theme.colors.textPrimary }]}>{strings.quality.preserveExif}</Text>
              <Switch
                onValueChange={value => setForm(prev => ({ ...prev, preserveMetadata: value }))}
                value={form.preserveMetadata}
              />
            </View>
            {targetFormat === 'jpg' ? (
              <View style={advancedItemStyles.row}>
                <Text style={[advancedItemStyles.rowText, theme.typography.bodyMedium, { color: theme.colors.textPrimary }]}>{strings.quality.progressiveLoading}</Text>
                <Switch
                  onValueChange={value => setForm(prev => ({ ...prev, progressive: value }))}
                  value={Boolean(form.progressive)}
                />
              </View>
            ) : null}
            <View style={advancedItemStyles.row}>
              <Text style={[advancedItemStyles.rowText, theme.typography.bodyMedium, { color: theme.colors.textPrimary }]}>{strings.quality.stripColorProfile}</Text>
              <Switch
                onValueChange={value => setForm(prev => ({ ...prev, stripColorProfile: value }))}
                value={Boolean(form.stripColorProfile)}
              />
            </View>
          </View>
        </Animated.View>

        <View style={styles.presetButton}>
          <Button
            fullWidth
            label={strings.quality.saveAsPreset}
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
          label={strings.quality.convertNow}
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
  advancedPanelWrap: {
    overflow: 'hidden',
  },
  advancedPanel: {
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 14,
    paddingVertical: 8,
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
