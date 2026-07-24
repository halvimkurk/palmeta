---
name: gaming-ad-monetization
description: >-
  Ad placement and monetization rules for this Palworld gaming tracker site.
  Use when laying out pages, adding ad slots, choosing networks, tuning
  Core Web Vitals vs revenue, or reviewing UX impact of ads.
---

# Gaming Ad Monetization

## Business model

Free tracker funded by display ads. Core checklist stays free forever.

Gaming vertical lesson ([Playwire 2026](https://www.playwire.com/blog/publisher-revenue-optimization-by-vertical-how-to-maximize-ad-revenue-in-your-vertical)):

- Optimize **impressions per session**, not vanity CPM.
- Drive **page depth** (hub → category → detail → next missing).
- Aggressive price floors often **lower** session revenue via bad fill.

## Network ladder

| Stage | Traffic | Network |
| --- | --- | --- |
| Launch | Low | Google AdSense (or equivalent lightweight) |
| Growth | Mid | Ezoic-class / compare offers |
| Scale | High | Playwire / Mediavine / Raptive when eligible |

Do not hard-code a premium network before eligibility. Abstract ad slots behind a `AdSlot` component with placement IDs.

## Placement inventory (tracker-shaped)

Allowed slots (name consistently):

| ID | Where | Notes |
| --- | --- | --- |
| `leaderboard_top` | Below hub header, **after** progress CTA | Never above brand + primary CTA |
| `incontent_1` | After ~8–10 list rows | Insert between rows, not mid-title |
| `sidebar_desktop` | Desktop category pages only | Sticky optional; stop before footer |
| `incontent_detail` | Achievement detail after steps 1–2 | Keep steps readable |
| `anchor_mobile` | Mobile sticky bottom | Collapsible; don’t cover checkboxes |
| `footer_board` | Pre-footer | Low risk |

Hard rules:

1. **No ads in the first viewport hero** on marketing/hub first paint.
2. **No ad between checkbox and label** — destroys usability.
3. Max **1 sticky** unit at a time on mobile.
4. Prefer in-content + depth over stacking 3 above-the-fold units.
5. Lazy-load ads below the fold; protect LCP/INP/CLS.

## UX–revenue balance

Good: user finishes a toggle → scrolls → natural in-content impression → opens next achievement (new pageview).

Bad: interstitial before Missing list; layout shift on icon load; checkbox covered by anchor ad.

When in doubt, **cut an ad**, not a filter.

## SPA / soft navigation

If the app is client-routed:

- Refresh ads on route change per network policy.
- Don’t remount the whole checklist on ad refresh.
- Deduplicate slots so React strict mode doesn’t double-request.

## Compliance

- Cookie / consent banner where required (GDPR/UK/etc.) before non-essential ads.
- `ads.txt` + correct publisher IDs before traffic spikes.
- No misleading “download” ad near Steam connect buttons.
- Brand-safe: avoid adult/malware adjacency; gaming content is generally fine.

## Measurement

Track alongside analytics:

- Pageviews / session
- Impressions / session
- Bounce on hub and detail
- CLS / LCP budgets (fail build if ads break CLS badly)
- RPM as secondary; depth first

## Implementation checklist

- [ ] `AdSlot` component with `placementId`, `sizes`, `platform`
- [ ] Slots documented in one inventory file
- [ ] Consent gate wired
- [ ] `ads.txt` / robots allow ads crawlers as needed
- [ ] Manual QA: toggle achievements with anchor ad visible on a small phone
