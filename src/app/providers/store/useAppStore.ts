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
  movePreset: (id: string, direction: 'up' | 'down') => void;
  reorderPresets: (presets: ConversionPreset[]) => void;
  setPresetHidden: (id: string, hidden: boolean) => void;
  setRecentError: (message?: string) => void;
}

const defaultSettings: AppSettings = {
  defaultFormat: 'jpg',
  defaultQuality: 80,
  preserveMetadata: true,
  autoSaveToPhotos: false,
  hapticsEnabled: true,
  onboardingCompleted: false,
  locale: 'system',
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

const normalizePresets = (presets?: ConversionPreset[]) => {
  const incoming = Array.isArray(presets) ? presets : [];
  const defaultPresetMap = new Map(defaultPresets.map(item => [item.id, item] as const));
  const seen = new Set<string>();
  const normalized = incoming.flatMap(item => {
    if (seen.has(item.id)) {
      return [];
    }
    seen.add(item.id);

    const normalizedItem = item.system
      ? {
          ...(defaultPresetMap.get(item.id) ?? item),
          ...item,
          hidden: item.hidden ?? false,
        }
      : { ...item, hidden: item.hidden ?? false };

    return [normalizedItem];
  });
  const missingSystemPresets = defaultPresets
    .filter(item => !seen.has(item.id))
    .map(item => ({ ...item, hidden: false }));

  return [...normalized, ...missingSystemPresets];
};

export const useAppStore = create<AppState>()(
  persist(
    set => ({
      initialized: false,
      settings: defaultSettings,
      history: [],
      presets: normalizePresets(defaultPresets),
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
      movePreset: (id, direction) =>
        set(state => {
          const index = state.presets.findIndex(item => item.id === id);
          if (index < 0) {
            return state;
          }

          const targetIndex = direction === 'up' ? index - 1 : index + 1;
          if (targetIndex < 0 || targetIndex >= state.presets.length) {
            return state;
          }

          const presets = [...state.presets];
          const [item] = presets.splice(index, 1);
          presets.splice(targetIndex, 0, item);
          return { presets };
        }),
      reorderPresets: presets => set({ presets }),
      setPresetHidden: (id, hidden) =>
        set(state => ({
          presets: state.presets.map(item => (item.id === id ? { ...item, hidden } : item)),
        })),
      setRecentError: recentError => set({ recentError }),
    }),
    {
      name: 'squoze-app-state',
      storage: createJSONStorage(() => mmkvStorage),
      merge: (persistedState, currentState) => {
        const typedState = (persistedState as Partial<AppState> | undefined) ?? {};
        return {
          ...currentState,
          ...typedState,
          presets: normalizePresets(typedState.presets),
        };
      },
      partialize: state => ({
        settings: state.settings,
        history: state.history.slice(0, 500),
        presets: state.presets,
      }),
    },
  ),
);
