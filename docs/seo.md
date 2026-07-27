# SEO

Palmeta SEO targets **high-intent Palworld tool queries**, not broad “Palworld wiki” traffic.

## Positioning

Win long-tail tool SERPs first:

| Intent | Primary URL | Example queries |
| --- | --- | --- |
| Tier list | `/tiers` | palworld tier list 1.0, best combat pals |
| Breeding | `/breeding` | palworld breeding calculator, find parents |
| Teams | `/teams` | palworld team builder, meta comps |
| Paldeck | `/pals`, `/pals/[slug]` | [pal] palworld stats, work suitability |
| Map | `/map` | palworld map alphas, effigies, notes, fast travel |

Guides/articles are deferred until tools are stable; hubs ship FAQ + JSON-LD for snippets.

Agent loop: `palmeta-growth` implements SEO/polish → `palmeta-seo-review` PASS/FAIL → growth fixes. Backlog: `.cursor/plans/growth-backlog.md`.

## Shipped on site

- `robots.ts` + `sitemap.ts` (hubs, all pals, news, blues)
- Canonicals + OG/Twitter via `pageMeta()`
- `/opengraph-image` share card
- WebSite / WebApplication / FAQ / Article / Breadcrumb JSON-LD
- Keyword-aware titles/descriptions on hubs and pal pages
- Indexable FAQ blocks on home + tool hubs
- Home `<h1>` for brand query coverage

## After deploy

1. Google Search Console → property `https://palmeta.app` → submit `https://palmeta.app/sitemap.xml`
2. Bing Webmaster (optional) same sitemap
3. Verify OG: https://www.opengraph.xyz/url/https://palmeta.app/
4. Patch-day routine: update tiers/presets within 24–48h (live-service SEO advantage)
5. Later: pillar guides that link back into tools (not before catalog/tools are stable)

## Do not chase yet

- Head terms like “Palworld” alone (Fandom/Steam own them)
- Thin doorway pages for every keyword variant
- Mass AI guide spam
