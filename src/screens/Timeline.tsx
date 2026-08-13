import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  View,
  Pressable,
} from 'react-native';
import { useTheme, fonts } from '../theme';
import { Card } from '../components';
import { useApp, FREE_HISTORY_DAYS } from '../state';
import { getAllEntries, searchEntries, Entry } from '../db';
import { addDays, todayKey, formatDayShort, formatMonth } from '../dates';

interface Row {
  type: 'month' | 'entry' | 'locked';
  key: string;
  entry?: Entry;
  monthLabel?: string;
  lockedCount?: number;
}

export default function TimelineScreen() {
  const theme = useTheme();
  const { isPro, showPaywall, entriesVersion } = useApp();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Entry[] | null>(null);

  useEffect(() => {
    (async () => setEntries(await getAllEntries()))();
  }, [entriesVersion]);

  const runSearch = useCallback(
    async (q: string) => {
      setQuery(q);
      if (!q.trim()) {
        setResults(null);
        return;
      }
      if (!isPro) return; // search is Pro; input shows lock prompt
      setResults(await searchEntries(q.trim()));
    },
    [isPro]
  );

  const rows = useMemo<Row[]>(() => {
    const source = results ?? entries;
    const cutoff = addDays(todayKey(), -(FREE_HISTORY_DAYS - 1));
    const visible: Entry[] = [];
    let lockedCount = 0;
    for (const e of source) {
      if (isPro || e.date >= cutoff) visible.push(e);
      else lockedCount++;
    }
    const out: Row[] = [];
    let currentMonth = '';
    for (const e of visible) {
      const month = e.date.slice(0, 7);
      if (month !== currentMonth) {
        currentMonth = month;
        out.push({ type: 'month', key: `m-${month}`, monthLabel: formatMonth(e.date) });
      }
      out.push({ type: 'entry', key: e.date, entry: e });
    }
    if (lockedCount > 0 && !results) {
      out.push({ type: 'locked', key: 'locked', lockedCount });
    }
    return out;
  }, [entries, results, isPro]);

  const renderRow = useCallback(
    ({ item }: { item: Row }) => {
      if (item.type === 'month') {
        return (
          <Text style={[styles.month, { color: theme.textSecondary }]}>
            {item.monthLabel}
          </Text>
        );
      }
      if (item.type === 'locked') {
        return (
          <Pressable onPress={showPaywall}>
            <Card theme={theme} style={styles.lockedCard}>
              <Text style={[styles.lockedTitle, { color: theme.text }]}>
                🔒 {item.lockedCount} more {item.lockedCount === 1 ? 'memory' : 'memories'}
              </Text>
              <Text style={[styles.lockedSub, { color: theme.textSecondary }]}>
                Free shows your last {FREE_HISTORY_DAYS} days. Unlock Pro to keep every
                line forever.
              </Text>
            </Card>
          </Pressable>
        );
      }
      const e = item.entry!;
      return (
        <Card theme={theme} style={styles.entryCard}>
          <Text style={[styles.entryDate, { color: theme.accent }]}>
            {formatDayShort(e.date)}
          </Text>
          <Text style={[styles.entryText, { color: theme.text }]}>{e.text}</Text>
        </Card>
      );
    },
    [theme, showPaywall]
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Your story</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          {entries.length} {entries.length === 1 ? 'line' : 'lines'} written
        </Text>
        <View
          style={[
            styles.searchBox,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}
        >
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            value={query}
            onChangeText={runSearch}
            placeholder={isPro ? 'Search your lines…' : 'Search (Pro)'}
            placeholderTextColor={theme.textFaint}
            onFocus={() => {
              if (!isPro) showPaywall();
            }}
          />
        </View>
      </View>
      <FlatList
        data={rows}
        keyExtractor={(r) => r.key}
        renderItem={renderRow}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={[styles.empty, { color: theme.textFaint }]}>
            {results !== null
              ? 'No lines match that search.'
              : 'Your journal is empty. Write your first line on the Today tab — future you will thank you.'}
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingTop: 24 },
  title: { fontSize: 26, fontWeight: fonts.weight.bold, letterSpacing: -0.5 },
  subtitle: { fontSize: 14, marginTop: 2, marginBottom: 12 },
  searchBox: {
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 14,
    marginBottom: 8,
  },
  searchInput: { fontSize: 16, paddingVertical: 10 },
  list: { padding: 20, paddingTop: 8, paddingBottom: 40 },
  month: {
    fontSize: 13,
    fontWeight: fonts.weight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 16,
    marginBottom: 8,
  },
  entryCard: { marginBottom: 10 },
  entryDate: { fontSize: 12, fontWeight: fonts.weight.bold, marginBottom: 4 },
  entryText: { fontSize: 16, lineHeight: 23 },
  lockedCard: { marginTop: 16, alignItems: 'center', paddingVertical: 22 },
  lockedTitle: { fontSize: 16, fontWeight: fonts.weight.semibold, marginBottom: 6 },
  lockedSub: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
  empty: { textAlign: 'center', marginTop: 60, fontSize: 15, lineHeight: 22 },
});
