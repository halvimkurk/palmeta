# Palpletion — Local preview & UX/UI review

**Date:** 2026-07-13  
**Spec:** `tracker-ux`, `palworld-tracker-product`, `gaming-ad-monetization`, `mvp-plan.md`  
**URL:** http://localhost:3000

---

## How to run locally

```bash
pnpm install   # once
pnpm dev
```

Open **http://localhost:3000**. No domain, Steam keys, or AdSense required.

Optional: `pnpm build` / `pnpm exec tsc --noEmit` for a typecheck.

---

## Guest mock — how to poke the product

| Action | How |
| --- | --- |
| Mark complete | Checkbox on list/detail rows → saved in `localStorage` key `palpletion-progress-v1` |
| Filters | Missing (default) / All / Done chips; category chips; Update select |
| Search | Click search or press `/` |
| Spoilers | “Show spoilers (1.0 story)” — blurred titles stay listed under Missing |
| Pin categories | Hub **Pin** (≤9); pinned strip appears above Categories |
| Sync modal | Header **Sync**, hub **Connect Steam**, or `/sync` — Steam returns **503** without API keys (expected) |
| Ads + consent | Placeholder `AdSlot`s; consent banner writes `palpletion-consent-v1`. Decline = tracker still works |
| Mobile anchor | Sticky bottom unit; **Hide** collapses so checkboxes stay reachable |

Reset progress: DevTools → Application → Local Storage → delete `palpletion-progress-v1` (and optionally consent/anchor keys).

---

## Review verdict

Hub composition, Missing-first IA, Outfit/Source Sans, and Palpagos teal atmosphere match the TZ. Main gaps were **progress hydration flash**, **mobile ad covering thumb-zone checkboxes**, **noisy placeholder ads**, **weak category progress affordance**, and **detail prev/next when the current item is already done**.

---

## Punch list

### P0 — usability blockers

| ID | Issue | Where | Status |
| --- | --- | --- | --- |
| P0-1 | Progress shows `0%` until zustand persist hydrates | `HubClient`, store | **Fixed** — `useProgressHydrated`, pending copy |
| P0-2 | Mobile sticky ad covers bottom checkboxes | `layout`, anchor CSS | **Fixed** — collapsible `MobileAnchorAd` + shell padding |
| P0-3 | Detail prev/next jumps oddly when current is complete | `AchievementDetailClient` | **Fixed** — “Next missing” / all-clear CTAs |
| P0-4 | In-list ad placeholders at 250px drown the checklist | `AdSlot`, inventory | **Fixed** — compact placeholder heights while ads off |

### P1 — high-impact polish

| ID | Issue | Where | Status |
| --- | --- | --- | --- |
| P1-1 | Filter `setParam` tangled; search `replace` every keystroke | `AchievementListClient` | **Fixed** — clean URL builder + 180ms debounce |
| P1-2 | Category rows: count only, no visual progress | `HubClient` + CSS | **Fixed** — mini bar per row |
| P1-3 | Ghost CTA low contrast on hero atmosphere | `.btn--on-dark` | **Fixed** |
| P1-4 | Empty Missing state thin | list empty UI | **Fixed** — celebrate + next category / hub |
| P1-5 | Spoiler affordance unclear | list/detail labels + `tag-spoiler` | **Fixed** |
| P1-6 | Consent banner can flash before hydrate | `ConsentBanner` | **Fixed** |
| P1-7 | Misleading “Hover pin on desktop” copy | hub lead | **Fixed** |
| P1-8 | Done state color-only | `.ach-row.is-done` | **Fixed** — strikethrough + opacity |

### P2 — later

| ID | Issue | Notes |
| --- | --- | --- |
| P2-1 | Category chips eat mobile first screen | Collapse into “More filters” per TZ |
| P2-2 | Solid gradient icon placeholders | Real Steam icons when assets ready |
| P2-3 | `j`/`k` row navigation | Optional per tracker-ux |
| P2-4 | Sticky filters on long lists | Keep status + search sticky |
| P2-5 | Pin from category page | Hub pin works; category page pin CTA still light |
| P2-6 | Live region for progress % | Partial (`aria-live` on hub); expand |
| P2-7 | Skeleton rows vs “Restoring…” text | Upgrade to row skeletons |
| P2-8 | Real AdSense CLS budgets | Keep full `minHeight` when `NEXT_PUBLIC_ADS_ENABLED=true` |

---

## What we fixed in this pass

1. Hydration-safe progress (hub + list gate + consent).
2. Collapsible mobile anchor ad; extra bottom padding on mobile shell.
3. Compact ad placeholders for local poke.
4. Detail navigation for complete / empty-missing cases.
5. URL filter sync cleanup + debounced search + safer `/` focus.
6. Category progress bars; hero CTA contrast; empty 100% CTAs; spoiler labels; done strikethrough; focus-visible rings.

---

## Quick QA checklist

- [ ] Hub does not flash `0%` after a reload with saved progress
- [ ] Mark 3 achievements → refresh → still checked
- [ ] Mobile: Hide anchor → last row checkbox reachable
- [ ] `/` focuses search; typing updates `?q=` after a short pause
- [ ] Complete an achievement on detail → **Next missing:** points at a real incomplete item
- [ ] `/sync` without Steam keys → expected failure/503, guest path still works
