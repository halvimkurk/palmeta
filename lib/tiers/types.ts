export type TierGrade = "S" | "A" | "B" | "C" | "D";

export type TierRole =
  | "combat"
  | "workers"
  | "flying-mounts"
  | "ground-mounts"
  | "catching";

export type TierEntry = {
  slug: string;
  /** One-line reason — always shown (unlike icon-only lists). */
  why: string;
};

export type TierBand = {
  grade: TierGrade;
  pals: TierEntry[];
};

export type TierList = {
  role: TierRole;
  label: string;
  description: string;
  bands: TierBand[];
};

export type TiersCatalog = {
  version: number;
  updatedAt: string;
  disclaimer: string;
  lists: TierList[];
};

export const TIER_ROLE_ORDER: TierRole[] = [
  "combat",
  "workers",
  "flying-mounts",
  "ground-mounts",
  "catching",
];

export const TIER_GRADE_ORDER: TierGrade[] = ["S", "A", "B", "C", "D"];
