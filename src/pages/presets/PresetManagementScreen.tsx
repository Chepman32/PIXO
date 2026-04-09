import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  LayoutAnimation,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  UIManager,
  View,
} from 'react-native';
import { Eye, EyeSlash } from 'phosphor-react-native';
import { useNavigation } from '@react-navigation/native';
import {
  PanGestureHandler,
  State,
  type PanGestureHandlerGestureEvent,
  type PanGestureHandlerStateChangeEvent,
} from 'react-native-gesture-handler';
import { AppHeader } from '../../shared/ui/AppHeader';
import { Screen } from '../../shared/ui/Screen';
import { useTheme } from '../../app/providers/ThemeProvider';
import { useAppStore } from '../../app/providers/store/useAppStore';
import { FORMAT_META } from '../../shared/config/formats';
import { useStrings } from '../../shared/lib/i18n';

const ROW_HEIGHT = 84;

const moveItem = <T,>(items: T[], from: number, to: number) => {
  if (from === to) {
    return items;
  }

  const next = [...items];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
};

const MinusGlyph: React.FC = () => <View style={styles.minusGlyph} />;

const DragHandle: React.FC<{ color: string }> = ({ color }) => (
  <View style={styles.dragHandle} pointerEvents="none">
    {[0, 1, 2].map(index => (
      <View
        key={index}
        style={[
          styles.dragHandleLine,
          {
            backgroundColor: color,
          },
        ]}
      />
    ))}
  </View>
);

