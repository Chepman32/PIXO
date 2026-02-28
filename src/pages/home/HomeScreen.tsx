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
import { ImageAsset, SupportedOutputFormat } from '../../types/models';

export const HomeScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation<any>();
  const history = useAppStore(state => state.history);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [pendingPreset, setPendingPreset] = useState<{
    target?: SupportedOutputFormat;
  } | null>(null);

  const recent = useMemo(() => history.slice(0, 5), [history]);

  const openPicker = (target?: SupportedOutputFormat) => {
    setPendingPreset({ target });
    setPickerVisible(true);
  };

  const handleSelection = (assets: ImageAsset[]) => {
    navigation.navigate('FormatSelection', {
      images: assets,
      initialTarget: pendingPreset?.target,
    });
  };

  return (
    <Screen>
      <AppHeader title="PIXO" onSettings={() => navigation.navigate('Settings')} />
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
              Add Image
            </Text>
            <Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted, marginTop: 6 }]}> 
              Tap to select or drag and drop
            </Text>
          </LinearGradient>
        </Pressable>

        <View style={styles.sectionHeader}>
          <Text style={[theme.typography.titleSmall, { color: theme.colors.textSecondary }]}>Quick Actions</Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.quickActions}
          horizontal
          showsHorizontalScrollIndicator={false}
        >
          {QUICK_ACTIONS.map(action => (
            <Pressable
              key={action.id}
              onPress={() => {
                if (action.type === 'favorites') {
                  navigation.navigate('History');
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
                {action.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        <View style={styles.sectionHeaderRow}>
          <Text style={[theme.typography.titleSmall, { color: theme.colors.textSecondary }]}>Recent Conversions</Text>
          <Button
            label="See All"
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
            description="Your converted images will appear here"
            title="No recent conversions"
          />
        )}
      </ScrollView>

      <ImagePickerSheet
        onClose={() => setPickerVisible(false)}
        onSelect={handleSelection}
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
