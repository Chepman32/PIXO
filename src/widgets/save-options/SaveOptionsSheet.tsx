import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Share from 'react-native-share';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import { FolderOpen, Images, ShareNetwork, X } from 'phosphor-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../app/providers/ThemeProvider';
import { useToast } from '../../app/providers/ToastProvider';
import { useStrings } from '../../shared/lib/i18n';
import { haptic } from '../../shared/lib/haptics';
import { Button } from '../../shared/ui/Button';
import { ConversionResult } from '../../types/models';

interface SaveOptionsSheetProps {
  visible: boolean;
  results: ConversionResult[];
  onClose: () => void;
}

const OPTION_ROW_HEIGHT = 60;

export const SaveOptionsSheet: React.FC<SaveOptionsSheetProps> = ({
  visible,
  results,
  onClose,
}) => {
  const theme = useTheme();
  const strings = useStrings();
  const { showToast } = useToast();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState<'gallery' | 'files' | 'share' | null>(null);

  const isPdf = results.every(r => r.outputFormat === 'pdf');
  const urls = results.map(r => (r.outputPath.startsWith('file://') ? r.outputPath : `file://${r.outputPath}`));

  const runAction = async (action: 'gallery' | 'files' | 'share') => {
    try {
      setLoading(action);
      if (action === 'gallery') {
        await Promise.all(results.map(r => CameraRoll.saveAsset(r.outputPath, { type: 'photo' })));
        haptic.success();
        showToast({ title: strings.common.savedToPhotos, tone: 'success' });
        onClose();
      } else if (action === 'files') {
        await Share.open({ urls, saveToFiles: true });
        onClose();
      } else {
        await Share.open({ urls });
        onClose();
      }
    } catch {
      if (action === 'gallery') {
        haptic.error();
        showToast({ title: strings.common.saveFailed, tone: 'error' });
      }
      // Share/Files sheet dismissed by user — no error needed
    } finally {
      setLoading(null);
    }
  };

  const options = useMemo(
    () => [
      {
        id: 'gallery' as const,
        title: strings.complete.saveToGallery,
        subtitle: isPdf ? strings.complete.saveToGalleryUnsupported : strings.complete.saveToGallerySubtitle,
        icon: <Images color={isPdf ? theme.colors.textMuted : theme.colors.primary} size={22} />,
        disabled: isPdf,
      },
      {
        id: 'files' as const,
        title: strings.complete.saveToFiles,
        subtitle: strings.complete.saveToFilesSubtitle,
        icon: <FolderOpen color={theme.colors.primary} size={22} />,
        disabled: false,
      },
      {
        id: 'share' as const,
        title: strings.complete.share,
        subtitle: strings.complete.shareSubtitle,
        icon: <ShareNetwork color={theme.colors.primary} size={22} />,
        disabled: false,
      },
    ],
    [strings, theme.colors, isPdf],
  );

  return (
    <Modal
      animationType="fade"
      onRequestClose={onClose}
      transparent
      visible={visible}
    >
      <View style={styles.backdrop}>
        <Pressable onPress={onClose} style={[styles.scrim, { backgroundColor: theme.colors.overlay }]} />
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
              paddingBottom: 16 + insets.bottom,
            },
          ]}
        >
          <View style={styles.dragIndicatorWrap}>
            <View style={[styles.dragIndicator, { backgroundColor: theme.colors.border }]} />
          </View>

          <View style={styles.header}>
            <Text style={[theme.typography.headlineSmall, { color: theme.colors.textPrimary }]}>
              {strings.complete.saveOptions}
            </Text>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <X color={theme.colors.textSecondary} size={22} />
            </Pressable>
          </View>

          <FlatList
            data={options}
            keyExtractor={item => item.id}
            scrollEnabled={false}
            renderItem={({ item }) => {
              const isLoading = loading === item.id;
              return (
                <Pressable
                  disabled={Boolean(loading) || item.disabled}
                  onPress={() => runAction(item.id)}
                  style={({ pressed }) => [
                    styles.option,
                    {
                      backgroundColor: theme.colors.surfaceSecondary,
                      opacity: item.disabled ? 0.45 : pressed ? 0.88 : 1,
                    },
                  ]}
                >
                  <View style={styles.optionIcon}>{item.icon}</View>
                  <View style={styles.optionTextWrap}>
                    <Text style={[theme.typography.titleSmall, { color: theme.colors.textPrimary }]}>
                      {item.title}
                    </Text>
                    <Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted }]}>
                      {isLoading ? strings.common.loading : item.subtitle}
                    </Text>
                  </View>
                </Pressable>
              );
            }}
          />

          <View style={styles.footer}>
            <Button label={strings.common.close} onPress={onClose} variant="ghost" fullWidth />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  scrim: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 16,
  },
  dragIndicatorWrap: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  dragIndicator: {
    borderRadius: 4,
    height: 5,
    width: 36,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  closeButton: {
    alignItems: 'center',
    borderRadius: 999,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  option: {
    alignItems: 'center',
    borderRadius: 14,
    flexDirection: 'row',
    height: OPTION_ROW_HEIGHT,
    marginBottom: 10,
    paddingHorizontal: 12,
  },
  optionIcon: {
    width: 34,
    alignItems: 'center',
  },
  optionTextWrap: {
    marginLeft: 8,
  },
  footer: {
    marginTop: 4,
  },
});
