import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import {
  AppSettings,
  ConversionPreset,
  ConversionResult,
  ConversionTask,
  HistoryItem,
} from '../../../types/models';
import { defaultPresets } from '../../../entities/preset/defaultPresets';
import { appStorage } from '../../../shared/lib/storage';

interface AppState {
  initialized: boolean;
  settings: AppSettings;
  history: HistoryItem[];
  presets: ConversionPreset[];
  activeTask?: ConversionTask;
  conversionResults: ConversionResult[];
  recentError?: string;
  setInitialized: (initialized: boolean) => void;
  setSettings: (patch: Partial<AppSettings>) => void;
  setActiveTask: (task?: ConversionTask) => void;
  setConversionResults: (results: ConversionResult[]) => void;
  addHistoryItem: (item: HistoryItem) => void;
  addManyHistoryItems: (items: HistoryItem[]) => void;
  removeHistoryItem: (id: string) => void;
  clearHistory: () => void;
  toggleFavorite: (id: string) => void;
  upsertPreset: (preset: ConversionPreset) => void;
  removePreset: (id: string) => void;
  setRecentError: (message?: string) => void;
}

const defaultSettings: AppSettings = {
  defaultFormat: 'jpg',
  defaultQuality: 80,
  preserveMetadata: true,
  autoSaveToPhotos: false,
  theme: 'system',
  appIcon: 'default',
  reduceMotion: false,
};

const mmkvStorage = {
  getItem: (name: string) => {
    const value = appStorage.getString(name);
    return value ?? null;
  },
  setItem: (name: string, value: string) => {
    appStorage.set(name, value);
  },
  removeItem: (name: string) => {
    appStorage.remove(name);
  },
};

export const useAppStore = create<AppState>()(
  persist(
    set => ({
      initialized: false,
      settings: defaultSettings,
      history: [],
      presets: defaultPresets,
      conversionResults: [],
      setInitialized: initialized => set({ initialized }),
      setSettings: patch =>
        set(state => ({
          settings: {
            ...state.settings,
            ...patch,
          },
        })),
      setActiveTask: activeTask => set({ activeTask }),
      setConversionResults: conversionResults => set({ conversionResults }),
      addHistoryItem: item =>
        set(state => ({
          history: [item, ...state.history],
        })),
      addManyHistoryItems: items =>
        set(state => ({
          history: [...items, ...state.history],
        })),
      removeHistoryItem: id =>
        set(state => ({
          history: state.history.filter(item => item.id !== id),
        })),
      clearHistory: () => set({ history: [] }),
      toggleFavorite: id =>
        set(state => ({
          history: state.history.map(item =>
            item.id === id ? { ...item, favorite: !item.favorite } : item,
          ),
        })),
      upsertPreset: preset =>
        set(state => {
          const exists = state.presets.some(item => item.id === preset.id);
          return {
            presets: exists
              ? state.presets.map(item => (item.id === preset.id ? preset : item))
              : [preset, ...state.presets],
          };
        }),
      removePreset: id =>
        set(state => ({
          presets: state.presets.filter(item => item.id !== id || item.system),
        })),
      setRecentError: recentError => set({ recentError }),
    }),
    {
      name: 'pixo-app-state',
      storage: createJSONStorage(() => mmkvStorage),
      partialize: state => ({
        settings: state.settings,
        history: state.history.slice(0, 500),
        presets: state.presets,
      }),
    },
  ),
);
