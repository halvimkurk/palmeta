import "server-only";

import { getPalBySlug } from "@/lib/teams/catalog";
import {
  TIER_GRADE_ORDER,
  type TierGrade,
  type TierList,
} from "@/lib/tiers/types";
import type { ResolvedTierEntry, ResolvedTierList } from "@/lib/tiers/resolvedTypes";

export type { ResolvedTierEntry, ResolvedTierList } from "@/lib/tiers/resolvedTypes";

export function resolveTierList(list: TierList): {
  bands: { grade: TierGrade; entries: ResolvedTierEntry[] }[];
  missingSlugs: string[];
} {
  const missingSlugs: string[] = [];
  const bands = [...list.bands]
    .sort((a, b) => TIER_GRADE_ORDER.indexOf(a.grade) - TIER_GRADE_ORDER.indexOf(b.grade))
    .map((band) => {
      const entries: ResolvedTierEntry[] = [];
      for (const entry of band.pals) {
        const pal = getPalBySlug(entry.slug);
        if (!pal) {
          missingSlugs.push(entry.slug);
          continue;
        }
        entries.push({ ...entry, pal, grade: band.grade });
      }
      return { grade: band.grade, entries };
    });
  return { bands, missingSlugs };
}

export function resolveAllTierLists(lists: TierList[]): ResolvedTierList[] {
  return lists.map((list) => {
    const { bands, missingSlugs } = resolveTierList(list);
    return {
      role: list.role,
      label: list.label,
      description: list.description,
      bands,
      missingSlugs,
    };
  });
}
