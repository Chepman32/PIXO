import React, { useEffect, useMemo, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Images } from 'phosphor-react-native';
import { AppHeader } from '../../shared/ui/AppHeader';
import { Screen } from '../../shared/ui/Screen';
import { useTheme } from '../../app/providers/ThemeProvider';
import { Button } from '../../shared/ui/Button';
import { ImagePickerSheet } from '../../widgets/image-picker/ImagePickerSheet';
import { ImageAsset, SupportedOutputFormat } from '../../types/models';
import { getReadableSize } from '../../shared/lib/file';

export const ConvertScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const [pickerVisible, setPickerVisible] = useState(false);
  const [assets, setAssets] = useState<ImageAsset[]>(route.params?.initialAssets ?? []);
  const presetTarget = route.params?.presetTarget as SupportedOutputFormat | undefined;

  useEffect(() => {
    if (route.params?.initialAssets?.length) {
      setAssets(route.params.initialAssets);
    }
  }, [route.params?.initialAssets]);

  const totalSize = useMemo(
    () => assets.reduce((sum, item) => sum + item.fileSize, 0),
    [assets],
  );

  return (
    <Screen>
      <AppHeader title="Convert" />
      <ScrollView contentContainerStyle={[styles.content, { backgroundColor: theme.colors.background }]}> 
        {assets.length ? (
          <>
            <View style={[styles.summary, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}> 
              <View style={styles.summaryRow}>
                <Images color={theme.colors.primary} size={24} />
                <View style={styles.summaryTextWrap}>
                  <Text style={[theme.typography.titleSmall, { color: theme.colors.textPrimary }]}> 
                    {assets.length} image{assets.length > 1 ? 's' : ''} selected
                  </Text>
                  <Text style={[theme.typography.bodySmall, { color: theme.colors.textSecondary }]}> 
                    Total size: {getReadableSize(totalSize)}
                  </Text>
                </View>
              </View>
              <View style={styles.grid}>
                {assets.slice(0, 12).map(asset => (
                  <Image key={asset.id} source={{ uri: asset.uri }} style={styles.thumb} />
                ))}
              </View>
            </View>

            <Button
              fullWidth
              label="Select Format"
              onPress={() =>
                navigation.navigate('FormatSelection', {
                  images: assets,
                  initialTarget: presetTarget,
                })
              }
            />
            <View style={styles.gap} />
            <Button
              fullWidth
              label="Add More Images"
              onPress={() => setPickerVisible(true)}
              variant="secondary"
            />
          </>
        ) : (
          <View style={styles.emptyWrap}>
            <Text style={[theme.typography.titleLarge, { color: theme.colors.textPrimary }]}>No images selected</Text>
            <Text style={[theme.typography.bodyMedium, { color: theme.colors.textSecondary, marginTop: 6 }]}> 
              Add images from library, camera, or files to start conversion.
            </Text>
            <View style={styles.emptyAction}>
              <Button label="Add Images" onPress={() => setPickerVisible(true)} />
            </View>
          </View>
        )}
      </ScrollView>

      <ImagePickerSheet
        onClose={() => setPickerVisible(false)}
        onSelect={selected => setAssets(prev => [...prev, ...selected])}
        visible={pickerVisible}
      />
    </Screen>
  );
};

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    gap: 12,
    padding: 20,
  },
  summary: {
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 14,
  },
  summaryRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  summaryTextWrap: {
    flex: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14,
  },
  thumb: {
    borderRadius: 8,
    height: 72,
    width: 72,
  },
  gap: {
    height: 2,
  },
  emptyWrap: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    marginTop: 120,
    paddingHorizontal: 20,
  },
  emptyAction: {
    marginTop: 24,
    minWidth: 180,
  },
});
