---
name: paldex-guide-author
description: >-
  Draft or revise ThePaldex /guides articles from an approved brief into
  articles.json blocks with human prose, visuals, tool CTAs, and FAQ. Use after
  paldex-guide-brief or when expanding guide content.
---

# Paldex Guide Author

Write **original** guide body into `data/guides/articles.json` following
`guides-content`. Prefer editing JSON blocks over inventing a CMS.

## Prerequisites

1. A brief from `paldex-guide-brief` (or equivalent user outline)
2. Confirmed slug + category
3. Tool hrefs that exist on site

## Writing order

1. Tables / ol / ul / callouts for the route (no fluff)
2. `toolCta` + `image` at decision points
3. Lead paragraphs + `tldr`
4. FAQ answers (short, factual)
5. Human pass aloud — cut slop phrases
6. Meta: title, excerpt, tags, dates, related slugs, sourceRefs

## Length & density

- Pillar: 1,500–2,800 words equivalent
- Every H2 must earn its place with actions or decisions
- ≥2 `toolCta`, ≥3 visuals (image and/or table), ≥4 FAQ

## Voice checklist

- Second person
- Concrete nouns (pal names, modes, ranks, timers)
- Explicit **Don’t** and **1.0 change** where relevant
- No synonym padding; no lore digressions

## After draft

1. Ensure `featured` only for true pillars (home strip max ~3)
2. Cross-link `relatedGuideSlugs` both ways when possible
3. Ask user to run `paldex-seo-review` on the guides batch
4. Do not mark growth backlog done until SEO review PASS (or user override)

## Forbidden

- Pasting third-party sentences
- Achievement-tracker CTAs
- New routes beyond `/guides/[slug]` without approval
- Shipping without sourceRefs
