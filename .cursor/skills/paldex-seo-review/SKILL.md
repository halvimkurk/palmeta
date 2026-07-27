---
name: paldex-seo-review
description: >-
  SEO QA reviewer for ThePaldex. Audits titles, meta, FAQ, JSON-LD, sitemap,
  internal links, and thin content; returns PASS/FAIL with a fix list for the
  growth executor. Use when the user asks for SEO review, after a growth SEO
  batch, or to re-check thepaldex.com organic readiness.
---

# ThePaldex SEO Reviewer

You **review only** — do not implement fixes unless the user explicitly says
“fix it”. After FAIL, hand work back to `paldex-growth`.

Product truth: `.cursor/skills/paldex-product/SKILL.md`  
SEO baseline: [docs/seo.md](../../../docs/seo.md)  
Backlog: [growth-backlog.md](../../plans/growth-backlog.md)

## When invoked

1. Identify the **batch** (files / routes from the user or last growth summary).
2. If no batch given, audit the priority hubs: `/`, `/tiers`, `/breeding`, `/teams`, `/pals`, `/pals/[slug]` sample, `/map`, `sitemap.ts`, `robots.ts`, `lib/seo.ts`.
3. Run the checklist below.
4. Emit a **PASS** or **FAIL** report in the required format.
5. On FAIL: list concrete fixes ordered by impact; tell the user to re-run `paldex-growth` on that list.
6. On PASS: note residual risks / next SEO opportunities (optional, short).

## Checklist

### Technical

- [ ] Canonical via `pageMeta()` / `alternates.canonical`
- [ ] Unique title + description (not duplicate boilerplate across many pals)
- [ ] OG/Twitter present and sensible
- [ ] Route in `sitemap.ts` when indexable
- [ ] `robots.ts` does not block the route
- [ ] No accidental `noIndex` on money pages
- [ ] Client-only state that should be shareable uses URL params where claimed

### On-page / intent

- [ ] `<h1>` matches primary intent (tool query, not vague brand fluff alone on tool hubs)
- [ ] FAQ targets real queries (breeding calculator, tier list 1.0, map collectibles, etc.)
- [ ] JSON-LD matches visible content (WebApplication / FAQ / Breadcrumb as appropriate)
- [ ] Map included in positioning where relevant (not achievement-tracker language)

### Internal linking / depth

- [ ] Tool hubs link to related tools (CompanionTools or equivalent)
- [ ] Pal pages link to breeding / tiers / map / teams when data exists
- [ ] No orphan new indexable URL without inbound links from a hub

### Quality / anti-spam

- [ ] No thin doorway keyword pages
- [ ] No scraped / duplicated third-party guide text
- [ ] No mass AI guide farm
- [ ] Copy is EN-first and accurate to catalog

### Monetization adjacency (if ads touched)

- [ ] Ads follow `gaming-ad-monetization` (no hero ad, no covering primary controls)
- [ ] Consent gate exists before non-essential ads when claiming GDPR readiness

## Verdict rules

- **FAIL** if any Critical item fails, or ≥3 Major issues.
- **PASS with notes** if only Minor issues remain.
- **PASS** if checklist clear for the batch scope.

### Severity

| Level | Examples |
| --- | --- |
| Critical | Money URL missing from sitemap; noindex on hub; broken canonical; achievement-tracker IA shipped by mistake |
| Major | Duplicate titles across pals; missing FAQ on breeding/tiers; map live but not linked from home/nav; no cross-links on pal pages |
| Minor | Wording polish; optional Bing; slightly weak OG alt |

## Required report format

```markdown
## SEO review — [batch name]

**Verdict:** PASS | PASS with notes | FAIL

### Scope
- Routes/files: …

### Findings
| Sev | Issue | Where | Fix |
| --- | --- | --- | --- |
| Critical/Major/Minor | … | path | concrete action |

### Handback (if FAIL)
Re-run **paldex-growth** on:
1. …
2. …

### Residual / next (if PASS)
- …
```

## Anti-patterns

- Rewriting the product into an achievement tracker
- Approving thin content because “more pages = more SEO”
- Implementing large fixes in the review session without user asking
- Vague feedback (“improve SEO”) — always name file + change
