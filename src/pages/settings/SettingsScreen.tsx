import React, { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../app/providers/ThemeProvider';
import { Screen } from '../../shared/ui/Screen';
import { useAppStore } from '../../app/providers/store/useAppStore';
import { FORMAT_META, SUPPORTED_OUTPUT_FORMATS } from '../../shared/config/formats';
import { Button } from '../../shared/ui/Button';
import { getReadableSize } from '../../shared/lib/file';
import { FS_CACHE, FS_OUTPUT } from '../../shared/config/filesystem';
import {
  getFormatDescription,
  getLanguageSettingLabel,
  getLocaleNativeName,
  getSystemLanguageLabel,
  SUPPORTED_APP_LOCALES,
  useLocale,
  useStrings,
} from '../../shared/lib/i18n';
import { AppLocalePreference } from '../../types/models';

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
  const strings = useStrings();
  const insets = useSafeAreaInsets();
  const maxSheetHeight = Dimensions.get('window').height - insets.top - 20;

  return (
    <Modal animationType="slide" transparent visible={visible}>
      <View style={[styles.modalBackdrop, { paddingTop: insets.top + 12 }]}>
        <View
          style={[
            styles.modalCard,
            { backgroundColor: theme.colors.surface, paddingBottom: 24 + insets.bottom },
            { maxHeight: maxSheetHeight },
          ]}
        > 
          <View style={styles.modalHeader}>
            <Text style={[theme.typography.titleMedium, { color: theme.colors.textPrimary }]}>{title}</Text>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <X color={theme.colors.textSecondary} size={18} />
            </Pressable>
          </View>
          <ScrollView
            contentContainerStyle={styles.modalOptionsContent}
            showsVerticalScrollIndicator={false}
          >
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
          </ScrollView>
          <View style={{ marginTop: 12 }}>
            <Button fullWidth label={strings.common.close} onPress={onClose} variant="ghost" />
          </View>
        </View>
      </View>
    </Modal>
  );
};

