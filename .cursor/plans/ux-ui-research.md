# Palpletion — UX/UI research (live)

**Date:** 2026-07-13  
**URL tested:** http://localhost:3000  
**Skills:** `tracker-ux`, `palworld-tracker-product`, `gaming-ad-monetization`  
**Plans:** `mvp-plan.md`, `ux-review.md`, `sega-redesign-notes.md`

---

## Method

Browser MCP walk of hub → Missing list → category → detail → guides. Cross-check against Completionism-shaped IA (Missing-first, ≤3 clicks to a guide step) and ad rules (no ads in hero CTA band; never between checkbox and label).

---

## What’s working

| Area | Observation |
| --- | --- |
| Missing-first | Guest sees **0% / 75 missing**; list populates all incomplete rows (hydration fix holds) |
| Brand energy | Dreamcast orange + charcoal hero, “Press Start”, chunky chips — not lime SaaS |
| Toggle depth | Checkbox → localStorage → Missing count drops (page-depth friendly) |
| Spoilers | Story items listed but blurred until toggle |
| Ads | Placeholders only; mobile anchor has Hide |

---

## Friction found (priority)

### P0 — ship now

1. **No persistent nav for mid-session jumps** — top chips only; categories buried on hub. Completionists need a **sidebar** (desktop) / **drawer** (mobile): Missing, Categories, Updates, Guides, Sync.
2. **Top nav + hub categories duplicate IA** without a clear “cockpit rail” — first viewport is fine; secondary pages feel like starting over.
3. **Progress meta denseness** — `0%` and `0 / 75` can visually collide; needs clearer hierarchy / spacing.
4. **Mobile anchor still competes with thumb-zone** on short viewports even with Hide — keep padding + default collapsed after first Hide.

### P1 — polish

5. **Category chip wall on `/achievements`** — floods mobile filters; move category browsing into sidebar, keep Status + Search sticky on list.
6. **Guide steps are plain `<ol>`** — need numbered craft, Tip callouts, WIP honesty, spoiler gating already OK.
7. **Detail crumbs show raw `categorySlug`** — should show human category name.
8. **Hero is strong; list pages still “header + stack”** — sidebar gives composition continuity.
9. **Consent / ad chrome** — fine when declined; ensure no flash before hydrate (already gated).

### P2 — later

10. Sticky filter bar on long Missing lists  
11. `j`/`k` row nav  
12. Pin from category page  
13. Real AdSense CLS budgets  

---

## Creative direction (anti-AI)

Keep Dreamcast orange `#FF6A00`, white panels, charcoal borders. Push craft:

- Asymmetric swirl orb (CSS only) — already in hero; extend small swirl dots in sidebar brand mark  
- Offset chunky shadows, sharp corners (not soft SaaS radius soup)  
- Fredoka + Nunito — keep; avoid Inter/Outfit/purple gradients  
- 2–3 motions: swirl spin, pop-in sections, button press translate  

---

## Implementation plan (this pass)

1. `AppShell` with desktop sidebar + mobile hamburger drawer  
2. Guide detail typography + Tip callouts; expand tips in catalog where useful  
3. Bugfixes: crumb labels, progress meta spacing, filter density (categories in sidebar), Vitest for Missing default  
4. Research notes + QA checklist below  

---

## Manual QA checklist

- [ ] Guest `/achievements?status=missing` shows all incomplete (≈75 if empty progress)  
- [ ] No permanent “Restoring your checklist…”  
- [ ] **Desktop sidebar** links: Missing, categories, Updates, Guides, Sync  
- [ ] **Mobile hamburger** opens drawer; Esc / overlay closes  
- [ ] Checkbox toggle updates Missing count; Hide keeps anchor off checkboxes  
- [ ] `/` focuses search on list page  
- [ ] Spoiler achievements blur until toggle  
- [ ] Detail crumbs show category **name**; tip callouts render  
- [ ] Detail prev/next missing works  
- [ ] Icons render (48px list)  
- [ ] `pnpm build` passes  

### Shipped this pass

- AppShell sidebar + mobile drawer  
- Category chips collapsed under “More filters” (sidebar is primary)  
- Guide tip callouts + numbered step chrome  
- Research doc: this file  

---

## Monetization note

Sidebar increases **page depth** (hub → category → detail → next missing) without putting ads in the hero CTA band or between checkbox and label — aligns with `gaming-ad-monetization`.
