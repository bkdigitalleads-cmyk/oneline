import AsyncStorage from '@react-native-async-storage/async-storage';
import * as StoreReview from 'expo-store-review';

const ASKED_KEY = 'oneline.reviewAsked.v1';

async function askOnce(): Promise<void> {
  try {
    const asked = await AsyncStorage.getItem(ASKED_KEY);
    if (asked) return;
    if (!(await StoreReview.hasAction())) return;
    await AsyncStorage.setItem(ASKED_KEY, '1');
    // Small delay so the save haptic/toast lands first.
    setTimeout(() => {
      StoreReview.requestReview().catch(() => {});
    }, 1200);
  } catch {
    // never let review plumbing affect the journal
  }
}

/**
 * Ask for an App Store rating exactly once, at a happy moment.
 * Trigger 1: right after saving an entry that puts the streak at 3+ days.
 * (Ratings weight heavily in App Store keyword ranking.)
 */
export async function maybeRequestReview(streak: number): Promise<void> {
  if (streak < 3) return;
  await askOnce();
}

/**
 * Trigger 2: right after a successful journal export — the moment the app
 * just handed them their own words. Same once-only guard as trigger 1.
 */
export async function maybeRequestReviewAfterExport(): Promise<void> {
  await askOnce();
}
