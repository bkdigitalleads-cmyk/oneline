# OneLine audit (Oct 15 2026)
## Findings
1. [HIGH] Today screen keeps yesterday's date after the app resumes, so a new line is saved to (or overwrites) the previous day
   - Where: src/screens/Today.tsx:32 (day state), src/screens/Today.tsx:40-62 (load only runs on mount and entriesVersion), src/screens/Today.tsx:66-68 (save writes to the stale `day`)
   - What happens: user writes Tuesday's line at 10pm and leaves the app on the Today tab. iOS keeps it suspended. Wednesday at 9pm they tap the reminder; the app resumes without remounting, so Today still shows Tuesday's date and Tuesday's text under the "Today's line" heading. (a) If they replace that text with Wednesday's line and tap Update, `upsertEntry('…-tuesday')` overwrites Tuesday's entry: Tuesday is lost and Wednesday is never written. (b) If Tuesday had no entry, Wednesday's line is filed under Tuesday, then `bumpEntries` reloads with today's key and the line they just typed vanishes from the screen. The streak and On This Day also stay stale. Users with Face ID lock on are partly protected only because LockGate remounts the screen.
   - Fix: in Today, add an AppState 'change' listener that calls `load()` when the state becomes 'active' and `todayKey() !== day`. Also, at the top of `save`, if `todayKey() !== day`, call `load()` and return instead of writing.

2. [MED] Face ID lock unmounts the whole app on background, so unsaved text is thrown away
   - Where: src/LockGate.tsx:42-44 and src/LockGate.tsx:53 (returns the lock view in place of `children`)
   - What happens: a Pro user with the lock on types half a line, switches to Messages to check a detail, then comes back. On 'background', LockGate swaps the tree for the lock screen, which unmounts TodayScreen. After Face ID, Today remounts, `load()` runs `setText(entry?.text ?? '')`, and the typed text is gone.
   - Fix: always render `children` and draw the lock view as an absolutely positioned overlay on top (`StyleSheet.absoluteFill`) when locked, so the screens keep their state.

3. [MED] Pro status is read only once at launch: there is no CustomerInfo listener and no refresh on foreground
   - Where: src/state.tsx:63-68 (single `getIsPro()`), src/state.tsx:99-101 (`refreshPro` is defined but never called anywhere)
   - What happens: any entitlement change that does not come through the in-app paywall is missed until the app is killed and relaunched, or the user taps Restore. Examples: redeeming a promo or offer code for Lifetime in the App Store app and then switching back to OneLine, an Ask to Buy approval, a purchase whose confirmation arrived after the paywall call errored, and recovery from a billing retry. In each case the user has paid but still sees the paywall and locked memories. In the other direction, a weekly trial that lapses keeps Pro for as long as the app stays resident.
   - Fix: after `initPurchases()` in state.tsx, when `isBillingAvailable()`, register `Purchases.addCustomerInfoUpdateListener(info => setIsPro(isProFromCustomerInfo(info)))`. Also call `refreshPro()` on AppState 'active'.

4. [LOW] Face ID lock has two dead ends: a lapsed subscriber cannot turn it off, and a removed passcode locks the user out
   - Where: src/screens/Settings.tsx:35-43 (`requirePro` wraps the toggle in both directions), src/LockGate.tsx:19-30 (no handling of `res.error`)
   - What happens: (a) a weekly subscriber turns the lock on and then the subscription lapses. Turning the lock off now opens the paywall, so they must pay to stop being asked for Face ID. (b) If the user later turns off their iPhone passcode, which also removes Face ID, `authenticateAsync` fails with `passcode_not_set` on every attempt. The journal stays behind "Unlock" with no explanation until they set a new passcode.
   - Fix: only require Pro to turn the lock on. In `unlock`, if `res.error` is 'passcode_not_set', 'not_enrolled' or 'not_available', show an alert explaining the cause, or unlock, since the device has no security left to enforce.

5. [LOW] Daily reminder state is never re-synced, so the switch can show ON while nothing fires
   - Where: src/state.tsx:55-71 (nothing at launch checks permission or the scheduled request), src/state.tsx:82-93 (a rejected `scheduleNotificationAsync` propagates out of `updateSettings` with the switch already ON)
   - What happens: the user enables the reminder, then later turns off notifications for OneLine in iOS Settings, or moves to a new phone from a backup (AsyncStorage comes back with `reminderEnabled: true`). Settings still shows the reminder as on, but no reminder arrives, and nothing prompts them to fix it.
   - Fix: on launch, if `settings.reminderEnabled`, check `getPermissionsAsync()`. Then either call `scheduleDailyReminder(hour, minute)` (idempotent, because it uses a fixed identifier) or persist `reminderEnabled: false`. Wrap the schedule call in try/catch and revert the switch on failure.

## Checked and fine
- purchases usage: the onboarding paywall is skipped when already Pro; Paywall buy and restore only set Pro on a true entitlement; Settings restore sets `isPro` from the RevenueCat result; `ready` gates the UI until Pro status is known, so the Lifetime buyer never sees a locked flash
- Free tier gating: the 30-day Timeline cutoff, search, On This Day, export and Face ID are all checked against `isPro`. Older entries are hidden, never deleted. No path gives Pro for free.
- db.ts: the schema has not changed since v1.0 (verified in git history), so no migration is needed; uses CREATE IF NOT EXISTS; empty text deletes the entry by design; LIKE wildcards are escaped
- dates.ts: all day keys are built from local getters (no toISOString); addDays uses setDate, so DST and year rollover work; Feb 29 is skipped in non-leap years by design (a Feb 29 entry resurfaces only every 4 years); streak math is correct
- notifications.ts: fixed identifier plus cancel before scheduling means no duplicates; the iOS CALENDAR repeating trigger fires at local time and follows timezone changes
- reviews.ts: asks once after the first saved line or after an export; the key is set only when `hasAction()` is true; failures are swallowed
- CSV export: RFC-4180 quoting, gated to Pro, written to the cache dir with the new File API
- Onboarding: the onboarded flag has existed since v1.0, so updating users are not re-onboarded; the paywall's swipe-down dismiss goes through `onRequestClose`
- Settings JSON.parse is wrapped in try/catch and merged over the defaults
