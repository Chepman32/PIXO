import { createMMKV } from 'react-native-mmkv';

export const appStorage = createMMKV({
  id: 'squoze-storage',
});
