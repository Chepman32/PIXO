import React, { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { ArrowsLeftRight, PlusCircle, Star } from 'phosphor-react-native';
import { useAppStore } from '../../app/providers/store/useAppStore';
import { useTheme } from '../../app/providers/ThemeProvider';
import { QUICK_ACTIONS } from '../../shared/config/formats';
import { Screen } from '../../shared/ui/Screen';
import { AppHeader } from '../../shared/ui/AppHeader';
import { Button } from '../../shared/ui/Button';
import { ConversionHistoryCard } from '../../widgets/conversion-card/ConversionHistoryCard';
import { EmptyState } from '../../shared/ui/EmptyState';
import { ImagePickerSheet } from '../../widgets/image-picker/ImagePickerSheet';
import { ConversionOptions, ImageAsset, SupportedOutputFormat } from '../../types/models';
import { getQuickActionLabel, useStrings } from '../../shared/lib/i18n';

export const HomeScreen: React.FC = () => {
  const theme = useTheme();
  const strings = useStrings();
  const navigation = useNavigation<any>();
  const history = useAppStore(state => state.history);
  const presets = useAppStore(state => state.presets);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [pendingPreset, setPendingPreset] = useState<{
    target?: SupportedOutputFormat;
    options?: Partial<ConversionOptions>;
  } | null>(null);

  const recent = useMemo(() => history.slice(0, 5), [history]);
  const quickActions = useMemo(
    () => QUICK_ACTIONS.filter(action => action.type !== 'preset'),
    [],
  );
  const presetItems = useMemo(() => presets.slice(0, 10), [presets]);

  const openPicker = (target?: SupportedOutputFormat, options?: Partial<ConversionOptions>) => {
    setPendingPreset({ target, options });
    setPickerVisible(true);
  };

  const handleSelection = (assets: ImageAsset[]) => {
    navigation.navigate('FormatSelection', {
      images: assets,
      initialTarget: pendingPreset?.target,
      options: pendingPreset?.options,
    });
  };

  return (
    <Screen>
      <AppHeader title="Squoze" />
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: 100, backgroundColor: theme.colors.background },
        ]}
      >
        <Pressable onPress={() => openPicker()} style={styles.actionWrap}>
          <LinearGradient
            colors={[theme.colors.primarySubtle, theme.colors.surface]}
            style={[styles.addCard, { borderColor: 'rgba(99,102,241,0.42)' }]}
          >
            <PlusCircle color={theme.colors.primary} size={52} weight="duotone" />
            <Text style={[theme.typography.titleMedium, { color: theme.colors.textPrimary, marginTop: 8 }]}> 
              {strings.home.addImage}
            </Text>
            <Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted, marginTop: 6 }]}> 
              {strings.home.tapToSelect}
            </Text>
          </LinearGradient>
        </Pressable>

        <View style={styles.sectionHeader}>
          <Text style={[theme.typography.titleSmall, { color: theme.colors.textSecondary }]}>{strings.onboarding.preset}</Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.quickActions}
          horizontal
          showsHorizontalScrollIndicator={false}
        >
          {presetItems.map(preset => (
            <Pressable
              key={preset.id}
              onPress={() => openPicker(preset.to, preset.options)}
              style={({ pressed }) => [
                styles.quickPill,
                {
                  backgroundColor: theme.colors.surfaceSecondary,
                  borderColor: theme.colors.border,
                  opacity: pressed ? 0.88 : 1,
                },
              ]}
            >
              <ArrowsLeftRight color={theme.colors.primary} size={18} />
              <Text
                numberOfLines={1}
                style={[theme.typography.labelMedium, { color: theme.colors.textPrimary, maxWidth: 180 }]}
              >
                {preset.name}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        <View style={styles.sectionHeader}>
          <Text style={[theme.typography.titleSmall, { color: theme.colors.textSecondary }]}>{strings.home.quickActions}</Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.quickActions}
          horizontal
          showsHorizontalScrollIndicator={false}
        >
          {quickActions.map(action => (
            <Pressable
              key={action.id}
              onPress={() => {
                if (action.type === 'favorites') {
                  navigation.navigate('History');
                  return;
                }
                if (action.type === 'batch') {
                  navigation.navigate('Batch', { openPicker: true });
                  return;
                }
                openPicker(action.to);
              }}
              style={({ pressed }) => [
                styles.quickPill,
                {
                  backgroundColor: theme.colors.surfaceSecondary,
                  borderColor: theme.colors.border,
                  opacity: pressed ? 0.88 : 1,
                },
              ]}
            >
              {action.type === 'favorites' ? (
                <Star color={theme.colors.accent} size={18} weight="fill" />
              ) : (
                <ArrowsLeftRight color={theme.colors.primary} size={18} />
              )}
              <Text style={[theme.typography.labelMedium, { color: theme.colors.textPrimary }]}> 
                {getQuickActionLabel(action.id as Parameters<typeof getQuickActionLabel>[0])}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        <View style={styles.sectionHeaderRow}>
          <Text style={[theme.typography.titleSmall, { color: theme.colors.textSecondary }]}>{strings.home.recentConversions}</Text>
          <Button
            label={strings.home.seeAll}
            onPress={() => navigation.navigate('History')}
            size="small"
            variant="ghost"
          />
        </View>

        {recent.length ? (
          <View style={styles.recentList}>
            {recent.map(item => (
              <ConversionHistoryCard
                item={item}
                key={item.id}
                onPress={() => navigation.navigate('Preview', { result: item })}
              />
            ))}
          </View>
        ) : (
          <EmptyState
            description={strings.home.noRecentDescription}
            title={strings.home.noRecentTitle}
          />
        )}
      </ScrollView>

      <ImagePickerSheet
        onClose={() => setPickerVisible(false)}
        onSelect={handleSelection}
        selectionLimit={1}
        visible={pickerVisible}
      />
    </Screen>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingTop: 12,
  },
  actionWrap: {
    marginHorizontal: 20,
  },
  addCard: {
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 2,
    height: 200,
    justifyContent: 'center',
  },
  sectionHeader: {
    marginTop: 22,
    paddingHorizontal: 20,
  },
  quickActions: {
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  quickPill: {
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: 8,
    minHeight: 44,
    paddingHorizontal: 12,
  },
  sectionHeaderRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 26,
    paddingHorizontal: 20,
  },
  recentList: {
    marginTop: 8,
  },
});
