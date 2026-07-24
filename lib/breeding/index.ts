import "server-only";

import {
  findParentsForChildWithCatalog,
  getUniqueCombosForPalFromMeta,
  predictOffspringWithCatalog,
  type BreedResult,
  type ParentPair,
  type UniqueCombo,
} from "@/lib/breeding/engine";
import { getBreedingMeta, getPals } from "@/lib/teams/catalog";

export type { BreedResult, ParentPair, UniqueCombo };
export {
  findParentsForChildWithCatalog,
  getUniqueCombosForPalFromMeta,
  predictOffspringWithCatalog,
} from "@/lib/breeding/engine";

export function predictOffspring(parentA: string, parentB: string): BreedResult {
  return predictOffspringWithCatalog(
    getPals(),
    getBreedingMeta().uniqueCombos,
    parentA,
    parentB,
  );
}

export function findParentsForChild(childSlug: string, limit = 24): ParentPair[] {
  return findParentsForChildWithCatalog(
    getPals(),
    getBreedingMeta().uniqueCombos,
    childSlug,
    limit,
  );
}

export function getUniqueCombosForPal(slug: string) {
  return getUniqueCombosForPalFromMeta(getBreedingMeta().uniqueCombos, slug);
}
