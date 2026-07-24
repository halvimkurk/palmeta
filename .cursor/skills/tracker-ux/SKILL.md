---
name: tracker-ux
description: >-
  UX rules for the Palworld achievement/completion tracker UI. Use when designing
  pages, components, filters, onboarding, mobile layouts, or reviewing UI for
  convenience and completionist workflows.
---

# Tracker UX

## North star

A completionist opens the site mid-session, sees **exactly what’s left**, marks or syncs progress, and jumps back into the game in under a minute.

## First viewport (tracker hub)

One composition, not a dashboard. Include only:

1. Brand / product name (hero-level)
2. Overall progress (one clear %)
3. Primary CTA: **View missing** or **Connect Steam**
4. One short line of support copy
5. Dominant visual atmosphere (Palpagos mood — not flat gray)

Do **not** put in the first viewport: ad grids, stat strips, schedule widgets, multi-card feature grids, promo badges on imagery.

Follow the user’s frontend design rules for brand, typography, backgrounds, cards, and motion.

## Core interaction model

### Filters (always visible on list pages)

Required:

- Status: **Missing** (default) | All | Done
- Search by name
- Category chips
- Update pack / patch tags

Optional (“More filters”):

- Rarity / global % buckets
- Estimated effort (quick / grind / boss)
- Spoiler-safe vs show spoilers
- Platform notes (Steam-only, etc.)

Persist filter state in URL query params so links are shareable.

### List rows

Each achievement row:

- Icon + title + short requirement
- Category + update tag
- Progress affordance (checkbox / synced lock state)
- Optional global unlock % (muted)
- Click → detail with guide steps

Completed rows: dimmed or strikethrough; hide when Missing filter on.

### Detail page

One job: finish this achievement.

1. Title + status
2. Requirement
3. Numbered short steps (spoiler toggle if needed)
4. Up to 2 guide visuals when location matters (map pin + coords, or screenshot)
5. Related: region, boss, Prereqs
6. Prev / next missing in current filter set

Guide visuals budget: **0–2** per achievement. Prefer schematic map pins with coordinates over decorative art. Real in-game screenshots go in `public/guides/shots/` and use `kind: "shot"`.

### Progress persistence

Priority order:

1. Steam sync (source of truth when connected)
2. Manual toggles merge with sync (never wipe manual notes)
3. localStorage always works logged-out
4. Clear “last synced” timestamp

Onboarding modal (Completionism-style): Connect Steam **or** continue as guest; FAQ accordion for private profile / API errors.

## Convenience rules (non-negotiable)

1. **Missing-first** — default every list to incomplete items.
2. **Keyboard** — `/` focuses search; `j`/`k` move rows if implemented.
3. **Thumb-zone** — mobile checkboxes and filters reachable one-handed.
4. **Optimistic UI** — toggle feels instant; reconcile sync in background.
5. **No dead ends** — empty Missing state celebrates 100% and suggests next category.
6. **Pinning** — pin up to ~9 categories on hub.
7. **Offline-tolerant** — catalog + local progress usable if Steam API fails.
8. **Spoiler respect** — 1.0 story content collapsed by default.

## IA

```
/                     Hub (pinned, categories, progress)
/achievements         All with filters
/achievements/[slug]  Detail + guide
/categories/[slug]    Category list
/guides               Game guides + achievement how-to hub
/guides/[slug]        Portal mini-article
/news                 Patch / news briefs
/updates/[slug]       Achievements added in a patch
/sync                 Steam connect / troubleshoot
```

Max three clicks from hub to a guide step or portal article.

## Performance UX

- Skeleton rows, not blank screens
- Icons lazy-load; CLS reserved
- Filters apply instantly on client data
- Ads never block checklist interaction (see `gaming-ad-monetization`)

## Accessibility

- Contrast for done/missing states beyond color alone
- Focus rings on filters and toggles
- `aria-pressed` on filter chips; live region for progress % updates

## Anti-patterns

- Requiring account before browsing
- Infinite scroll that loses place after toggle
- Hover-only actions on mobile
- Walls of uncategorized achievements
- Guide walls of text (prefer 3–7 steps)
- Card-heavy hero and feature marketing layouts
