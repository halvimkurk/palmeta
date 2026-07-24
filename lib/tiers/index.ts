import tiersJson from "@/data/catalog/tiers.v1.json";
import {
  TIER_ROLE_ORDER,
  type TierGrade,
  type TierList,
  type TierRole,
  type TiersCatalog,
} from "@/lib/tiers/types";

const catalog = tiersJson as TiersCatalog;

export function getTiersCatalog(): TiersCatalog {
  return catalog;
}

export function getTierLists(): TierList[] {
  return [...catalog.lists].sort(
    (a, b) => TIER_ROLE_ORDER.indexOf(a.role) - TIER_ROLE_ORDER.indexOf(b.role),
  );
}

export function getTierList(role: TierRole): TierList | undefined {
  return catalog.lists.find((l) => l.role === role);
}

export function parseTierRole(value: string | null | undefined): TierRole {
  if (value && (TIER_ROLE_ORDER as string[]).includes(value)) {
    return value as TierRole;
  }
  return "combat";
}

export function findPalTiers(
  slug: string,
): { role: TierRole; label: string; grade: TierGrade; why: string }[] {
  const hits: { role: TierRole; label: string; grade: TierGrade; why: string }[] = [];
  for (const list of catalog.lists) {
    for (const band of list.bands) {
      const entry = band.pals.find((p) => p.slug === slug);
      if (entry) {
        hits.push({
          role: list.role,
          label: list.label,
          grade: band.grade,
          why: entry.why,
        });
      }
    }
  }
  return hits;
}

/** Combat grade map for list sorting — safe to serialize to the client. */
export function getCombatGradeBySlug(): Record<string, TierGrade> {
  const out: Record<string, TierGrade> = {};
  const combat = catalog.lists.find((l) => l.role === "combat");
  if (!combat) return out;
  for (const band of combat.bands) {
    for (const entry of band.pals) {
      out[entry.slug] = band.grade;
    }
  }
  return out;
}

export * from "@/lib/tiers/types";
