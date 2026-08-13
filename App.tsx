import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useTheme, fonts } from './src/theme';
import { AppProvider, useApp } from './src/state';
import LockGate from './src/LockGate';
import TodayScreen from './src/screens/Today';
import TimelineScreen from './src/screens/Timeline';
import SettingsScreen from './src/screens/Settings';
import PaywallModal from './src/screens/Paywall';

const PRIVACY_URL = 'https://bwk-apps.github.io/oneline/privacy';

type Tab = 'today' | 'timeline' | 'settings';

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: 'today', label: 'Today', icon: '✏️' },
  { key: 'timeline', label: 'Story', icon: '📖' },
  { key: 'settings', label: 'Settings', icon: '⚙️' },
];

function Shell() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { ready } = useApp();
  const [tab, setTab] = useState<Tab>('today');

  if (!ready) {
    return <View style={{ flex: 1, backgroundColor: theme.bg }} />;
  }

  return (
    <LockGate>
      <View style={{ flex: 1, backgroundColor: theme.bg, paddingTop: insets.top }}>
        <View style={{ flex: 1 }}>
          {tab === 'today' && <TodayScreen />}
          {tab === 'timeline' && <TimelineScreen />}
          {tab === 'settings' && <SettingsScreen />}
        </View>
        <View
          style={[
            styles.tabBar,
            {
              backgroundColor: theme.card,
              borderTopColor: theme.border,
              paddingBottom: Math.max(insets.bottom, 10),
            },
          ]}
        >
          {TABS.map((t) => {
            const active = tab === t.key;
            return (
              <Pressable
                key={t.key}
                onPress={() => setTab(t.key)}
                style={styles.tabItem}
                accessibilityRole="tab"
                accessibilityState={{ selected: active }}
              >
                <Text style={[styles.tabIcon, { opacity: active ? 1 : 0.45 }]}>
                  {t.icon}
                </Text>
                <Text
                  style={[
                    styles.tabLabel,
                    { color: active ? theme.accent : theme.textFaint },
                  ]}
                >
                  {t.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <PaywallModal privacyUrl={PRIVACY_URL} />
      </View>
    </LockGate>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <StatusBar style="auto" />
        <Shell />
      </AppProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 8,
  },
  tabItem: { flex: 1, alignItems: 'center', gap: 2 },
  tabIcon: { fontSize: 20 },
  tabLabel: { fontSize: 11, fontWeight: fonts.weight.medium },
});
