import React, { useMemo } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { CaretDown, CaretUp, Eye, EyeSlash, Trash } from 'phosphor-react-native';
import { useNavigation } from '@react-navigation/native';
import { AppHeader } from '../../shared/ui/AppHeader';
import { Screen } from '../../shared/ui/Screen';
import { useTheme } from '../../app/providers/ThemeProvider';
import { useAppStore } from '../../app/providers/store/useAppStore';
import { Button } from '../../shared/ui/Button';
import { FORMAT_META } from '../../shared/config/formats';
import { useStrings } from '../../shared/lib/i18n';

export const PresetManagementScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const theme = useTheme();
  const strings = useStrings();
  const presets = useAppStore(state => state.presets);
  const movePreset = useAppStore(state => state.movePreset);
  const removePreset = useAppStore(state => state.removePreset);
  const setPresetHidden = useAppStore(state => state.setPresetHidden);

  const visibleCount = useMemo(
    () => presets.filter(item => !item.hidden).length,
    [presets],
  );
  const managePresetsLabel = strings.settings.managePresets ?? 'Manage Presets';
  const visiblePresetsLabel =
    strings.settings.visiblePresets?.(visibleCount, presets.length) ??
    `${visibleCount} of ${presets.length} visible`;
  const predefinedLabel = strings.settings.predefinedPreset ?? 'Predefined';
  const customLabel = strings.settings.customPreset ?? 'Custom';
  const moveUpLabel = strings.settings.movePresetUp ?? 'Move preset up';
  const moveDownLabel = strings.settings.movePresetDown ?? 'Move preset down';
  const hideLabel = strings.settings.hidePreset ?? 'Hide';
  const showLabel = strings.settings.showPreset ?? 'Show';
  const removeLabel = strings.settings.removePreset ?? 'Remove';
  const removeBody = strings.settings.removePresetBody ?? 'Delete this custom preset?';

  return (
    <Screen>
      <AppHeader onBack={() => navigation.goBack()} title={managePresetsLabel} />
      <ScrollView
        contentContainerStyle={[styles.content, { backgroundColor: theme.colors.background }]}
      >
        <View
          style={[
            styles.summaryCard,
            { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
          ]}
        >
          <Text style={[theme.typography.titleMedium, { color: theme.colors.textPrimary }]}>{managePresetsLabel}</Text>
          <Text
            style={[
              theme.typography.bodyMedium,
              { color: theme.colors.textSecondary, marginTop: 6 },
            ]}
          >
            {visiblePresetsLabel}
          </Text>
        </View>

        <View style={styles.list}>
          {presets.map((preset, index) => {
            const isFirst = index === 0;
            const isLast = index === presets.length - 1;

            return (
              <View
                key={preset.id}
                style={[
                  styles.card,
                  { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
                ]}
              >
                <View style={styles.cardTop}>
                  <View style={styles.cardText}>
                    <Text
                      style={[theme.typography.titleSmall, { color: theme.colors.textPrimary }]}
                    >
                      {preset.name}
                    </Text>
                    <Text
                      style={[
                        theme.typography.bodySmall,
                        { color: theme.colors.textSecondary, marginTop: 4 },
                      ]}
                    >
                      {preset.from
                        ? `${FORMAT_META[preset.from].label} -> ${FORMAT_META[preset.to].label}`
                        : FORMAT_META[preset.to].label}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.badge,
                      {
                        backgroundColor: preset.system
                          ? theme.colors.surfaceSecondary
                          : theme.colors.primarySubtle,
                      },
                    ]}
                  >
                    <Text style={[theme.typography.labelSmall, { color: theme.colors.textPrimary }]}>
                      {preset.system ? predefinedLabel : customLabel}
                    </Text>
                  </View>
                </View>

                <View style={styles.actionsRow}>
                  <View style={styles.reorderRow}>
                    <Pressable
                      accessibilityLabel={moveUpLabel}
                      disabled={isFirst}
                      onPress={() => movePreset(preset.id, 'up')}
                      style={[
                        styles.iconButton,
                        {
                          backgroundColor: theme.colors.surfaceSecondary,
                          opacity: isFirst ? 0.45 : 1,
                        },
                      ]}
                    >
                      <CaretUp color={theme.colors.textPrimary} size={18} />
                    </Pressable>
                    <Pressable
                      accessibilityLabel={moveDownLabel}
                      disabled={isLast}
                      onPress={() => movePreset(preset.id, 'down')}
                      style={[
                        styles.iconButton,
                        {
                          backgroundColor: theme.colors.surfaceSecondary,
                          opacity: isLast ? 0.45 : 1,
                        },
                      ]}
                    >
                      <CaretDown color={theme.colors.textPrimary} size={18} />
                    </Pressable>
                  </View>

                  {preset.system ? (
                    <Button
                      label={preset.hidden ? showLabel : hideLabel}
                      leftIcon={
                        preset.hidden ? (
                          <Eye color={theme.colors.textPrimary} size={16} />
                        ) : (
                          <EyeSlash color={theme.colors.textPrimary} size={16} />
                        )
                      }
                      onPress={() => setPresetHidden(preset.id, !preset.hidden)}
                      size="small"
                      variant="secondary"
                    />
                  ) : (
                    <Button
                      label={removeLabel}
                      leftIcon={<Trash color={theme.colors.white} size={16} />}
                      onPress={() =>
                        Alert.alert(removeLabel, removeBody, [
                          { text: strings.common.cancel, style: 'cancel' },
                          {
                            text: removeLabel,
                            style: 'destructive',
                            onPress: () => removePreset(preset.id),
                          },
                        ])
                      }
                      size="small"
                      variant="destructive"
                    />
                  )}
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  content: {
    gap: 14,
    padding: 20,
    paddingBottom: 120,
  },
  summaryCard: {
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
  },
  list: {
    gap: 12,
  },
  card: {
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 14,
  },
  cardTop: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
  },
  cardText: {
    flex: 1,
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  actionsRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
  },
  reorderRow: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    alignItems: 'center',
    borderRadius: 12,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
});
