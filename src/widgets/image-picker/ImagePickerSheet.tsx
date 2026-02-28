import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Camera, Images, X } from 'phosphor-react-native';
import { pickImageFromCamera, pickImagesFromFiles, pickImagesFromLibrary } from '../../features/select-image/pickImages';
import { useTheme } from '../../app/providers/ThemeProvider';
import { ImageAsset } from '../../types/models';
import { Button } from '../../shared/ui/Button';
import { haptic } from '../../shared/lib/haptics';
import { getErrorMessage } from '../../shared/lib/errors';

interface ImagePickerSheetProps {
  visible: boolean;
  selectionLimit?: number;
  onClose: () => void;
  onSelect: (assets: ImageAsset[]) => void;
  onError?: (message: string) => void;
}

const OPTION_ROW_HEIGHT = 56;

export const ImagePickerSheet: React.FC<ImagePickerSheetProps> = ({
  visible,
  selectionLimit = 100,
  onClose,
  onSelect,
  onError,
}) => {
  const theme = useTheme();
  const [loading, setLoading] = useState<'library' | 'camera' | 'files' | null>(null);

  const runAction = async (action: 'library' | 'camera' | 'files') => {
    try {
      setLoading(action);
      let selected: ImageAsset[] = [];
      if (action === 'library') {
        selected = await pickImagesFromLibrary(selectionLimit);
      } else if (action === 'camera') {
        selected = await pickImageFromCamera();
      } else {
        selected = await pickImagesFromFiles();
      }

      if (selected.length) {
        haptic.success();
        onSelect(selected);
        onClose();
      }
    } catch (error) {
      onError?.(getErrorMessage(error));
    } finally {
      setLoading(null);
    }
  };

  const options = useMemo(
    () => [
      {
        id: 'library',
        title: 'Photo Library',
        subtitle: 'Select one or more photos',
        icon: <Images color={theme.colors.primary} size={22} />,
      },
      {
        id: 'camera',
        title: 'Camera',
        subtitle: 'Take a new photo',
        icon: <Camera color={theme.colors.primary} size={22} />,
      },
      {
        id: 'files',
        title: 'Files',
        subtitle: 'Import from local files',
        icon: <Images color={theme.colors.primary} size={22} weight="duotone" />,
      },
    ],
    [theme.colors.primary],
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
            },
          ]}
        >
          <View style={styles.dragIndicatorWrap}>
            <View style={[styles.dragIndicator, { backgroundColor: theme.colors.border }]} />
          </View>

          <View style={styles.header}>
            <Text style={[theme.typography.headlineSmall, { color: theme.colors.textPrimary }]}>Select Images</Text>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <X color={theme.colors.textSecondary} size={22} />
            </Pressable>
          </View>

          <FlatList
            data={options}
            keyExtractor={item => item.id}
            renderItem={({ item }) => {
              const isLoading = loading === item.id;
              return (
                <Pressable
                  disabled={Boolean(loading)}
                  onPress={() => runAction(item.id as 'library' | 'camera' | 'files')}
                  style={({ pressed }) => [
                    styles.option,
                    {
                      backgroundColor: theme.colors.surfaceSecondary,
                      opacity: pressed ? 0.92 : 1,
                    },
                  ]}
                >
                  <View style={styles.optionIcon}>{item.icon}</View>
                  <View style={styles.optionTextWrap}>
                    <Text style={[theme.typography.titleSmall, { color: theme.colors.textPrimary }]}>
                      {item.title}
                    </Text>
                    <Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted }]}> 
                      {isLoading ? 'Loading...' : item.subtitle}
                    </Text>
                  </View>
                </Pressable>
              );
            }}
          />

          <View style={styles.footer}>
            <Button label="Close" onPress={onClose} variant="ghost" fullWidth />
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
    maxHeight: '72%',
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
    marginTop: 8,
  },
});
