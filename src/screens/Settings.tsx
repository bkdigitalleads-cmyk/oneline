import React, { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import * as Sharing from 'expo-sharing';
import { File, Paths } from 'expo-file-system';
import * as LocalAuthentication from 'expo-local-authentication';
import { useTheme, fonts } from '../theme';
import { Card, SectionTitle, ProBadge } from '../components';
import { useApp } from '../state';
import { exportCsv, deleteAllEntries } from '../db';
import { restorePurchases, isBillingAvailable } from '../purchases';

const REMINDER_TIMES: { label: string; hour: number; minute: number }[] = [
  { label: 'Morning · 8:00 AM', hour: 8, minute: 0 },
  { label: 'Midday · 12:30 PM', hour: 12, minute: 30 },
  { label: 'Evening · 6:00 PM', hour: 18, minute: 0 },
  { label: 'Night · 9:00 PM', hour: 21, minute: 0 },
  { label: 'Late night · 10:30 PM', hour: 22, minute: 30 },
];

export default function SettingsScreen() {
  const theme = useTheme();
  const { settings, updateSettings, isPro, setIsPro, showPaywall, bumpEntries } = useApp();
  const [busy, setBusy] = useState(false);

  const requirePro = (fn: () => void) => () => {
    if (!isPro) {
      showPaywall();
      return;
    }
    fn();
  };

  const onToggleLock = requirePro(async () => {
    if (!settings.lockEnabled) {
      const hw = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      if (!hw || !enrolled) {
        Alert.alert(
          'Face ID unavailable',
          'Set up Face ID or a device passcode in iOS Settings first.'
        );
        return;
      }
    }
    await updateSettings({ lockEnabled: !settings.lockEnabled });
  });

  const onExport = requirePro(async () => {
    try {
      setBusy(true);
      const csv = await exportCsv();
      const file = new File(Paths.cache, 'oneline-journal-export.csv');
      if (file.exists) file.delete();
      file.write(csv);
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(file.uri, {
          mimeType: 'text/csv',
          dialogTitle: 'Export your journal',
        });
      }
    } catch (e: any) {
      Alert.alert('Export failed', e?.message ?? 'Please try again.');
    } finally {
      setBusy(false);
    }
  });

  const onRestore = async () => {
    if (!isBillingAvailable()) {
      Alert.alert('Unavailable', 'Purchases are not available right now.');
      return;
    }
    setBusy(true);
    const res = await restorePurchases();
    setBusy(false);
    if (res.ok) {
      setIsPro(res.isPro);
      Alert.alert(
        res.isPro ? 'Restored!' : 'No purchases found',
        res.isPro
          ? 'Your Pro access is back. Welcome home.'
          : 'We couldn’t find a previous purchase on this Apple ID.'
      );
    } else {
      Alert.alert('Restore failed', res.error ?? 'Please try again.');
    }
  };

  const onDeleteAll = () => {
    Alert.alert(
      'Delete all entries?',
      'This permanently erases every line in your journal from this device. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete everything',
          style: 'destructive',
          onPress: async () => {
            await deleteAllEntries();
            bumpEntries();
          },
        },
      ]
    );
  };

  const rowText = (label: string, pro?: boolean) => (
    <View style={styles.rowLabel}>
      <Text style={[styles.rowText, { color: theme.text }]}>{label}</Text>
      {pro && !isPro ? <ProBadge theme={theme} /> : null}
    </View>
  );

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.bg }}
      contentContainerStyle={styles.scroll}
    >
      <Text style={[styles.title, { color: theme.text }]}>Settings</Text>

      {!isPro && (
        <Pressable onPress={showPaywall}>
          <Card theme={theme} style={{ ...styles.upsell, backgroundColor: theme.accentSoft }}>
            <Text style={[styles.upsellTitle, { color: theme.accent }]}>
              OneLine Pro
            </Text>
            <Text style={[styles.upsellSub, { color: theme.text }]}>
              Keep every line forever · On This Day memories · Search · Export ·
              Face ID lock
            </Text>
          </Card>
        </Pressable>
      )}

      <SectionTitle theme={theme}>Daily reminder</SectionTitle>
      <Card theme={theme}>
        <View style={styles.row}>
          {rowText('Remind me to write')}
          <Switch
            value={settings.reminderEnabled}
            onValueChange={(v) => updateSettings({ reminderEnabled: v })}
            trackColor={{ true: theme.accent }}
          />
        </View>
        {settings.reminderEnabled && (
          <View style={styles.times}>
            {REMINDER_TIMES.map((t) => {
              const active =
                settings.reminderHour === t.hour && settings.reminderMinute === t.minute;
              return (
                <Pressable
                  key={t.label}
                  onPress={() =>
                    updateSettings({ reminderHour: t.hour, reminderMinute: t.minute })
                  }
                  style={[
                    styles.timeChip,
                    {
                      backgroundColor: active ? theme.accent : theme.cardAlt,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.timeChipText,
                      { color: active ? '#FFF' : theme.textSecondary },
                    ]}
                  >
                    {t.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}
      </Card>

      <SectionTitle theme={theme}>Writing</SectionTitle>
      <Card theme={theme}>
        <View style={styles.row}>
          {rowText('Show daily prompts')}
          <Switch
            value={settings.showPrompts}
            onValueChange={(v) => updateSettings({ showPrompts: v })}
            trackColor={{ true: theme.accent }}
          />
        </View>
      </Card>

      <SectionTitle theme={theme}>Privacy & data</SectionTitle>
      <Card theme={theme}>
        <View style={styles.row}>
          {rowText('Lock with Face ID', true)}
          <Switch
            value={settings.lockEnabled}
            onValueChange={onToggleLock}
            trackColor={{ true: theme.accent }}
          />
        </View>
        <View style={[styles.divider, { backgroundColor: theme.border }]} />
        <Pressable onPress={onExport} disabled={busy} style={styles.row}>
          {rowText('Export journal (CSV)', true)}
          <Text style={{ color: theme.textFaint }}>›</Text>
        </Pressable>
        <View style={[styles.divider, { backgroundColor: theme.border }]} />
        <Text style={[styles.privacyNote, { color: theme.textSecondary }]}>
          Your journal never leaves this device. No account, no cloud, no
          tracking — your words are yours alone.
        </Text>
      </Card>

      <SectionTitle theme={theme}>Purchases</SectionTitle>
      <Card theme={theme}>
        <Pressable onPress={onRestore} disabled={busy} style={styles.row}>
          {rowText('Restore purchases')}
          <Text style={{ color: theme.textFaint }}>›</Text>
        </Pressable>
      </Card>

      <SectionTitle theme={theme}>Danger zone</SectionTitle>
      <Card theme={theme}>
        <Pressable onPress={onDeleteAll} style={styles.row}>
          <Text style={[styles.rowText, { color: theme.danger }]}>
            Delete all entries
          </Text>
        </Pressable>
      </Card>

      <Text style={[styles.version, { color: theme.textFaint }]}>
        OneLine v1.0.0 · Made with care in NYC
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 20, paddingTop: 24, paddingBottom: 48 },
  title: { fontSize: 26, fontWeight: fonts.weight.bold, letterSpacing: -0.5, marginBottom: 8 },
  upsell: { marginTop: 8, borderWidth: 0 },
  upsellTitle: { fontSize: 17, fontWeight: fonts.weight.bold, marginBottom: 4 },
  upsellSub: { fontSize: 14, lineHeight: 20 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
    minHeight: 40,
  },
  rowLabel: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rowText: { fontSize: 16 },
  divider: { height: StyleSheet.hairlineWidth, marginVertical: 8 },
  times: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  timeChip: { borderRadius: 16, paddingHorizontal: 12, paddingVertical: 8 },
  timeChipText: { fontSize: 13, fontWeight: fonts.weight.medium },
  privacyNote: { fontSize: 13, lineHeight: 19, paddingVertical: 4 },
  version: { textAlign: 'center', marginTop: 28, fontSize: 12 },
});
