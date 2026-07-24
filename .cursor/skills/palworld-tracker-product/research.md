# Research notes — Palworld completion tracker

Last updated: 2026-07-13

## Market timing

- Palworld **1.0** launched **2026-07-10** (Pocketpair; exits Early Access). Platforms: PC, Xbox Series, PS5, Game Pass.
- Launch week = peak search + Reddit interest. Ship a useful MVP before hype cools.
- Official: [Pocketpair 1.0 announcement](https://www.pocketpair.jp/en/game-news/palworld-1-0-july-10-cinematic-trailer-revealed/)

## Completionism product anatomy

Source: [completionism.com](https://completionism.com/)

Home structure:

1. **Pinned** — user-curated shortcuts (max 9)
2. **Live & Upcoming Events** — time-boxed content
3. **Expansions** — hierarchical browse
4. **Timeless** — non-expansion collections

Core loop:

1. Connect account / import character (Battle.net regions EU/US/KR/TW)
2. Browse collection with **Filters** + **More filters**
3. Toggle faction / content tags (Alliance, Horde, PvP, etc.)
4. Focus on **Missing** items
5. Troubleshoot sync via FAQ accordion inside the import UI

Why it works: low-friction onboarding, dense but scannable lists, progress is personal not social, filters beat search for hunters.

## Palworld achievement landscape

- Steam AppID: **1623730**
- Counts differ by source/update (~57–75+); treat schema as **versioned data**, not hardcoded.
- Achievement waves historically: base EA → Sakurajima → Feybreak → Crossplay → Terraria → **1.0**
- Categories that map well to site IA:
  - Pal catching / taming tiers
  - Tower / sovereign bosses
  - Legendary / rare Pal catches
  - Raid bosses (e.g. Bellanoir line)
  - Crafting grind (spheres, ammo, ingots)
  - Exploration / collectibles (notes, effigies)
  - Labor research / dispatch / fishing / arena / surveyor
- No missables reported in community guides → good for “path” recommendations without FOMO panic.
- Guide reference (structure only; do not scrape text): [Steam 100% guide](https://steamcommunity.com/sharedfiles/filedetails/?id=3277054444)
- Schema/stats APIs: Steam `GetSchemaForGame`, `GetPlayerAchievements`, `GetGlobalAchievementPercentagesForApp`

## Competitors / substitutes

| Product | Type | Gap vs us |
| --- | --- | --- |
| IGN checklist | Manual browser ticks | Thin guides, not Palworld-deep |
| Fandom Achievements | Wiki | No personal sync UX |
| SteamHunters / TSA / Exophase | Multi-game trackers | Shallow how-to, not game-native |
| Trophi / Acheev | Multi-game + AI/guides | Not Palworld-specialized |
| Destructoid / VideoGamer | Static articles | No tracker |

Opportunity: **single-game Completionism** for Palworld — depth + sync + ads page depth.

## Steam sync constraints

- Use Steam OpenID / sign-in; never expose Web API key client-side.
- Profiles must be public (or owned via OAuth session) for achievement fetch.
- Xbox / PS5: no Steam API → manual toggle + optional import later.
- Cache schema; refresh player progress on demand + soft TTL.

## Monetization research (gaming vertical)

Playwire 2026 publisher data (gaming):

- Gaming is an **impressions-per-session** business (corr ~0.79 with RPS).
- Optimize page depth + sensible density, not vanity CPM floors.
- Aggressive floors hurt fill → lower session revenue.
- Gaming layouts: wiki / tracker / guide patterns work with smart injection.
- Sources: [Playwire vertical optimization](https://www.playwire.com/blog/publisher-revenue-optimization-by-vertical-how-to-maximize-ad-revenue-in-your-vertical), [Gaming publishers](https://www.playwire.com/verticals/gaming)

Practical ladder for a new site:

1. Launch: AdSense / lightweight network + clean Core Web Vitals
2. Scale: Ezoic-class or direct Playwire when volume justifies
3. Never sacrifice first-paint tracker usability for a 4th ad above the fold

## Reddit / distribution notes

- r/Palworld historically hostile to blunt self-promo; lead with **utility** (missing checklist, 1.0 new achievements), not “my site”.
- Prefer: value-first post, transparent ownership, invite feedback, follow each sub’s rules.
- Adjacent: r/PalworldTips, r/achievement_hunters, r/Steam, Discord servers, Steam guide comment links (careful with ToS).

## Design implications for this repo

- Information architecture: Hub → Category → Achievement detail (3-depth max).
- Default filter = Missing.
- Pin + recent = Completionism-like home.
- Spoiler gate for 1.0 story / World Tree content.
- English-first for Reddit reach; RU optional later.
- Brand: Palworld-adjacent atmosphere without infringing Pocketpair assets; use original art or licensed/allowed icons only.