export const PresetManagementScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const theme = useTheme();
  const strings = useStrings();
  const presets = useAppStore(state => state.presets);
  const reorderPresets = useAppStore(state => state.reorderPresets);
  const removePreset = useAppStore(state => state.removePreset);
  const setPresetHidden = useAppStore(state => state.setPresetHidden);
  const [orderedPresets, setOrderedPresets] = useState(presets);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const orderedPresetsRef = useRef(orderedPresets);
  const dragTop = useRef(new Animated.Value(0)).current;
  const startIndexRef = useRef(0);
  const currentIndexRef = useRef(0);

  const visibleCount = useMemo(
    () => orderedPresets.filter(item => !item.hidden).length,
    [orderedPresets],
  );
  const managePresetsLabel = strings.settings.managePresets ?? 'Manage Presets';
  const visiblePresetsLabel =
    strings.settings.visiblePresets?.(visibleCount, orderedPresets.length) ??
    `${visibleCount} of ${orderedPresets.length} visible`;
  const predefinedLabel = strings.settings.predefinedPreset ?? 'Predefined';
  const customLabel = strings.settings.customPreset ?? 'Custom';
  const hideLabel = strings.settings.hidePreset ?? 'Hide';
  const showLabel = strings.settings.showPreset ?? 'Show';
  const removeLabel = strings.settings.removePreset ?? 'Remove';
  const removeBody = strings.settings.removePresetBody ?? 'Delete this custom preset?';
  const dragHandleLabel = 'Drag to reorder';

  useEffect(() => {
    orderedPresetsRef.current = orderedPresets;
  }, [orderedPresets]);

  useEffect(() => {
    if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

  useEffect(() => {
    if (!draggingId) {
      setOrderedPresets(presets);
    }
  }, [draggingId, presets]);

  const finishDrag = () => {
    const nextOrder = orderedPresetsRef.current;
    reorderPresets(nextOrder);
    Animated.spring(dragTop, {
      toValue: currentIndexRef.current * ROW_HEIGHT,
      useNativeDriver: false,
      speed: 22,
      bounciness: 4,
    }).start(() => {
      setDraggingId(null);
      dragTop.setValue(0);
    });
  };

  const beginDrag = (presetId: string, index: number) => {
    if (draggingId === presetId) {
      return;
    }

    setDraggingId(presetId);
    startIndexRef.current = index;
    currentIndexRef.current = index;
    dragTop.setValue(index * ROW_HEIGHT);
  };

  const updateDragPosition = (translationY: number) => {
    const nextTop = startIndexRef.current * ROW_HEIGHT + translationY;
    dragTop.setValue(nextTop);
    const targetIndex = Math.max(
      0,
      Math.min(
        orderedPresetsRef.current.length - 1,
        Math.round(nextTop / ROW_HEIGHT),
      ),
    );

    if (targetIndex !== currentIndexRef.current) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      const nextOrder = moveItem(
        orderedPresetsRef.current,
        currentIndexRef.current,
        targetIndex,
      );
      orderedPresetsRef.current = nextOrder;
      setOrderedPresets(nextOrder);
      currentIndexRef.current = targetIndex;
    }
  };

  const handleGestureEvent =
    (presetId: string, index: number) =>
    (event: PanGestureHandlerGestureEvent) => {
      if (draggingId !== presetId) {
        beginDrag(presetId, index);
      }
      updateDragPosition(event.nativeEvent.translationY);
    };

  const handleGestureStateChange =
    (presetId: string, index: number) =>
    (event: PanGestureHandlerStateChangeEvent) => {
      const { oldState, state, translationY } = event.nativeEvent;

      if (state === State.BEGAN) {
        beginDrag(presetId, index);
        return;
      }

      if (state === State.ACTIVE) {
        updateDragPosition(translationY);
      }

      if (
        oldState === State.ACTIVE ||
        state === State.END ||
        state === State.CANCELLED ||
        state === State.FAILED
      ) {
        finishDrag();
      }
    };

  return (
    <Screen>
      <AppHeader onBack={() => navigation.goBack()} title={managePresetsLabel} />
      <ScrollView
        contentContainerStyle={[styles.content, { backgroundColor: theme.colors.background }]}
        scrollEnabled={!draggingId}
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

        <View
          style={[
            styles.listCard,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
              height: orderedPresets.length * ROW_HEIGHT,
            },
          ]}
        >
          {orderedPresets.map((preset, index) => {
            const isDragging = draggingId === preset.id;

            return (
              <Animated.View
                key={preset.id}
                style={[
                  styles.row,
                  {
                    backgroundColor: theme.colors.surface,
                    top: isDragging ? dragTop : index * ROW_HEIGHT,
                  },
                  index < orderedPresets.length - 1 && !isDragging && {
                    borderBottomColor: theme.colors.border,
                    borderBottomWidth: StyleSheet.hairlineWidth,
                  },
                  isDragging && {
                    elevation: 8,
                    shadowColor: '#000000',
                    shadowOffset: { width: 0, height: 8 },
                    shadowOpacity: 0.16,
                    shadowRadius: 18,
                    zIndex: 3,
                  },
                ]}
              >
                <Pressable
                  onPress={() => {
                    if (preset.system) {
                      setPresetHidden(preset.id, !preset.hidden);
                      return;
                    }

                    Alert.alert(removeLabel, removeBody, [
                      { text: strings.common.cancel, style: 'cancel' },
                      {
                        text: removeLabel,
                        style: 'destructive',
                        onPress: () => removePreset(preset.id),
                      },
                    ]);
                  }}
                  style={styles.leadingActionHitbox}
                >
                  <View
                    style={[
                      styles.leadingAction,
                      {
                        backgroundColor: preset.system
                          ? theme.colors.surfaceSecondary
                          : '#FF4D4F',
                        opacity: preset.hidden ? 0.6 : 1,
                      },
                    ]}
                  >
                    {preset.system ? (
                      preset.hidden ? (
                        <Eye color={theme.colors.textPrimary} size={16} />
                      ) : (
                        <EyeSlash color={theme.colors.textPrimary} size={16} />
                      )
                    ) : (
                      <MinusGlyph />
                    )}
                  </View>
                </Pressable>

                <View style={styles.contentBlock}>
                  <Text
                    numberOfLines={1}
                    style={[
                      theme.typography.bodyLarge,
                      {
                        color: theme.colors.textPrimary,
                        opacity: preset.hidden ? 0.58 : 1,
                      },
                    ]}
                  >
                    {preset.name}
                  </Text>
                  <Text
                    numberOfLines={1}
                    style={[
                      theme.typography.bodySmall,
                      {
                        color: theme.colors.textSecondary,
                        marginTop: 4,
                        opacity: preset.hidden ? 0.72 : 1,
                      },
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
                    {preset.system
                      ? preset.hidden
                        ? showLabel
                        : predefinedLabel
                      : customLabel}
                  </Text>
                </View>

                <PanGestureHandler
                  activeOffsetY={[-2, 2]}
                  onGestureEvent={handleGestureEvent(preset.id, index)}
                  onHandlerStateChange={handleGestureStateChange(preset.id, index)}
                >
                  <Animated.View
                    accessibilityLabel={`${preset.name}. ${dragHandleLabel}`}
                    style={styles.handleTouchArea}
                  >
                    <DragHandle color={theme.colors.textMuted} />
                  </Animated.View>
                </PanGestureHandler>
              </Animated.View>
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
  listCard: {
    borderRadius: 24,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'visible',
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    height: ROW_HEIGHT,
    left: 0,
    paddingHorizontal: 14,
    position: 'absolute',
    right: 0,
  },
  leadingActionHitbox: {
    alignItems: 'center',
    height: ROW_HEIGHT,
    justifyContent: 'center',
  },
  leadingAction: {
    alignItems: 'center',
    borderRadius: 16,
    height: 32,
    justifyContent: 'center',
    marginRight: 12,
    width: 32,
  },
  minusGlyph: {
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    height: 3,
    width: 12,
  },
  contentBlock: {
    flex: 1,
    justifyContent: 'center',
  },
  badge: {
    alignItems: 'center',
    borderRadius: 999,
    height: 26,
    justifyContent: 'center',
    marginLeft: 12,
    paddingHorizontal: 10,
  },
  handleTouchArea: {
    alignItems: 'center',
    height: ROW_HEIGHT,
    justifyContent: 'center',
    marginLeft: 8,
    paddingHorizontal: 6,
  },
  dragHandle: {
    gap: 4,
    paddingVertical: 8,
  },
  dragHandleLine: {
    borderRadius: 999,
    height: 2.5,
    width: 18,
  },
});
