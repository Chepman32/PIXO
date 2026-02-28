/* eslint-env jest */
import 'react-native-gesture-handler/jestSetup';

jest.mock('react-native-mmkv', () => ({
  createMMKV: jest.fn().mockImplementation(() => ({
    set: jest.fn(),
    getString: jest.fn(() => null),
    remove: jest.fn(),
  })),
}));

jest.mock('@shopify/flash-list', () => {
  const React = require('react');
  const { FlatList } = require('react-native');
  return {
    FlashList: React.forwardRef((props, ref) => React.createElement(FlatList, { ...props, ref })),
  };
});

jest.mock('react-native-image-picker', () => ({
  launchImageLibrary: jest.fn(async () => ({ didCancel: true })),
  launchCamera: jest.fn(async () => ({ didCancel: true })),
}));

jest.mock('react-native-document-picker', () => ({
  types: { images: 'public.image' },
  pick: jest.fn(async () => []),
}));

jest.mock('@react-native-camera-roll/camera-roll', () => ({
  CameraRoll: {
    saveAsset: jest.fn(async path => path),
  },
}));

jest.mock('react-native-share', () => ({
  open: jest.fn(async () => undefined),
}));

jest.mock('react-native-haptic-feedback', () => ({
  trigger: jest.fn(),
}));

jest.mock('react-native-fs', () => ({
  DocumentDirectoryPath: '/tmp',
  exists: jest.fn(async () => true),
  mkdir: jest.fn(async () => undefined),
  stat: jest.fn(async () => ({
    size: 0,
    mtime: new Date(),
    ctime: new Date(),
  })),
  copyFile: jest.fn(async () => undefined),
  readDir: jest.fn(async () => []),
  unlink: jest.fn(async () => undefined),
}));
