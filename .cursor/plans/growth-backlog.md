# Palmeta growth backlog

Goal: organic path to **~1M ad impressions** without paid ads.  
Agents: `palmeta-growth` (execute) → `palmeta-seo-review` (QA) → growth again on FAIL.  
Product: `palmeta-product`. **New features require user approval.**

Status legend: `todo` | `waiting-approval` | `in-progress` | `seo-review` | `done` | `blocked`

---

## Phase 0 — Launch readiness

| ID | Item | Type | Status | Notes |
| --- | --- | --- | --- | --- |
| P0-1 | Ship `/map` to production (remove `notFound`, mobile + found tracking + 4 modes) | feature | waiting-approval | Code exists; page currently 404s |
| P0-2 | Add Map card on home + nav + CompanionTools | polish | waiting-approval | Blocked on P0-1 |
| P0-3 | `AdSlot` + inventory + consent + `ads.txt` | feature | blocked | User: no ads for now |
| P0-4 | Apply AdSense after live domain + privacy | ops | blocked | User: no ads for now |
| P0-5 | GSC property + submit sitemap | ops | blocked | User: domain not registered yet |
| P0-6 | Update site tagline/home copy for live tools | seo | done | Map omitted until P0-1 |

## Phase 1 — Session depth loops

| ID | Item | Type | Status | Notes |
| --- | --- | --- | --- | --- |
| P1-1 | Breeding shareable URLs (`?a`/`?b`/`?child` write-back) | seo | done | PASS 2026-07-27 |
| P1-2 | Map deep links (`?mode=`, `?pal=`) + pal page links | seo | waiting-approval | Blocked on P0-1 |
| P1-3 | Pal detail → map / breeding / tiers / teams links | seo | done | Map link deferred; others live |
| P1-4 | CompanionTools on all tool hubs | seo | done | |
| P1-5 | Teams presets → pal detail links | seo | done | CompCard units → `/pals/[slug]` |

## Phase 2 — SEO growth

| ID | Item | Type | Status | Notes |
| --- | --- | --- | --- | --- |
| P2-1 | Strengthen `/breeding` + `/tiers` titles/FAQ for 1.0 intent | seo | done | All tool hubs + home h1/FAQ 2026-07-27 |
| P2-2 | `/map` FAQ + WebApplication JSON-LD + mode intent | seo | waiting-approval | Blocked on P0-1 |
| P2-3 | Top-30 pal pages: unique descriptions + complete modules | seo | done | `lib/seo/pal-meta.ts` + intro block 2026-07-27 |
| P2-4 | Patch-day routine doc (tiers/breeding within 24–48h) | ops | todo | |
| P2-5 | 3–5 pillar mini-guides linking into tools | feature | waiting-approval | Ask first |
| P2-6 | Home visible FAQ (match JSON-LD) | seo | done | PASS 2026-07-27 |

## Phase 3 — Distribution (no budget)

| ID | Item | Type | Status | Notes |
| --- | --- | --- | --- | --- |
| P3-1 | Draft Reddit post (one tool angle) | copy | todo | User posts |
| P3-2 | Steam guide draft linking breeding + tiers | copy | todo | User posts |
| P3-3 | Discord promo blurb (rules-safe) | copy | todo | User posts |

## Phase 4 — Scale

| ID | Item | Type | Status | Notes |
| --- | --- | --- | --- | --- |
| P4-1 | Weekly GSC → content fixes loop | ops | todo | |
| P4-2 | Upgrade ad network when eligible | feature | waiting-approval | Ask |

---

## Agent handoff log

### 2026-07-27 (batch 3)
- Growth: P2-3 — data-driven unique pal meta for all pages; top-30 intent titles + visible SEO intro; JSON-LD uses full description.
- Next: P3 distribution drafts or P2-4 patch-day doc.

### 2026-07-27 (batch 2)
- Growth: P2-1 — intent `<h1>` on all tool hubs; stronger titles/descriptions/FAQ; home h1 + 4th FAQ; layout OG/title refresh.
- SEO review: pending user-triggered recheck.
- Next: P2-3 top pal descriptions, or P3 distribution drafts.

### 2026-07-27
- Growth: started loop; baseline SEO review PASS with notes; fixed breeding URL write-back, home SeoFaq, CompCard → pal links, tagline refresh (no map claims).
- SEO review ([recheck](fdae73d2-7420-41d0-a8d4-81592e6092a2)): **PASS with notes** for batch.
- Waiting approval: **P0-1 ship map**, **P0-3 AdSlot**, P2-5 guides.
- Next: P2-1 (intent h1/FAQ) or user-approved map/ads.
