---
name: palworld-tracker-product
description: >-
  Product north star for the Palworld completion portal (tracker + guides).
  Use when planning features, scoping MVP, prioritizing roadmap, writing copy,
  or deciding what belongs in the product vs a generic competitor wiki.
---

# Palworld Portal — Product

## One-liner

A **Palworld 1.0 portal**: achievement tracker (Missing-first + Steam sync) plus original researched guides for the whole game — monetized with ads without killing usability.

## Product shape

Two pillars that reinforce each other:

| Pillar | Job |
| --- | --- |
| **Tracker** | What am I missing for 100%, and what’s the next easiest unlock? |
| **Guides** | How do I play / progress / beat systems in Palworld 1.0? |

Analog for tracker UX: [Completionism](https://completionism.com/) (product shape, not branding).  
Analog for guides IA: Wowhead-style mini-articles + pillar hubs — **not** Fandom dump pages.

| Completionism pattern | Palworld equivalent |
| --- | --- |
| Battle.net character import | Steam OpenID + `GetPlayerAchievements` (AppID `1623730`) |
| Expansions → categories | Update packs / regions → achievement categories |
| Filters: Everything / Missing | Default to **Missing**; optional Everything / Done |
| Pin collections (≤9) | Pin categories / guides |
| Live & Upcoming Events | Patch notes / new achievement drops after updates |
| Manual import fallback | Manual checklist (Xbox / PS5 / private Steam profile) |
| FAQ inside import modal | Same — reduce bounce on sync failure |

## Positioning

- **Is** a personal cockpit for hunters **and** a guide portal for everyone else.
- **Is** original researched how-tos (beginner, progression, bosses, base, pals, biomes).
- **Is not** scraped Steam/IGN paste.
- **Is not** a full Paldex wiki clone — deep where it helps play, shallow where Fandom already owns lore tables.

Primary jobs:

1. Hunters: *Missing list → short how-to → done.*
2. Players: *Find a trusted route / boss order / base setup fast.*

## Audience (launch)

1. Steam achievement hunters returning for **1.0** (released 2026-07-10).
2. New / returning players who need progression guides after 1.0.
3. Xbox / Game Pass players who need **manual** tracking.
4. Reddit / Discord users who want shareable Missing views + guide links.

## Content lanes

### Tracker (shipped / ongoing)

1. Full achievement catalog with icons, descriptions, categories, update tags.
2. Progress + Missing / All / Done filters.
3. Per-achievement mini-guides (`guideIntro` + steps + tips).
4. Steam sync + local persist.

### Game guides (`/guides/[slug]`)

Pillar first, long-tail later:

1. Beginner first hours
2. Recommended progression path
3. Tower bosses order + counters
4. Early / mid base setup
5. Capture power & spheres
6. Collectibles routes (effigies, notes)
7. Biome / island packs as needed

Link guides ↔ tracker wherever an achievement or Missing list benefits.

### Already-adjacent surfaces

- `/pals`, `/tiers`, `/teams`, `/news` — keep guide copy consistent with catalog facts.

## Explicitly defer

- Multi-game library trackers.
- Exhaustive lore wiki / every Recipe dump.
- Accounts/cloud sync beyond Steam OAuth (can add later).
- AI chat guides as the primary UX.

## Success metrics

- Session depth: ≥3 pageviews (hub → guide or category → detail).
- Time-to-value: Missing list or a pillar guide useful in &lt;10s.
- Guide SEO / search entries that convert into tracker use.
- Sync conversion among Steam visitors.
- Ad health: impressions/session up without bounce spike (see `gaming-ad-monetization`).

## Competitive gap

Static lists (IGN), Fandom tables, and Steam guides exist. Gap: **synced checklist + original 1.0 guides in one place**, update-fast after patches.

## Anti-goals

- Cluttered dashboard first paint.
- Paywalling core checklist.
- Spoiling story/World Tree content without a spoiler toggle.
- Copying third-party guide text verbatim (copyright / trust risk).
- Letting the portal become unsorted wiki spam with no tracker linkbacks.

## References

- Detailed research notes: [research.md](research.md)
- Guide writing: `guides-content` skill
- UX rules: `tracker-ux` skill
- Ads: `gaming-ad-monetization` skill
- Launch: `reddit-launch` skill
