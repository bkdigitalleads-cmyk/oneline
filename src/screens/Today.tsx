import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme, fonts } from '../theme';
import { Card, PillButton, SectionTitle } from '../components';
import { useApp } from '../state';
import { getEntry, getEntries, getAllEntryDates, upsertEntry, Entry } from '../db';
import {
  todayKey,
  formatDayLong,
  sameDayInYear,
  fromDayKey,
  computeStreak,
} from '../dates';
import { promptForDay } from '../prompts';

const MAX_LEN = 300;

export default function TodayScreen() {
  const theme = useTheme();
  const { settings, isPro, showPaywall, bumpEntries, entriesVersion } = useApp();
  const [day, setDay] = useState(todayKey());
  const [text, setText] = useState('');
  const [savedText, setSavedText] = useState('');
  const [streak, setStreak] = useState(0);
  const [memories, setMemories] = useState<Entry[]>([]);
  const [justSaved, setJustSaved] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(async () => {
    const today = todayKey();
    setDay(today);
    const entry = await getEntry(today);
    setText(entry?.text ?? '');
    setSavedText(entry?.text ?? '');

    const dates = await getAllEntryDates();
    setStreak(computeStreak(new Set(dates), today));

    // "On this day" in previous years
    const thisYear = fromDayKey(today).getFullYear();
    const candidates: string[] = [];
    for (let y = thisYear - 1; y >= thisYear - 10; y--) {
      const k = sameDayInYear(today, y);
      if (k) candidates.push(k);
    }
    setMemories(await getEntries(candidates));
  }, []);

  useEffect(() => {
    load();
  }, [load, entriesVersion]);

  const dirty = text.trim() !== savedText.trim();

  const save = useCallback(async () => {
    const trimmed = text.trim();
    await upsertEntry(day, trimmed);
    setSavedText(trimmed);
    bumpEntries();
    setJustSaved(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    Keyboard.dismiss();
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => setJustSaved(false), 2000);
  }, [day, text, bumpEntries]);

  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, []);

  const prompt = useMemo(() => promptForDay(day), [day]);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[styles.date, { color: theme.textSecondary }]}>
          {formatDayLong(day)}
        </Text>
        <View style={styles.headerRow}>
          <Text style={[styles.title, { color: theme.text }]}>
            {savedText ? 'Today’s line' : 'One line about today'}
          </Text>
          {streak > 0 && (
            <View style={[styles.streak, { backgroundColor: theme.accentSoft }]}>
              <Text style={[styles.streakText, { color: theme.accent }]}>
                🔥 {streak} day{streak === 1 ? '' : 's'}
              </Text>
            </View>
          )}
        </View>

        {settings.showPrompts && !savedText && (
          <Text style={[styles.prompt, { color: theme.textFaint }]}>“{prompt}”</Text>
        )}

        <Card theme={theme} style={styles.entryCard}>
          <TextInput
            style={[styles.input, { color: theme.text }]}
            multiline
            value={text}
            onChangeText={(t) => setText(t.slice(0, MAX_LEN))}
            placeholder="Write one honest line…"
            placeholderTextColor={theme.textFaint}
            maxLength={MAX_LEN}
            autoCorrect
          />
          <View style={styles.entryFooter}>
            <Text style={[styles.count, { color: theme.textFaint }]}>
              {text.length}/{MAX_LEN}
            </Text>
            <PillButton
              theme={theme}
              label={justSaved ? 'Saved ✓' : savedText ? 'Update' : 'Save'}
              onPress={save}
              disabled={!dirty && !justSaved}
            />
          </View>
        </Card>

        {memories.length > 0 && (
          <View>
            <SectionTitle theme={theme}>On this day</SectionTitle>
            {memories.map((m) => {
              const year = fromDayKey(m.date).getFullYear();
              const locked = !isPro;
              return (
                <Card key={m.date} theme={theme} style={styles.memoryCard}>
                  <Text style={[styles.memoryYear, { color: theme.accent }]}>{year}</Text>
                  {locked ? (
                    <Text
                      style={[styles.memoryText, { color: theme.textFaint }]}
                      onPress={showPaywall}
                    >
                      Unlock Pro to read your line from {year} →
                    </Text>
                  ) : (
                    <Text style={[styles.memoryText, { color: theme.text }]}>{m.text}</Text>
                  )}
                </Card>
              );
            })}
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 20, paddingTop: 24, paddingBottom: 40 },
  date: { fontSize: 14, fontWeight: fonts.weight.medium, marginBottom: 4 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  title: { fontSize: 26, fontWeight: fonts.weight.bold, letterSpacing: -0.5 },
  streak: { borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  streakText: { fontSize: 13, fontWeight: fonts.weight.semibold },
  prompt: { fontSize: 15, fontStyle: 'italic', marginBottom: 12, lineHeight: 21 },
  entryCard: { marginTop: 4 },
  input: {
    fontSize: 18,
    lineHeight: 26,
    minHeight: 96,
    textAlignVertical: 'top',
  },
  entryFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  count: { fontSize: 12 },
  memoryCard: { marginBottom: 10 },
  memoryYear: { fontSize: 13, fontWeight: fonts.weight.bold, marginBottom: 4 },
  memoryText: { fontSize: 16, lineHeight: 23 },
});
