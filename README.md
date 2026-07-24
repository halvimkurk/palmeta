# Palmeta

Unofficial Palworld 1.0 toolkit: role tier lists, a breeding calculator, and a
party builder built on a curated pal catalog (stats, work suitability, partner
skills).

Built with Next.js 15 (App Router), React 19, Tailwind 4, and Zustand.

## Develop

```bash
pnpm install
pnpm dev        # http://localhost:3000
pnpm test       # vitest
pnpm build      # production build
```

## Data pipeline

Catalog JSON lives in `data/catalog/`. Regeneration scripts (optional, only
when refreshing data):

```bash
pnpm pals        # rebuild pals catalog
pnpm pals:work   # merge work suitability
pnpm pals:stats  # merge combat stats
pnpm icons:pals  # download pal portraits
pnpm news        # ingest news briefs
```

Palmeta is a fan project and is not affiliated with Pocketpair.
