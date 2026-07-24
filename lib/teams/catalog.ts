import "server-only";

import palsJson from "@/data/catalog/pals.v1.json";
import workJson from "@/data/catalog/pal-work.v1.json";
import statsJson from "@/data/catalog/pal-stats.v1.json";
import breedingJson from "@/data/catalog/pal-breeding.v1.json";
import type {
  Pal,
  PalBreeding,
  PalCombatStats,
  PalWork,
  PalsCatalog,
  TeamPreset,
} from "@/lib/teams/types";
import { getPresetById, getTeamPresets } from "@/lib/teams/presets";

type WorkCatalog = {
  version: number;
  updatedAt: string;
  pals: Record<string, PalWork>;
};

type StatsCatalog = {
  version: number;
  pals: Record<string, PalCombatStats>;
};

type BreedingCatalogFile = {
  version: number;
  formula: string;
  ranks: Record<string, PalBreeding>;
  uniqueCombos: { parents: [string, string] | string[]; child: string }[];
};

const catalog = palsJson as PalsCatalog;
const workBySlug = (workJson as WorkCatalog).pals;
const statsBySlug = (statsJson as StatsCatalog).pals;
const breedingFile = breedingJson as BreedingCatalogFile;

const pals: Pal[] = catalog.pals.map((p) => {
  const work = workBySlug[p.slug];
  const stats = statsBySlug[p.slug];
  const breeding = breedingFile.ranks[p.slug];
  return {
    ...p,
    ...(work ? { work } : {}),
    ...(stats ? { stats } : {}),
    ...(breeding ? { breeding } : {}),
  };
});

const bySlug = new Map(pals.map((p) => [p.slug, p]));

export function getPalsCatalog(): PalsCatalog {
  return { ...catalog, pals };
}

export function getPals(): Pal[] {
  return pals;
}

export function getPalBySlug(slug: string): Pal | undefined {
  return bySlug.get(slug);
}

export function getBreedingMeta() {
  return {
    formula: breedingFile.formula,
    uniqueCombos: breedingFile.uniqueCombos,
  };
}

export function resolveTeam(slugs: (string | null)[]): (Pal | null)[] {
  return slugs.map((s) => (s ? getPalBySlug(s) ?? null : null));
}

export function getPresetsForPal(slug: string): TeamPreset[] {
  return getTeamPresets().filter((p) => p.team.includes(slug));
}

export { getPresetById, getTeamPresets };
