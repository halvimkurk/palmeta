# SEO

ThePaldex SEO targets **high-intent Palworld tool queries**, not broad “Palworld wiki” traffic.

## Positioning

Win long-tail tool SERPs first:

| Intent | Primary URL | Example queries |
| --- | --- | --- |
| Tier list | `/tiers` | palworld tier list 1.0, best combat pals |
| Breeding | `/breeding` | palworld breeding calculator, find parents |
| Teams | `/teams` | palworld team builder, meta comps |
| Paldeck | `/pals`, `/pals/[slug]` | [pal] palworld stats, work suitability |
| Map | `/map` | palworld map alphas, effigies, notes, fast travel |

Guides/articles ship as **session chapters** that link into tools (`/guides`). Prefer tool SERPs first; pillars support long-tail how-to without becoming a wiki farm.

Agent loop: `paldex-growth` implements SEO/polish → `paldex-seo-review` PASS/FAIL → growth fixes. Backlog: `.cursor/plans/growth-backlog.md`.

## Shipped on site

- `robots.ts` + `sitemap.ts` (hubs, all pals, news, blues)
- Canonicals + OG/Twitter via `pageMeta()`
- `/opengraph-image` share card
- WebSite / WebApplication / FAQ / Article / Breadcrumb JSON-LD
- Keyword-aware titles/descriptions on hubs and pal pages
- Indexable FAQ blocks on home + tool hubs
- Home `<h1>` for brand query coverage

## After deploy

**Deferred until domain is registered:** GSC, Bing, request indexing, live OG checks.

When `thepaldex.com` is live:

1. Google Search Console → property → submit `https://<domain>/sitemap.xml`
2. Bing Webmaster (optional) same sitemap
3. Verify OG: https://www.opengraph.xyz/url/https://<domain>/
4. Patch-day routine: update tiers/presets within 24–48h (live-service SEO advantage)
5. Pillar guides that link back into tools (`/guides`, session depth)

**Ads:** not in scope until user approves. Privacy policy currently says no ads — keep in sync when that changes.

## Do not chase yet

- Head terms like “Palworld” alone (Fandom/Steam own them)
- Thin doorway pages for every keyword variant
- Mass AI guide spam
