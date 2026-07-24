---
name: guides-content
description: >-
  Research and writing rules for Palworld portal game guides (not achievement
  blurbs). Use when authoring /guides/[slug] articles, expanding the guides
  catalog, or reviewing guide quality and provenance.
---

# Guides Content

## Scope

Game guides live in `data/guides/articles.json` and render at `/guides/[slug]`.  
Achievement mini-guides stay in `data/catalog/achievements.v1.json` (`guideIntro` + `guideSteps`).

## Research bar (required)

Before publishing a guide:

1. Cross-check **≥2** independent sources (patch notes / reputable guides / community map pins).
2. Prefer facts already used in this repo’s achievement catalog when they overlap (tower levels, coords, element counters).
3. Keep `sourceRefs` for provenance (internal; may be shown lightly as “Researched against public 1.0 coverage”).
4. **Original prose only** — structure can match common routes; sentences cannot be pasted from Steam/IGN/Fandom/other guides.

## Article shape (Wowhead mini-article)

1. **Excerpt** — one sentence promise.
2. **Lead** — 2–4 sentences: what / who it’s for / difficulty.
3. **H2 sections** — one job each (order, setup, steps, pitfalls).
4. **Action lists** — imperatives with concrete nouns (zones, levels, elements, items).
5. **Tracker CTA** — link Missing checklist and related achievement pages when relevant.
6. **Spoiler policy** — World Tree / Astralym / late story collapsed or labeled; `spoiler: true` on the article when needed.

## Length

- Pillar guide: enough to finish a session goal (roughly 600–1200 words equivalent in blocks).
- Do not write Fandom-length dumps. Prefer another slug over a 5k-word mega-page.

## Categories

Use consistent category slugs:

- `beginner`
- `progression`
- `bosses`
- `base`
- `capture`
- `collectibles`
- `endgame`

## Schema fields

```ts
{
  slug, title, excerpt, category, tags[],
  publishedAt, updatedAt,
  spoiler?: boolean,
  relatedAchievementSlugs?: string[],
  body: Array<p | h2 | ul | ol>,
  sourceRefs: { name, url }[]
}
```

## Anti-patterns

- Thin news rewrites masquerading as guides.
- Lore essays with no actionable steps.
- Unverified coords or patch-outdated levels stated as fact.
- Guide pages with zero link into the tracker when an achievement exists.
