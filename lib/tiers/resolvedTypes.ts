import type { Pal } from "@/lib/teams/types";
import type { TierEntry, TierGrade, TierRole } from "@/lib/tiers/types";

export type ResolvedTierEntry = TierEntry & {
  pal: Pal;
  grade: TierGrade;
};

export type ResolvedTierList = {
  role: TierRole;
  label: string;
  description: string;
  bands: { grade: TierGrade; entries: ResolvedTierEntry[] }[];
  missingSlugs: string[];
};
