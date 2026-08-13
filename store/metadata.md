# OneLine — App Store Metadata (ready to paste)

## App name (30 chars max)
`OneLine: One Line a Day` (23 chars)

## Subtitle (30 chars max)
`Tiny daily journal & memories` (29 chars)

## Keywords (100 chars max, comma-separated, no spaces after commas)
`one line a day,journal,diary,daily,micro journal,memories,gratitude,streak,private,minimal,writing`
(98 chars)

## Promotional text (170 chars max)
`One honest line about today. 30 seconds a night becomes the story of your life — and next year, you'll read what you wrote today. Private, offline, yours.`

## Description
The hardest part of journaling is doing it tomorrow. OneLine fixes that: one line about today, and you're done.

Thirty seconds a night. That's the whole habit. No blank-page dread, no guilt about writing too little — one honest line is the point. Keep it up and something quietly wonderful happens: next year, on this exact day, OneLine shows you what you wrote today. Then the year after. Your ordinary days become a story you get to reread for the rest of your life.

WHY ONE LINE WORKS
• 30 seconds. Small enough that you'll actually do it every day.
• Streaks keep you going — and skipping a day never wipes your history.
• A gentle daily reminder, at the time you choose.
• Stuck? A thoughtful daily prompt gets you started.

ON THIS DAY
Every day, see the lines you wrote on this date in past years. It's the best 30 seconds of your morning — one year of writing makes every day a tiny reunion with who you were.

COMPLETELY PRIVATE
Your journal never leaves your iPhone. No account. No cloud. No tracking. Nothing to hack, nothing to leak. Optional Face ID lock keeps it for your eyes only.

ONELINE PRO
The app is free to use every day, and your last 30 days are always visible. Pro keeps every line forever, unlocks On This Day memories, full-text search, CSV export, and Face ID lock. Yearly (with a 7-day free trial) or monthly.

Start tonight. One line. Future you is already grateful.

## Support URL
(GitHub Pages — see launch checklist)

## Privacy Policy URL
(GitHub Pages — see launch checklist)

## Category
Primary: Lifestyle · Secondary: Productivity

## Age rating
4+ (no objectionable content)

## Price
Free with in-app purchases

## In-App Purchases (create in App Store Connect)
| Product ID | Type | Price | Notes |
|---|---|---|---|
| `oneline_pro_yearly` | Auto-renewing subscription | $9.99/yr | 7-day free trial |
| `oneline_pro_monthly` | Auto-renewing subscription | $1.99/mo | — |
| `oneline_pro_lifetime` | Non-consumable | $24.99 | one-time, anchors yearly |
Subscription group: `OneLine Pro`. Entitlement in RevenueCat: `pro`.

Pricing rationale (validated against live competitors Aug 2026): niche rivals
(DayGram etc.) sell $1-2.99 one-time, so yearly must feel cheap ($9.99 w/ trial)
and a lifetime tier ($24.99) captures subscription-averse buyers while making
yearly look like the value pick.

## App Privacy label answers
- Purchases → Purchase History: App Functionality, linked to identity, no tracking
- Identifiers → User ID (RevenueCat anonymous ID): App Functionality, linked to identity, no tracking
- Everything else: **Data Not Collected**

## Review notes (paste into App Review notes field)
OneLine is a fully offline journal. No login or account exists. To test Pro
features, use the sandbox purchase flow on the paywall (Settings → OneLine Pro).
Journal entries are stored only on-device in SQLite.
