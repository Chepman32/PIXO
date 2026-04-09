import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { NativeModules } from 'react-native';
import { useAppStore } from '../src/app/providers/store/useAppStore';
import {
  __resetDeviceLocaleCacheForTests,
  I18nProvider,
  useLocale,
  useStrings,
} from '../src/shared/lib/i18n';
import { getNativeDeviceLocaleIdentifier } from '../src/shared/api/deviceLocale';
import { AppLocalePreference } from '../src/types/models';

jest.mock('../src/shared/api/deviceLocale', () => ({
  getNativeDeviceLocaleIdentifier: jest.fn(),
}));

const mockedGetNativeDeviceLocaleIdentifier = jest.mocked(getNativeDeviceLocaleIdentifier);
const initialSettings = { ...useAppStore.getState().settings };

type ProbeSnapshot = {
  localePreference: AppLocalePreference;
  locale: string;
  systemLocale: string;
  tagline: string;
};

let probeSnapshot: ProbeSnapshot | undefined;
let renderer: ReactTestRenderer.ReactTestRenderer | undefined;

const Probe = () => {
  const { localePreference, locale, systemLocale } = useLocale();
  const strings = useStrings();

  probeSnapshot = {
    localePreference,
    locale,
    systemLocale,
    tagline: strings.splash.tagline,
  };

  return null;
};

const renderProbe = async () => {
  probeSnapshot = undefined;

  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(
      <I18nProvider>
        <Probe />
      </I18nProvider>,
    );
  });

  return probeSnapshot;
};

describe('i18n locale resolution', () => {
  beforeEach(async () => {
    await ReactTestRenderer.act(async () => {
      renderer?.unmount();
      renderer = undefined;
      useAppStore.setState({ settings: { ...initialSettings } });
    });
    mockedGetNativeDeviceLocaleIdentifier.mockReset();
    __resetDeviceLocaleCacheForTests();
    (NativeModules as Record<string, unknown>).SettingsManager = { settings: {} };
  });

  afterEach(async () => {
    await ReactTestRenderer.act(async () => {
      renderer?.unmount();
      renderer = undefined;
    });
  });

  it('uses the native iOS locale for system language on first launch', async () => {
    mockedGetNativeDeviceLocaleIdentifier.mockReturnValue('ru-RU');

    const snapshot = await renderProbe();

    expect(snapshot).toMatchObject({
      localePreference: 'system',
      locale: 'ru',
      systemLocale: 'ru',
      tagline: 'Конвертер изображений',
    });
  });

  it('keeps the manual app language while preserving the detected system locale', async () => {
    mockedGetNativeDeviceLocaleIdentifier.mockReturnValue('ru-RU');
    await ReactTestRenderer.act(async () => {
      useAppStore.setState({
        settings: {
          ...initialSettings,
          locale: 'en',
        },
      });
    });

    const snapshot = await renderProbe();

    expect(snapshot).toMatchObject({
      localePreference: 'en',
      locale: 'en',
      systemLocale: 'ru',
      tagline: 'Image Converter',
    });
  });

  it('falls back to SettingsManager when the native locale module is unavailable', async () => {
    mockedGetNativeDeviceLocaleIdentifier.mockReturnValue(undefined);
    (NativeModules as Record<string, unknown>).SettingsManager = {
      settings: {
        AppleLanguages: ['ja-JP'],
      },
    };

    const snapshot = await renderProbe();

    expect(snapshot).toMatchObject({
      localePreference: 'system',
      locale: 'ja',
      systemLocale: 'ja',
      tagline: '画像変換アプリ',
    });
  });
});
