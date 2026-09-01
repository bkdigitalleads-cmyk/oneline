# OneLine 1.1 — Listing Rebuild ("5 year diary" family)

Why: head term "one line a day diary" fails the eyeball test (entrenched keyword-titled apps,
1000s of reviews); OneLine absent from top-12 web results at day ~12 even for "one line journal".
"5 year diary" passes both gates (Sep 1 2026 research): Google autocomplete literally suggests
"5 year diary app" and "five year journal app"; Apple SERP leaders are YearDiary (2 ratings),
"5 Year Journal • Daily Diary" (52), TenYear Diary (151), RetroJournal (~0). No incumbent.
OneLine's On This Day mechanic IS a five-year diary.

## ASC metadata (version 1.1)

**Title (21/30):** `OneLine: 5 Year Diary`

**Subtitle (29/30) — FINAL (Sep 1):** `One line a day memory journal`
Brian's on-device autofill for "5 year diary" was nearly empty (single completion:
competitor app name "retrojournal: 5-year diary") → no phrase to steal, so the
subtitle is crafted for coverage instead: it keeps the "one line a day" family +
adds "memory journal". Thin Apple-side volume is consistent with the 1-dot Apple
Ads readings across our niches — the thesis rides on Google-side demand + the
empty SERP, same as StuffKeep.

**Keywords en-US (92/100, no words repeated from title/subtitle):**
`five,journaling,daily,private,offline,micro,simple,minimal,gratitude,mood,teen,book,keepsake`

**Keywords es-MX (additional English terms — US storefront also indexes this field):**
`anniversary,couples,baby,first,moments,keepsake,scrapbook,reflection,mindfulness,evening,night`

**Keywords ar-SA (additional English terms — US storefront also indexes this field):**
`secret,lock,faceid,notes,thoughts,highlights,remember,timeline,history,record,logbook`

**Description:** keep current (already has EULA + Privacy links — REQUIRED, do not remove).
Rework first paragraph to lead with "five-year diary": e.g. "OneLine is your five-year diary:
one line a day, and every year it shows you what you wrote on this day before."

**What's New (1.1):** "OneLine is now your five-year diary — clearer subscription details on
the Pro screen, plus Restore Purchases right where you'd look for it."

**Screenshots:** reframe headline on shot #2 toward "Your five-year memory book" (On This Day
screen is the hero). Rest can stay for 1.1; full refresh optional later.

## Code changes in this branch (v1.1-rebuild)
- Paywall: pinned 3.1.2(c) legal footer (outside ScrollView, unconditional) with sub title,
  length, localized prices, Restore purchases, EULA + Privacy links — the StuffKeep-approval
  pattern. tsc clean.
- app.json: version 1.1.0, buildNumber 3.

## Ship checklist
1. ~~Brian: autofill screenshots~~ DONE Sep 1 — autofill empty; subtitle crafted (final above).
2. Push branch via GitHub web upload (bkdigitalleads-cmyk/oneline), PR, single merge → EAS build.
3. TestFlight (Brian): paywall footer visible without scrolling; links open; Restore responds.
4. ASC: create version 1.1, new title/subtitle/keywords + es-MX + ar-SA localizations
   (App Store Connect → version → localizations; add the two locales with same screenshots),
   attach build, submit (update rides solo — no IAP items needed).
5. After approval: watch "5 year diary" indexing in weekly metrics task.
