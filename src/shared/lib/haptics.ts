import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import { useAppStore } from '../../app/providers/store/useAppStore';

const options = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: false,
};

const trigger = (type: Parameters<typeof ReactNativeHapticFeedback.trigger>[0]) => {
  const enabled = useAppStore.getState().settings.hapticsEnabled ?? true;
  if (!enabled) {
    return;
  }

  ReactNativeHapticFeedback.trigger(type, options);
};

export const haptic = {
  light: () => trigger('impactLight'),
  medium: () => trigger('impactMedium'),
  heavy: () => trigger('impactHeavy'),
  success: () => trigger('notificationSuccess'),
  warning: () => trigger('notificationWarning'),
  error: () => trigger('notificationError'),
  selection: () => trigger('selection'),
};
