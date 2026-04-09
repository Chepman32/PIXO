import { NativeModules, Platform } from 'react-native';

interface NativeSquozeDeviceLocale {
  localeIdentifier?: string | null;
}

const nativeModule =
  Platform.OS === 'ios'
    ? (NativeModules.SquozeDeviceLocale as NativeSquozeDeviceLocale | undefined)
    : undefined;

export const getNativeDeviceLocaleIdentifier = () => {
  const localeIdentifier = nativeModule?.localeIdentifier;
  if (typeof localeIdentifier !== 'string' || localeIdentifier.length === 0) {
    return undefined;
  }

  return localeIdentifier.replace('_', '-');
};
