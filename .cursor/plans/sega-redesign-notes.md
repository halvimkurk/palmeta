# Sega / Dreamcast redesign notes

Date: 2026-07-13

## Visual direction

- **Accent:** Dreamcast orange `#FF6A00` (hot `#FF8A33`)
- **Panels:** clean white / off-white `#FFFFFF` / `#F7F4EF` on chalk paper `#F4F1EC`
- **Structure:** deep charcoal `#141414` thick borders + chunky offset shadows
- **Secondary:** Sega blue `#0055A5` on progress fills, raid icon frames, chip hover
- **Motifs:** CSS conic “swirl” orb in hero (original — no SEGA/Dreamcast logos)
- **Fonts:** Fredoka (display) + Nunito (body) via `next/font` — rounded playful tech, not Inter/Outfit/lime SaaS

## UX preserved

- Missing-first filters, large checkboxes, shareable query params
- Ads stay out of first-viewport hero CTA; in-list ads lazy-loaded
- Hydration / Restoring fix left intact (SSR-safe Zustand persist)

## Guides

- Original `guideSteps` rewrites for all 75 achievements (`scripts/expand-guides.mjs`)
- `guideWip: true` on 9 newer/1.0-path items (Sunreach, Panthalus, Astralym, World Tree, mutation/awakening, arena legend, some effigy routes)
- New `/guides` index linking categories + featured detail pages

## Performance

- `next/image` sizes tuned for 48px list icons; priority only first ~6 rows
- `LazyAdSlot` dynamic import for below-fold / list ads
- Image formats AVIF/WebP + smaller `imageSizes` in `next.config.ts`

## Verify

- Open http://localhost:3000/achievements?status=missing — expect full incomplete list for a guest
- Hub hero should read orange/charcoal Dreamcast splash, not lime forest
- Desktop: sticky charcoal sidebar (Missing / categories / updates / guides / sync)
- Mobile: Menu hamburger → drawer (Esc closes)

## Follow-up research

See `ux-ui-research.md` for live QA findings and checklist.
