import React, { useEffect, useState } from 'react';
import {
  Alert,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import RNFS from 'react-native-fs';
import { CaretRight, Check, X } from 'phosphor-react-native';
import Slider from '@react-native-community/slider';
import { useTheme } from '../../app/providers/ThemeProvider';
import { Screen } from '../../shared/ui/Screen';
import { useAppStore } from '../../app/providers/store/useAppStore';
import { FORMAT_META, SUPPORTED_OUTPUT_FORMATS } from '../../shared/config/formats';
import { Button } from '../../shared/ui/Button';
import { getReadableSize } from '../../shared/lib/file';
import { FS_CACHE, FS_OUTPUT } from '../../shared/config/filesystem';

interface SelectModalProps {
  visible: boolean;
  title: string;
  options: Array<{ id: string; label: string; description?: string }>;
  selected: string;
  onClose: () => void;
  onSelect: (id: string) => void;
}

const SelectModal: React.FC<SelectModalProps> = ({
  visible,
  title,
  options,
  selected,
  onClose,
  onSelect,
}) => {
  const theme = useTheme();

  return (
    <Modal animationType="slide" transparent visible={visible}>
      <View style={styles.modalBackdrop}>
        <View style={[styles.modalCard, { backgroundColor: theme.colors.surface }]}> 
          <View style={styles.modalHeader}>
            <Text style={[theme.typography.titleMedium, { color: theme.colors.textPrimary }]}>{title}</Text>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <X color={theme.colors.textSecondary} size={18} />
            </Pressable>
          </View>
          {options.map(option => (
            <Pressable
              key={option.id}
              onPress={() => {
                onSelect(option.id);
                onClose();
              }}
              style={[styles.modalOption, { borderBottomColor: theme.colors.border }]}
            >
              <View style={styles.modalOptionText}>
                <Text style={[theme.typography.bodyLarge, { color: theme.colors.textPrimary }]}>{option.label}</Text>
                {option.description ? (
                  <Text style={[theme.typography.bodySmall, { color: theme.colors.textSecondary }]}> 
                    {option.description}
                  </Text>
                ) : null}
              </View>
              {selected === option.id ? <Check color={theme.colors.primary} size={18} /> : null}
            </Pressable>
          ))}
          <View style={{ marginTop: 12 }}>
            <Button fullWidth label="Close" onPress={onClose} variant="ghost" />
          </View>
        </View>
      </View>
    </Modal>
  );
};

export const SettingsScreen: React.FC = () => {
  const theme = useTheme();
  const settings = useAppStore(state => state.settings);
  const history = useAppStore(state => state.history);
  const setSettings = useAppStore(state => state.setSettings);
  const clearHistory = useAppStore(state => state.clearHistory);

  const [cacheSize, setCacheSize] = useState(0);
  const [formatModalVisible, setFormatModalVisible] = useState(false);
  const [themeModalVisible, setThemeModalVisible] = useState(false);
  const [qualityModalVisible, setQualityModalVisible] = useState(false);
  const [qualityDraft, setQualityDraft] = useState(settings.defaultQuality);

  useEffect(() => {
    const loadCacheSize = async () => {
      const dirs = [FS_CACHE, FS_OUTPUT];
      let total = 0;
      for (const dir of dirs) {
        const exists = await RNFS.exists(dir);
        if (!exists) {
          continue;
        }
        const entries = await RNFS.readDir(dir);
        entries.forEach(entry => {
          total += Number(entry.size);
        });
      }
      setCacheSize(total);
    };

    loadCacheSize().catch(() => {
      setCacheSize(0);
    });
  }, [history.length]);

  const settingRow = (
    label: string,
    value: string,
    onPress?: () => void,
    destructive?: boolean,
  ) => (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        {
          borderBottomColor: theme.colors.border,
          opacity: pressed ? 0.9 : 1,
        },
      ]}
    >
      <Text
        style={[
          theme.typography.bodyLarge,
          { color: destructive ? theme.colors.error : theme.colors.textPrimary },
        ]}
      >
        {label}
      </Text>
      <View style={styles.rowValue}>
        <Text style={[theme.typography.bodyMedium, { color: theme.colors.textSecondary }]}>{value}</Text>
        {onPress ? <CaretRight color={theme.colors.textMuted} size={16} /> : null}
      </View>
    </Pressable>
  );

  const toggleRow = (
    label: string,
    enabled: boolean,
    onToggle: (next: boolean) => void,
  ) => (
    <Pressable
      onPress={() => onToggle(!enabled)}
      style={[styles.row, { borderBottomColor: theme.colors.border }]}
    >
      <Text style={[theme.typography.bodyLarge, { color: theme.colors.textPrimary }]}>{label}</Text>
      <View
        style={[
          styles.switch,
          {
            backgroundColor: enabled ? theme.colors.primary : theme.colors.border,
            justifyContent: enabled ? 'flex-end' : 'flex-start',
          },
        ]}
      >
        <View style={styles.switchThumb} />
      </View>
    </Pressable>
  );

  return (
    <Screen>
      <ScrollView contentContainerStyle={[styles.content, { backgroundColor: theme.colors.background }]}> 
        <Text style={[theme.typography.headlineMedium, { color: theme.colors.textPrimary }]}>Settings</Text>

        <Text style={[styles.sectionLabel, theme.typography.labelMedium, { color: theme.colors.textMuted }]}>PREFERENCES</Text>
        <View style={[styles.group, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}> 
          {settingRow(
            'Default Format',
            FORMAT_META[settings.defaultFormat].label,
            () => setFormatModalVisible(true),
          )}
          {settingRow('Default Quality', `${settings.defaultQuality}%`, () => setQualityModalVisible(true))}
          {toggleRow('Preserve Metadata', settings.preserveMetadata, value =>
            setSettings({ preserveMetadata: value }),
          )}
          {toggleRow('Auto-Save to Photos', settings.autoSaveToPhotos, value =>
            setSettings({ autoSaveToPhotos: value }),
          )}
        </View>

        <Text style={[styles.sectionLabel, theme.typography.labelMedium, { color: theme.colors.textMuted }]}>APPEARANCE</Text>
        <View style={[styles.group, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}> 
          {settingRow('Theme', settings.theme, () => setThemeModalVisible(true))}
        </View>

        <Text style={[styles.sectionLabel, theme.typography.labelMedium, { color: theme.colors.textMuted }]}>STORAGE</Text>
        <View style={[styles.group, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}> 
          {settingRow('Cache Size', getReadableSize(cacheSize), async () => {
            await RNFS.unlink(FS_CACHE).catch(() => undefined);
            await RNFS.mkdir(FS_CACHE).catch(() => undefined);
            setCacheSize(0);
          })}
          {settingRow('Clear History', `${history.length} items`, () => {
            Alert.alert('Clear History', 'Delete all conversion history?', [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Clear',
                style: 'destructive',
                onPress: clearHistory,
              },
            ]);
          }, true)}
        </View>

        <Text style={[styles.sectionLabel, theme.typography.labelMedium, { color: theme.colors.textMuted }]}>ABOUT</Text>
        <View style={[styles.group, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}> 
          {settingRow('Version', '1.0.0')}
          {settingRow('Rate PIXO', 'Open', () => Linking.openURL('https://apps.apple.com'))}
          {settingRow('Privacy Policy', 'Open', () => Linking.openURL('https://example.com/privacy'))}
          {settingRow('Terms of Service', 'Open', () => Linking.openURL('https://example.com/terms'))}
        </View>
      </ScrollView>

      <SelectModal
        onClose={() => setFormatModalVisible(false)}
        onSelect={id => setSettings({ defaultFormat: id as any })}
        options={SUPPORTED_OUTPUT_FORMATS.map(format => ({
          id: format,
          label: FORMAT_META[format].label,
          description: FORMAT_META[format].description,
        }))}
        selected={settings.defaultFormat}
        title="Default Format"
        visible={formatModalVisible}
      />

      <SelectModal
        onClose={() => setThemeModalVisible(false)}
        onSelect={id => setSettings({ theme: id as 'system' | 'light' | 'dark' })}
        options={[
          { id: 'system', label: 'System', description: 'Match device settings' },
          { id: 'light', label: 'Light', description: 'Always light mode' },
          { id: 'dark', label: 'Dark', description: 'Always dark mode' },
        ]}
        selected={settings.theme}
        title="Theme"
        visible={themeModalVisible}
      />

      <Modal animationType="slide" transparent visible={qualityModalVisible}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: theme.colors.surface }]}> 
            <View style={styles.modalHeader}>
              <Text style={[theme.typography.titleMedium, { color: theme.colors.textPrimary }]}>Default Quality</Text>
              <Pressable onPress={() => setQualityModalVisible(false)} style={styles.closeButton}>
                <X color={theme.colors.textSecondary} size={18} />
              </Pressable>
            </View>
            <Text style={[theme.typography.displayLarge, styles.qualityText, { color: theme.colors.textPrimary }]}> 
              {qualityDraft}%
            </Text>
            <Slider
              maximumTrackTintColor={theme.colors.border}
              maximumValue={100}
              minimumTrackTintColor={theme.colors.primary}
              minimumValue={1}
              onValueChange={value => setQualityDraft(Math.round(value))}
              step={1}
              thumbTintColor={theme.colors.primary}
              value={qualityDraft}
            />
            <View style={styles.modalActions}>
              <Button
                fullWidth
                label="Save"
                onPress={() => {
                  setSettings({ defaultQuality: qualityDraft });
                  setQualityModalVisible(false);
                }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </Screen>
  );
};

const styles = StyleSheet.create({
  content: {
    padding: 20,
    paddingBottom: 120,
  },
  sectionLabel: {
    letterSpacing: 1,
    marginBottom: 8,
    marginTop: 24,
  },
  group: {
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  row: {
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    height: 52,
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  rowValue: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  switch: {
    borderRadius: 18,
    height: 30,
    paddingHorizontal: 2,
    width: 50,
  },
  switchThumb: {
    backgroundColor: '#FFFFFF',
    borderRadius: 13,
    height: 26,
    marginTop: 2,
    width: 26,
  },
  modalBackdrop: {
    backgroundColor: 'rgba(0,0,0,0.45)',
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalCard: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    paddingBottom: 24,
  },
  modalHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  closeButton: {
    alignItems: 'center',
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  modalOption: {
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  modalOptionText: {
    flex: 1,
  },
  qualityText: {
    fontSize: 48,
    lineHeight: 58,
    textAlign: 'center',
  },
  modalActions: {
    marginTop: 16,
  },
});
