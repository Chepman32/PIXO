import React from 'react';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Share from 'react-native-share';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import { CheckCircle, DotsThreeOutline, DownloadSimple, Plus, ShareNetwork } from 'phosphor-react-native';
import { AppHeader } from '../../shared/ui/AppHeader';
import { Screen } from '../../shared/ui/Screen';
import { RootStackParamList } from '../../app/navigation/types';
import { useTheme } from '../../app/providers/ThemeProvider';
import { Button } from '../../shared/ui/Button';
import { getReadableSize } from '../../shared/lib/file';
import { useToast } from '../../app/providers/ToastProvider';

type Props = NativeStackScreenProps<RootStackParamList, 'ConversionComplete'>;

const iconButtonStyles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: 12,
    flex: 1,
    gap: 6,
    height: 56,
    justifyContent: 'center',
  },
});

export const ConversionCompleteScreen: React.FC<Props> = ({ navigation, route }) => {
  const theme = useTheme();
  const { showToast } = useToast();
  const { results } = route.params;
  const first = results[0];

  const saveAll = async () => {
    try {
      await Promise.all(results.map(item => CameraRoll.saveAsset(item.outputPath, { type: 'photo' })));
      showToast({ title: 'Saved to Photos', tone: 'success' });
    } catch {
      showToast({ title: 'Save failed', tone: 'error' });
    }
  };

  const shareAll = async () => {
    try {
      await Share.open({ urls: results.map(item => `file://${item.outputPath}`) });
    } catch {
      // Share sheet canceled by user.
    }
  };

  const more = () => {
    Alert.alert('More Actions', 'Choose an action', [
      {
        text: 'Convert Again',
        onPress: () => navigation.navigate('MainTabs', { screen: 'Convert' } as never),
      },
      {
        text: 'View Original',
        onPress: () => navigation.navigate('Preview', { result: first, compareUri: first.source.uri }),
      },
      {
        text: 'Cancel',
        style: 'cancel',
      },
    ]);
  };

  return (
    <Screen>
      <AppHeader title="Complete" />
      <ScrollView contentContainerStyle={[styles.content, { backgroundColor: theme.colors.background }]}> 
        <View style={styles.hero}>
          <CheckCircle color={theme.colors.success} size={88} weight="fill" />
          <Text style={[theme.typography.headlineSmall, { color: theme.colors.textPrimary, marginTop: 16 }]}> 
            {results.length > 1
              ? `${results.length} Images Converted`
              : 'Conversion Complete!'}
          </Text>
        </View>

        <Pressable
          onPress={() => navigation.navigate('Preview', { result: first, compareUri: first.source.uri })}
          style={[styles.previewCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
        >
          <Image source={{ uri: first.outputPath }} style={styles.previewImage} />
          <Text numberOfLines={1} style={[theme.typography.titleMedium, { color: theme.colors.textPrimary, marginTop: 10 }]}> 
            {first.outputFileName}
          </Text>
          <Text style={[theme.typography.bodySmall, { color: theme.colors.textSecondary }]}> 
            {first.dimensions.width} × {first.dimensions.height} • {getReadableSize(first.size.convertedSize)}
          </Text>
          <Text style={[theme.typography.bodySmall, { color: theme.colors.success, marginTop: 4 }]}> 
            {first.size.deltaPercent <= 0 ? '↓' : '↑'} {Math.abs(first.size.deltaPercent).toFixed(0)}%
          </Text>
        </Pressable>

        <View style={styles.row}>
          <Pressable
            onPress={shareAll}
            style={[iconButtonStyles.button, { backgroundColor: theme.colors.surfaceSecondary }]}
          >
            <ShareNetwork color={theme.colors.textPrimary} size={20} />
            <Text style={[theme.typography.labelMedium, { color: theme.colors.textPrimary }]}>Share</Text>
          </Pressable>
          <Pressable
            onPress={saveAll}
            style={[iconButtonStyles.button, { backgroundColor: theme.colors.surfaceSecondary }]}
          >
            <DownloadSimple color={theme.colors.textPrimary} size={20} />
            <Text style={[theme.typography.labelMedium, { color: theme.colors.textPrimary }]}>Save</Text>
          </Pressable>
          <Pressable
            onPress={more}
            style={[iconButtonStyles.button, { backgroundColor: theme.colors.surfaceSecondary }]}
          >
            <DotsThreeOutline color={theme.colors.textPrimary} size={20} />
            <Text style={[theme.typography.labelMedium, { color: theme.colors.textPrimary }]}>More</Text>
          </Pressable>
        </View>

        <Button
          fullWidth
          label="Convert Another"
          leftIcon={<Plus color={theme.colors.primary} size={18} />}
          onPress={() => navigation.navigate('MainTabs', { screen: 'Convert' } as never)}
          variant="secondary"
        />

        <View style={{ marginTop: 8 }}>
          <Button
            fullWidth
            label="Done"
            onPress={() => navigation.popToTop()}
          />
        </View>
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  content: {
    gap: 12,
    padding: 20,
    paddingBottom: 40,
  },
  hero: {
    alignItems: 'center',
    marginBottom: 6,
    marginTop: 12,
  },
  previewCard: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 14,
  },
  previewImage: {
    borderRadius: 12,
    height: 220,
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
});
