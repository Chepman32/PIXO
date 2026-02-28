import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import { Circle, Svg } from 'react-native-svg';
import { AppHeader } from '../../shared/ui/AppHeader';
import { Screen } from '../../shared/ui/Screen';
import { RootStackParamList } from '../../app/navigation/types';
import { useTheme } from '../../app/providers/ThemeProvider';
import { runConversion } from '../../processes/conversion/convert';
import { Button } from '../../shared/ui/Button';
import { useAppStore } from '../../app/providers/store/useAppStore';
import { getErrorMessage } from '../../shared/lib/errors';
import { useToast } from '../../app/providers/ToastProvider';
import { haptic } from '../../shared/lib/haptics';

type Props = NativeStackScreenProps<RootStackParamList, 'ConversionProgress'>;

const RADIUS = 82;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const steps = ['Reading image', 'Processing data', 'Applying compression', 'Saving output'];

export const ConversionProgressScreen: React.FC<Props> = ({ navigation, route }) => {
  const theme = useTheme();
  const { showToast } = useToast();
  const { images, targetFormat, options } = route.params;

  const setConversionResults = useAppStore(state => state.setConversionResults);
  const addManyHistoryItems = useAppStore(state => state.addManyHistoryItems);
  const setRecentError = useAppStore(state => state.setRecentError);
  const autoSaveToPhotos = useAppStore(state => state.settings.autoSaveToPhotos);

  const [progress, setProgress] = useState(0);
  const [completed, setCompleted] = useState(0);
  const [currentName, setCurrentName] = useState(images[0]?.fileName ?? '');
  const [running, setRunning] = useState(true);

  const stepIndex = Math.min(steps.length - 1, Math.floor(progress * steps.length));

  useEffect(() => {
    let active = true;

    const execute = async () => {
      try {
        const results = await runConversion(images, targetFormat, options, current => {
          if (!active) {
            return;
          }
          setProgress(current.overallProgress);
          setCompleted(current.completed);
          if (current.currentItemName) {
            setCurrentName(current.currentItemName);
          }
        });

        if (!active) {
          return;
        }

        if (autoSaveToPhotos) {
          await Promise.all(
            results.map(item => CameraRoll.saveAsset(item.outputPath, { type: 'photo' })),
          );
        }

        setConversionResults(results);
        addManyHistoryItems(
          results.map(item => ({
            ...item,
            favorite: false,
            sourcePath: item.source.uri,
          })),
        );
        haptic.success();
        navigation.replace('ConversionComplete', { results });
      } catch (error) {
        const message = getErrorMessage(error);
        setRecentError(message);
        showToast({ title: message, tone: 'error' });
        Alert.alert('Conversion Failed', message, [
          {
            text: 'Back',
            onPress: () => navigation.goBack(),
          },
        ]);
      } finally {
        if (active) {
          setRunning(false);
        }
      }
    };

    execute();

    return () => {
      active = false;
    };
  }, [
    addManyHistoryItems,
    autoSaveToPhotos,
    images,
    navigation,
    options,
    setConversionResults,
    setRecentError,
    showToast,
    targetFormat,
  ]);

  const strokeDashoffset = useMemo(
    () => CIRCUMFERENCE - CIRCUMFERENCE * progress,
    [progress],
  );

  return (
    <Screen>
      <AppHeader title="Converting" />
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}> 
        <View style={styles.visualWrap}>
          <Svg height={200} width={200}>
            <Circle
              cx={100}
              cy={100}
              fill="transparent"
              r={RADIUS}
              stroke={theme.colors.border}
              strokeWidth={10}
            />
            <Circle
              cx={100}
              cy={100}
              fill="transparent"
              r={RADIUS}
              stroke={theme.colors.primary}
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              strokeWidth={10}
              transform="rotate(-90 100 100)"
            />
          </Svg>
          <View style={styles.centerLabel}>
            <Text style={[theme.typography.headlineSmall, { color: theme.colors.textPrimary }]}> 
              {Math.round(progress * 100)}%
            </Text>
            {running ? <ActivityIndicator color={theme.colors.primary} style={{ marginTop: 8 }} /> : null}
          </View>
        </View>

        <Text style={[theme.typography.headlineSmall, { color: theme.colors.textPrimary }]}>Converting...</Text>
        <Text style={[theme.typography.bodyMedium, { color: theme.colors.textSecondary, marginTop: 6 }]}> 
          {currentName}
        </Text>
        <Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted, marginTop: 2 }]}> 
          {completed} of {images.length} complete
        </Text>

        <View style={styles.stepsWrap}>
          {steps.map((item, index) => {
            const state = index < stepIndex ? 'completed' : index === stepIndex ? 'active' : 'pending';
            return (
              <View key={item} style={styles.stepRow}>
                <View
                  style={[
                    styles.dot,
                    {
                      backgroundColor:
                        state === 'completed'
                          ? theme.colors.success
                          : state === 'active'
                            ? theme.colors.primary
                            : theme.colors.border,
                    },
                  ]}
                />
                <Text
                  style={[
                    theme.typography.bodySmall,
                    {
                      color:
                        state === 'active'
                          ? theme.colors.textPrimary
                          : theme.colors.textSecondary,
                    },
                  ]}
                >
                  {item}
                </Text>
              </View>
            );
          })}
        </View>

        <View style={styles.cancelWrap}>
          <Button
            fullWidth
            label="Cancel"
            onPress={() => {
              Alert.alert('Cancel Conversion?', 'Current progress will be lost.', [
                { text: 'Keep converting', style: 'cancel' },
                {
                  text: 'Cancel',
                  style: 'destructive',
                  onPress: () => navigation.goBack(),
                },
              ]);
            }}
            variant="ghost"
          />
        </View>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 18,
  },
  visualWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    marginTop: 8,
  },
  centerLabel: {
    alignItems: 'center',
    position: 'absolute',
  },
  stepsWrap: {
    marginTop: 24,
    width: '100%',
  },
  stepRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  dot: {
    borderRadius: 5,
    height: 10,
    width: 10,
  },
  cancelWrap: {
    marginTop: 'auto',
    paddingBottom: 24,
    width: '100%',
  },
});
