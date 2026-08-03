---
name: guides-content
description: >-
  Research and writing rules for ThePaldex Palworld 1.0 guides. Use when
  authoring /guides/[slug] articles, expanding the guides catalog, reviewing
  guide quality, or adding visuals/tool CTAs.
---

# Guides Content

## Scope

Game guides live in `data/guides/articles.json` and render at `/guides/[slug]`.  
Product job: **session chapters that end in tools** (breeding, tiers, map, teams, pals) — not an achievement tracker, not a Fandom dump, not an AI guide farm.

Related skills:

- Brief first: `paldex-guide-brief`
- Draft from brief: `paldex-guide-author`
- SEO QA after publish batch: `paldex-seo-review`

## Research bar (required)

Before publishing a guide:

1. Cross-check **≥2** independent sources (patch notes / reputable guides / community map pins).
2. Prefer facts already in this repo’s catalogs (tiers, breeding, map layers) when they overlap.
3. Keep `sourceRefs` for internal provenance. Do not turn research methodology into user-facing filler.
4. **Original prose only** — structure can match common routes; sentences cannot be pasted from Steam/IGN/Fandom/other guides.

## Article shape (session chapter)

1. **Excerpt** — one sentence promise.
2. **TL;DR** — 3–5 bullets (block `tldr`).
3. **Lead** — 2–4 sentences: what / who / when.
4. **H2 sections** — one job each (setup, route, decisions, pitfalls, next).
5. **Action lists** — imperatives with concrete nouns (zones, levels, elements, items, pals).
6. **Visuals** — 3–6 per pillar (`image` blocks); schematics and tables beat decoration.
7. **Tool CTAs** — ≥2 mid/end `toolCta` blocks with real deep links (`?child=`, `?role=`, `?mode=`).
8. **FAQ** — 4–6 real questions (also JSON-LD).
9. **Related** — `relatedGuideSlugs` + `relatedPalSlugs`.
10. **Spoiler policy** — World Tree / late story collapsed or labeled; `spoiler: true` when needed.

## Length

- Pillar guide: **1,500–2,800 words** equivalent in blocks (enough for a play session).
- Prefer a second slug over a 5k+ mega-page.
- Length without tool CTAs and visuals is a fail — dwell alone is not the goal; **session depth** is.

## Anti–AI-slop (publish gate)

Reject or rewrite if any of these appear:

- “In the vast world of…” / “It is important to note…” filler
- Synonym padding to hit word count
- Tips without numbers, names, or decisions
- Hype adjectives without a tool link (“god tier amazing”)
- Copied outline/sentences from third-party guides

Voice: second person, short sentences, one justified opinion when useful, explicit **Don’t** / **1.0 change** callouts.

### User-value pass (required)

Visible copy must answer a player's question, help them choose, or prevent a
mistake. Remove editorial and product language such as:

- “not a wiki,” “not AI,” “built for session depth”
- “this article links into our tools”
- implementation status or roadmap (“map ships next”)
- research-process claims unless the source itself is needed to judge a fact

Do not explain why the site created the guide. Explain what the player should
do, when to do it, and what changes if they choose differently. Tool links are
allowed, but their labels must promise an in-game outcome rather than a click.

## Visual budget

| Type | Job |
| --- | --- |
| Schematic SVG | Route / loop / modes |
| Table | Decisions |
| Screenshot / map art | Landmark or UI |
| Tool CTA | Leave the article into a live tool |

Store assets under `public/guides/{slug}/`. Alt text must describe the useful content.

## Categories

- `beginner` · `progression` · `bosses` · `base` · `capture` · `collectibles` · `endgame`

## Schema fields

```ts
{
  slug, title, excerpt, category, tags[],
  publishedAt, updatedAt,
  featured?, spoiler?,
  relatedGuideSlugs?, relatedPalSlugs?,
  faq: { q, a }[],
  body: Array<
    tldr | p | h2 | ul | ol | callout | table | image | toolCta
  >,
  sourceRefs: { name, url }[]
}
```

## IA / chrome

- Index: `/guides`
- Nav: `NAV.guides` in `PRIMARY_NAV`
- Home: featured `Start here` strip (max 3)
- Article uses AppShell + guide CSS — not a separate blog theme

## Anti-patterns

- Thin news rewrites masquerading as guides
- Lore essays with no actionable steps
- Unverified coords or patch-outdated levels stated as fact
- Guide pages with zero live tool links
- Achievement-tracker CTAs (legacy — do not revive)
