/**
 * Date helpers. All journal dates are local-timezone calendar days,
 * stored as 'YYYY-MM-DD' strings (never UTC-shifted).
 */

/** Format a Date as local 'YYYY-MM-DD'. */
export function toDayKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Today's local day key. */
export function todayKey(): string {
  return toDayKey(new Date());
}

/** Parse a 'YYYY-MM-DD' key into a local-midnight Date. */
export function fromDayKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** Day key N days before/after the given key. */
export function addDays(key: string, delta: number): string {
  const d = fromDayKey(key);
  d.setDate(d.getDate() + delta);
  return toDayKey(d);
}

/** Same month/day in a previous year; null for Feb 29 in non-leap years. */
export function sameDayInYear(key: string, year: number): string | null {
  const [, m, d] = key.split('-').map(Number);
  if (m === 2 && d === 29) {
    const isLeap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    if (!isLeap) return null;
  }
  return `${year}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

/** Human-friendly label like 'Thursday, August 13'. */
export function formatDayLong(key: string): string {
  return fromDayKey(key).toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

/** Short label like 'Aug 13, 2026'. */
export function formatDayShort(key: string): string {
  return fromDayKey(key).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/** Month header label like 'August 2026'. */
export function formatMonth(key: string): string {
  return fromDayKey(key).toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  });
}

/** Day-of-year (1-366) for prompt rotation. */
export function dayOfYear(key: string): number {
  const d = fromDayKey(key);
  const start = new Date(d.getFullYear(), 0, 1);
  return Math.floor((d.getTime() - start.getTime()) / 86400000) + 1;
}

/**
 * Current streak: number of consecutive days with entries, counting
 * back from today (or from yesterday, if today has no entry yet —
 * today being unwritten doesn't break a streak in progress).
 */
export function computeStreak(entryKeys: Set<string>, today: string): number {
  let cursor = entryKeys.has(today) ? today : addDays(today, -1);
  let streak = 0;
  while (entryKeys.has(cursor)) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

/** Longest streak across all entries. */
export function computeLongestStreak(entryKeys: Set<string>): number {
  let longest = 0;
  for (const key of entryKeys) {
    // Only start counting from streak-starts (previous day absent).
    if (entryKeys.has(addDays(key, -1))) continue;
    let len = 0;
    let cursor = key;
    while (entryKeys.has(cursor)) {
      len += 1;
      cursor = addDays(cursor, 1);
    }
    if (len > longest) longest = len;
  }
  return longest;
}
