import type {
  EffectTag,
  Pal,
  PalElement,
  PalRarity,
  PalWork,
  WorkSuitabilityId,
} from "@/lib/teams/types";
import { EFFECT_TAG_LABELS, WORK_LABELS, WORK_ORDER } from "@/lib/teams/types";

export type PalFilters = {
  q?: string;
  element?: PalElement | "all";
  rarity?: PalRarity | "all";
  effectTag?: EffectTag | "all";
  work?: WorkSuitabilityId | "all";
  /** Minimum level for `work` filter (default 1). */
  workMin?: number;
};

export function filterPals(palsList: Pal[], filters: PalFilters): Pal[] {
  const q = filters.q?.trim().toLowerCase() ?? "";
  const workMin = filters.workMin && filters.workMin > 0 ? filters.workMin : 1;
  return palsList.filter((p) => {
    if (q) {
      const hay = `${p.name} ${p.slug} ${p.partnerSkill.name} ${p.partnerSkill.description}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    if (filters.element && filters.element !== "all") {
      if (!p.elements.includes(filters.element)) return false;
    }
    if (filters.rarity && filters.rarity !== "all") {
      if (p.rarity !== filters.rarity) return false;
    }
    if (filters.effectTag && filters.effectTag !== "all") {
      if (!p.partnerSkill.tags.includes(filters.effectTag)) return false;
    }
    if (filters.work && filters.work !== "all") {
      const level = p.work?.[filters.work] ?? 0;
      if (level < workMin) return false;
    }
    return true;
  });
}

export type PalSort =
  | "name"
  | "dex"
  | "rarity"
  | "tier"
  | "work"
  | "hp"
  | "melee"
  | "shot"
  | "atk"
  | "defense"
  | "combi";

const RARITY_RANK: Record<PalRarity, number> = {
  legendary: 0,
  epic: 1,
  rare: 2,
  common: 3,
};

export function topWorks(
  work: PalWork | undefined,
  limit = 3,
): { id: WorkSuitabilityId; level: number }[] {
  if (!work) return [];
  return WORK_ORDER.filter((id) => (work[id] ?? 0) > 0)
    .map((id) => ({ id, level: work[id]! }))
    .sort((a, b) => b.level - a.level || a.id.localeCompare(b.id))
    .slice(0, limit);
}

export function sortPals(
  palsList: Pal[],
  sort: PalSort = "name",
  workFocus?: WorkSuitabilityId | "all",
): Pal[] {
  const next = [...palsList];
  next.sort((a, b) => {
    if (sort === "dex") {
      const da = a.dexNo ?? a.breeding?.index ?? 9999;
      const db = b.dexNo ?? b.breeding?.index ?? 9999;
      if (da !== db) return da - db;
    }
    if (sort === "rarity") {
      const ra = RARITY_RANK[a.rarity];
      const rb = RARITY_RANK[b.rarity];
      if (ra !== rb) return ra - rb;
    }
    if (sort === "work") {
      if (workFocus && workFocus !== "all") {
        const wa = a.work?.[workFocus] ?? 0;
        const wb = b.work?.[workFocus] ?? 0;
        if (wa !== wb) return wb - wa;
      } else {
        const wa = topWorks(a.work, 1)[0]?.level ?? 0;
        const wb = topWorks(b.work, 1)[0]?.level ?? 0;
        if (wa !== wb) return wb - wa;
      }
    }
    if (sort === "hp" || sort === "melee" || sort === "shot" || sort === "defense") {
      const sa = a.stats?.[sort] ?? 0;
      const sb = b.stats?.[sort] ?? 0;
      if (sa !== sb) return sb - sa;
    }
    if (sort === "atk") {
      const sa = Math.max(a.stats?.melee ?? 0, a.stats?.shot ?? 0);
      const sb = Math.max(b.stats?.melee ?? 0, b.stats?.shot ?? 0);
      if (sa !== sb) return sb - sa;
    }
    if (sort === "combi") {
      const ra = a.breeding?.combiRank ?? 99999;
      const rb = b.breeding?.combiRank ?? 99999;
      if (ra !== rb) return ra - rb;
    }
    return a.name.localeCompare(b.name);
  });
  return next;
}

export function parsePalSort(value: string | null | undefined): PalSort {
  if (
    value === "dex" ||
    value === "rarity" ||
    value === "tier" ||
    value === "name" ||
    value === "work" ||
    value === "hp" ||
    value === "melee" ||
    value === "shot" ||
    value === "atk" ||
    value === "defense" ||
    value === "combi"
  ) {
    return value;
  }
  return "name";
}

export function parseWorkId(value: string | null | undefined): WorkSuitabilityId | "all" {
  if (value && value in WORK_LABELS) return value as WorkSuitabilityId;
  return "all";
}

export function getWorkOptions(): { id: WorkSuitabilityId | "all"; label: string }[] {
  return [
    { id: "all", label: "All work" },
    ...WORK_ORDER.map((id) => ({ id, label: WORK_LABELS[id] })),
  ];
}

export function getEffectTagOptions(): { id: EffectTag | "all"; label: string }[] {
  return [
    { id: "all", label: "All effects" },
    ...(Object.keys(EFFECT_TAG_LABELS) as EffectTag[]).map((id) => ({
      id,
      label: EFFECT_TAG_LABELS[id],
    })),
  ];
}
