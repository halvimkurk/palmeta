---
name: paldex-guide-brief
description: >-
  Research a Palworld guide topic into a publishable brief (keywords, outline,
  tool deep-links, FAQ, sources). Use before writing /guides articles or when
  expanding the guides catalog.
---

# Paldex Guide Brief

Produce a **brief only** — do not write full article prose unless the user asks.  
Hand the brief to `paldex-guide-author` (or a human) next.  
Rules of truth: `guides-content` + `paldex-product`.

## Input

- Topic or working title
- Optional primary keyword
- Optional must-link tools

## Process

1. State the **player job** (one evening outcome).
2. List **failure modes** players hit.
3. Pick **primary intent** + 3 secondary queries.
4. Scan ≥2 sources; note 1.0-specific deltas.
5. Draft H2 outline (one job each).
6. Specify **≥2 tool deep-links** with exact paths/queries.
7. List visual needs (3–6) with jobs.
8. Draft FAQ questions (answers can be bullet seeds).
9. Flag spoilers / patch sensitivity.

## Output format

```markdown
# Guide brief: {working title}

## Player job
…

## Primary intent
- Keyword: …
- URL slug: …
- Category: …

## Secondary queries
- …

## 1.0 deltas to cover
- …

## Failure modes
- …

## H2 outline
1. …
2. …

## Tool CTAs
| Placement | Tool | href |
| --- | --- | --- |
| Mid | breeding | /breeding?child=… |

## Visual plan
1. … (schematic / table / shot)

## FAQ seeds
- Q: …
  A: …

## Sources (≥2)
- name — url

## Spoiler / risks
- …

## Ready for author?
yes / no — blockers
```

## Anti-patterns

- Brief that is already a full essay
- Keywords without a player job
- Tool CTAs that are bare `/breeding` with no reason
- Invented coordinates
