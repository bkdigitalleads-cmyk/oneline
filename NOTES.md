# OneLine change log

Newest first. One entry per commit: date, version/build, what changed and why.

- 2026-10-17: Version 1.2.4, build 10. Fixed AUDIT findings 1 and 3.
  - Finding 1 (Today kept yesterday's date after resume): Today now reloads when the app becomes active on a new local day. Save also checks the day first; if midnight passed while the screen was open, it reloads for the new day instead of writing to yesterday, and keeps the unsaved text in the box (when today has no entry yet) so the user can tap Save again. Why: resuming a suspended app could overwrite yesterday's line or file today's line under yesterday.
  - Finding 3 (Pro only checked at launch): state.tsx registers a RevenueCat CustomerInfo update listener after setup, and refreshes Pro whenever the app returns to the foreground. The foreground refresh keeps the current Pro value if the lookup fails (for example offline), so a paying user never loses Pro on resume. purchases.ts, the `pro` entitlement and product ids are unchanged. Why: offer code redemptions, Ask to Buy approvals, late purchase confirmations and lapsed trials were missed until a relaunch.
  - Checked: `npm ci`, `npx tsc --noEmit` (no errors). Still to check on device via TestFlight: leave the app on Today overnight and resume; redeem or restore and switch back.
- 2026-10-15: Added CLAUDE.md, AUDIT.md (read-only bug check from Cowork) and this log. No app code changed. Live version 1.2.3 build 9.

## Noticed, not changed

- Today: if midnight passes while the Today screen stays open in the foreground, the date header stays on the old day until the next save or resume. Save is protected, so no data is at risk.
- state.tsx launch check: `getIsPro()` returns false on any error, so a lookup failure at launch shows Pro as locked until the listener or the next foreground refresh corrects it. RevenueCat normally answers from its cache, so this should be rare. Left alone because purchases.ts logic is off limits without Brian asking.