export const SettingsScreen: React.FC = () => {
  const theme = useTheme();
  const strings = useStrings();
  const { locale, localePreference } = useLocale();
  const insets = useSafeAreaInsets();
  const maxSheetHeight = Dimensions.get('window').height - insets.top - 20;
  const settings = useAppStore(state => state.settings);
  const currentLocalePreference = settings.locale ?? 'system';
  const history = useAppStore(state => state.history);
  const setSettings = useAppStore(state => state.setSettings);
  const clearHistory = useAppStore(state => state.clearHistory);

  const [cacheSize, setCacheSize] = useState(0);
  const [formatModalVisible, setFormatModalVisible] = useState(false);
  const [localeModalVisible, setLocaleModalVisible] = useState(false);
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
        <Text style={[theme.typography.headlineMedium, { color: theme.colors.textPrimary }]}>{strings.settings.title}</Text>

        <Text style={[styles.sectionLabel, theme.typography.labelMedium, { color: theme.colors.textMuted }]}>{strings.settings.preferences}</Text>
        <View style={[styles.group, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}> 
          {settingRow(
            getLanguageSettingLabel(localePreference),
            currentLocalePreference === 'system'
              ? getSystemLanguageLabel(localePreference)
              : getLocaleNativeName(locale),
            () => setLocaleModalVisible(true),
          )}
          {settingRow(
            strings.settings.defaultFormat,
            FORMAT_META[settings.defaultFormat].label,
            () => setFormatModalVisible(true),
          )}
          {settingRow(strings.settings.defaultQuality, `${settings.defaultQuality}%`, () => setQualityModalVisible(true))}
          {toggleRow(strings.settings.preserveMetadata, settings.preserveMetadata, value =>
            setSettings({ preserveMetadata: value }),
          )}
          {toggleRow(strings.settings.autoSaveToPhotos, settings.autoSaveToPhotos, value =>
            setSettings({ autoSaveToPhotos: value }),
          )}
        </View>

        <Text style={[styles.sectionLabel, theme.typography.labelMedium, { color: theme.colors.textMuted }]}>{strings.settings.appearance}</Text>
        <View style={[styles.group, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}> 
          {settingRow(
            strings.settings.theme,
            settings.theme === 'system'
              ? strings.settings.system
              : settings.theme === 'light'
                ? strings.settings.light
                : strings.settings.dark,
            () => setThemeModalVisible(true),
          )}
        </View>

        <Text style={[styles.sectionLabel, theme.typography.labelMedium, { color: theme.colors.textMuted }]}>{strings.settings.storage}</Text>
        <View style={[styles.group, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}> 
          {settingRow(strings.settings.cacheSize, getReadableSize(cacheSize), async () => {
            await RNFS.unlink(FS_CACHE).catch(() => undefined);
            await RNFS.mkdir(FS_CACHE).catch(() => undefined);
            setCacheSize(0);
          })}
          {settingRow(strings.settings.clearHistory, strings.settings.historyItems(history.length), () => {
            Alert.alert(strings.settings.clearHistoryTitle, strings.settings.clearHistoryBody, [
              { text: strings.common.cancel, style: 'cancel' },
              {
                text: strings.common.clear,
                style: 'destructive',
                onPress: clearHistory,
              },
            ]);
          }, true)}
        </View>

        <Text style={[styles.sectionLabel, theme.typography.labelMedium, { color: theme.colors.textMuted }]}>{strings.settings.about}</Text>
        <View style={[styles.group, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}> 
          {settingRow(strings.settings.version, '1.0.0')}
{settingRow(strings.settings.privacyPolicy, strings.common.open, () => Linking.openURL('https://www.termsfeed.com/live/8ad2944c-d875-428d-aaed-10da0de31846'))}
        </View>
      </ScrollView>

      <SelectModal
        onClose={() => setLocaleModalVisible(false)}
        onSelect={id => setSettings({ locale: id as AppLocalePreference })}
        options={[
          {
            id: 'system',
            label: getSystemLanguageLabel(localePreference),
            description: getLocaleNativeName(locale),
          },
          ...SUPPORTED_APP_LOCALES.map(item => ({
            id: item,
            label: getLocaleNativeName(item),
          })),
        ]}
        selected={currentLocalePreference}
        title={getLanguageSettingLabel(localePreference)}
        visible={localeModalVisible}
      />

      <SelectModal
        onClose={() => setFormatModalVisible(false)}
        onSelect={id => setSettings({ defaultFormat: id as any })}
        options={SUPPORTED_OUTPUT_FORMATS.map(format => ({
          id: format,
          label: FORMAT_META[format].label,
          description: getFormatDescription(format),
        }))}
        selected={settings.defaultFormat}
        title={strings.settings.defaultFormat}
        visible={formatModalVisible}
      />

      <SelectModal
        onClose={() => setThemeModalVisible(false)}
        onSelect={id => setSettings({ theme: id as 'system' | 'light' | 'dark' })}
        options={[
          { id: 'system', label: strings.settings.system, description: strings.settings.matchDeviceSettings },
          { id: 'light', label: strings.settings.light, description: strings.settings.alwaysLightMode },
          { id: 'dark', label: strings.settings.dark, description: strings.settings.alwaysDarkMode },
        ]}
        selected={settings.theme}
        title={strings.settings.theme}
        visible={themeModalVisible}
      />

      <Modal animationType="slide" transparent visible={qualityModalVisible}>
        <View style={[styles.modalBackdrop, { paddingTop: insets.top + 12 }]}>
          <View
            style={[
              styles.modalCard,
              { backgroundColor: theme.colors.surface, paddingBottom: 24 + insets.bottom },
              { maxHeight: maxSheetHeight },
            ]}
          > 
            <View style={styles.modalHeader}>
              <Text style={[theme.typography.titleMedium, { color: theme.colors.textPrimary }]}>{strings.settings.defaultQuality}</Text>
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
                label={strings.common.save}
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
  modalOptionsContent: {
    flexGrow: 0,
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
