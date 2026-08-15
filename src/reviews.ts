import AsyncStorage from '@react-native-async-storage/async-storage';
import * as StoreReview from 'expo-store-review';

const ASKED_KEY = 'oneline.reviewAsked.v1';

/**
 * Ask for an App Store rating exactly once, at a happy moment:
 * right after saving an entry that puts the streak at 3+ days.
 * (Ratings weight heavily in App Store keyword ranking.)
 */
export async function maybeRequestReview(streak: number): Promise<void> {
  try {
    if (streak < 3) return;
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
