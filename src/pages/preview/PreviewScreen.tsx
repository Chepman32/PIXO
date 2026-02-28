import React, { useMemo, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Share from 'react-native-share';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { DownloadSimple, ShareNetwork } from 'phosphor-react-native';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import { AppHeader } from '../../shared/ui/AppHeader';
import { Screen } from '../../shared/ui/Screen';
import { RootStackParamList } from '../../app/navigation/types';
import { useTheme } from '../../app/providers/ThemeProvider';
import { getReadableSize } from '../../shared/lib/file';
import { useToast } from '../../app/providers/ToastProvider';

type Props = NativeStackScreenProps<RootStackParamList, 'Preview'>;

export const PreviewScreen: React.FC<Props> = ({ navigation, route }) => {
  const theme = useTheme();
  const { showToast } = useToast();
  const { result, compareUri } = route.params;
  const [mode, setMode] = useState<'original' | 'converted' | 'side'>('side');

  const activeUri = useMemo(() => {
    if (mode === 'original' && compareUri) {
      return compareUri;
    }
    return result.outputPath;
  }, [compareUri, mode, result.outputPath]);

  const onSave = async () => {
    try {
      await CameraRoll.saveAsset(result.outputPath, { type: 'photo' });
      showToast({ title: 'Saved to Photos', tone: 'success' });
    } catch {
      showToast({ title: 'Save failed', tone: 'error' });
    }
  };

  return (
    <Screen>
      <AppHeader
        onBack={() => navigation.goBack()}
        rightSlot={
          <View style={styles.rightActions}>
            <Pressable onPress={onSave} style={styles.actionButton}>
              <DownloadSimple color={theme.colors.textPrimary} size={18} />
            </Pressable>
            <Pressable
              onPress={() => Share.open({ url: `file://${result.outputPath}` }).catch(() => undefined)}
              style={styles.actionButton}
            >
              <ShareNetwork color={theme.colors.textPrimary} size={18} />
            </Pressable>
          </View>
        }
        title="Preview"
      />

      <View style={[styles.content, { backgroundColor: theme.colors.background }]}> 
        {compareUri ? (
          <View style={styles.modeRow}>
            {[
              { id: 'original', label: 'Original' },
              { id: 'converted', label: 'Converted' },
              { id: 'side', label: 'Side by Side' },
            ].map(item => (
              <Pressable
                key={item.id}
                onPress={() => setMode(item.id as 'original' | 'converted' | 'side')}
                style={[
                  styles.modeButton,
                  {
                    backgroundColor:
                      mode === item.id ? theme.colors.primarySubtle : theme.colors.surface,
                    borderColor:
                      mode === item.id ? theme.colors.primary : theme.colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    theme.typography.labelMedium,
                    {
                      color: mode === item.id ? theme.colors.primary : theme.colors.textSecondary,
                    },
                  ]}
                >
                  {item.label}
                </Text>
              </Pressable>
            ))}
          </View>
        ) : null}

        {mode === 'side' && compareUri ? (
          <View style={styles.sideBySide}>
            <ScrollView contentContainerStyle={styles.zoomContent} maximumZoomScale={5} minimumZoomScale={0.6}>
              <Image source={{ uri: compareUri }} style={styles.sideImage} />
            </ScrollView>
            <ScrollView contentContainerStyle={styles.zoomContent} maximumZoomScale={5} minimumZoomScale={0.6}>
              <Image source={{ uri: result.outputPath }} style={styles.sideImage} />
            </ScrollView>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.zoomContent}
            maximumZoomScale={5}
            minimumZoomScale={0.6}
          >
            <Image source={{ uri: activeUri }} style={styles.image} />
          </ScrollView>
        )}

        <View style={[styles.infoBar, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}> 
          <Text numberOfLines={1} style={[theme.typography.bodySmall, { color: theme.colors.textSecondary }]}> 
            {result.outputFileName} • {result.dimensions.width}×{result.dimensions.height} •{' '}
            {getReadableSize(result.size.convertedSize)}
          </Text>
        </View>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  rightActions: {
    flexDirection: 'row',
    gap: 4,
    marginRight: 8,
  },
  actionButton: {
    alignItems: 'center',
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  modeRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  modeButton: {
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  zoomContent: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 420,
    padding: 16,
  },
  image: {
    borderRadius: 12,
    height: 420,
    resizeMode: 'contain',
    width: '100%',
  },
  sideBySide: {
    flex: 1,
    flexDirection: 'row',
  },
  sideImage: {
    borderRadius: 8,
    height: 380,
    resizeMode: 'contain',
    width: '100%',
  },
  infoBar: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
});
