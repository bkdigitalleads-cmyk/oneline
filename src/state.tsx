import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initPurchases, getIsPro } from './purchases';
import { scheduleDailyReminder, cancelDailyReminder } from './notifications';

export interface Settings {
  reminderEnabled: boolean;
  reminderHour: number;
  reminderMinute: number;
  lockEnabled: boolean;
  showPrompts: boolean;
}

const DEFAULT_SETTINGS: Settings = {
  reminderEnabled: false,
  reminderHour: 21,
  reminderMinute: 0,
  lockEnabled: false,
  showPrompts: true,
};

const SETTINGS_KEY = 'oneline.settings.v1';

interface AppState {
  settings: Settings;
  updateSettings: (patch: Partial<Settings>) => Promise<void>;
  isPro: boolean;
  setIsPro: (v: boolean) => void;
  refreshPro: () => Promise<void>;
  paywallVisible: boolean;
  showPaywall: () => void;
  hidePaywall: () => void;
  ready: boolean;
  /** Bumped whenever an entry is saved, so other screens refetch. */
  entriesVersion: number;
  bumpEntries: () => void;
}

const Ctx = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [isPro, setIsPro] = useState(false);
  const [paywallVisible, setPaywallVisible] = useState(false);
  const [ready, setReady] = useState(false);
  const [entriesVersion, setEntriesVersion] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(SETTINGS_KEY);
        if (raw) setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(raw) });
      } catch {
        // corrupted settings -> defaults
      }
      try {
        await initPurchases();
        setIsPro(await getIsPro());
      } catch {
        setIsPro(false);
      }
      setReady(true);
    })();
  }, []);

  const updateSettings = useCallback(
    async (patch: Partial<Settings>) => {
      const next = { ...settings, ...patch };
      setSettings(next);
      try {
        await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
      } catch {
        // non-fatal
      }
      if ('reminderEnabled' in patch || 'reminderHour' in patch || 'reminderMinute' in patch) {
        if (next.reminderEnabled) {
          const ok = await scheduleDailyReminder(next.reminderHour, next.reminderMinute);
          if (!ok && next.reminderEnabled) {
            // Permission denied: reflect reality in stored settings.
            const reverted = { ...next, reminderEnabled: false };
            setSettings(reverted);
            await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(reverted));
          }
        } else {
          await cancelDailyReminder();
        }
      }
    },
    [settings]
  );

  const refreshPro = useCallback(async () => {
    setIsPro(await getIsPro());
  }, []);

  const value = useMemo<AppState>(
    () => ({
      settings,
      updateSettings,
      isPro,
      setIsPro,
      refreshPro,
      paywallVisible,
      showPaywall: () => setPaywallVisible(true),
      hidePaywall: () => setPaywallVisible(false),
      ready,
      entriesVersion,
      bumpEntries: () => setEntriesVersion((v) => v + 1),
    }),
    [settings, updateSettings, isPro, refreshPro, paywallVisible, ready, entriesVersion]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp(): AppState {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}

/** Days of history visible on the free tier. */
export const FREE_HISTORY_DAYS = 30;
