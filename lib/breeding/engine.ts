import type { Pal } from "@/lib/teams/types";

export type UniqueCombo = {
  parents: [string, string] | string[];
  child: string;
};

export type BreedResult = {
  child: Pal | null;
  childSlug: string | null;
  kind: "unique" | "formula" | "unknown";
  targetRank?: number;
  note?: string;
};

export type ParentPair = {
  a: Pal;
  b: Pal;
  kind: "unique" | "formula";
};

function normPair(a: string, b: string): string {
  return [a, b].sort().join("+");
}

function uniqueMap(combos: UniqueCombo[]) {
  const map = new Map<string, string>();
  for (const c of combos) {
    const [p0, p1] = c.parents;
    if (!p0 || !p1) continue;
    map.set(normPair(p0, p1), c.child);
  }
  return map;
}

function formulaPool(pals: Pal[]): Pal[] {
  return pals.filter(
    (p) => p.breeding && !p.breeding.ignoreCombi && typeof p.breeding.combiRank === "number",
  );
}

function bySlugMap(pals: Pal[]) {
  return new Map(pals.map((p) => [p.slug, p]));
}

export function predictOffspringWithCatalog(
  pals: Pal[],
  uniqueCombos: UniqueCombo[],
  parentA: string,
  parentB: string,
): BreedResult {
  const bySlug = bySlugMap(pals);
  const a = bySlug.get(parentA);
  const b = bySlug.get(parentB);
  if (!a || !b) {
    return { child: null, childSlug: null, kind: "unknown", note: "Unknown parent in catalog." };
  }

  const uniqueChild = uniqueMap(uniqueCombos).get(normPair(parentA, parentB));
  if (uniqueChild) {
    return {
      child: bySlug.get(uniqueChild) ?? null,
      childSlug: uniqueChild,
      kind: "unique",
      note: "Unique combo override.",
    };
  }

  const rankA = a.breeding?.combiRank;
  const rankB = b.breeding?.combiRank;
  if (rankA == null || rankB == null) {
    return {
      child: null,
      childSlug: null,
      kind: "unknown",
      note: "This pair has no standard offspring — try a different parent.",
    };
  }

  const targetRank = Math.floor((rankA + rankB + 1) / 2);
  const pool = formulaPool(pals);
  if (pool.length === 0) {
    return { child: null, childSlug: null, kind: "unknown", note: "No breeding pool.", targetRank };
  }

  let best: Pal | null = null;
  let bestDist = Number.POSITIVE_INFINITY;
  let bestPri = Number.POSITIVE_INFINITY;

  for (const p of pool) {
    const rank = p.breeding!.combiRank;
    const dist = Math.abs(rank - targetRank);
    const pri = p.breeding!.combiPriority ?? rank * 100;
    if (dist < bestDist || (dist === bestDist && pri < bestPri)) {
      best = p;
      bestDist = dist;
      bestPri = pri;
    }
  }

  return {
    child: best,
    childSlug: best?.slug ?? null,
    kind: "formula",
    targetRank,
  };
}

export function findParentsForChildWithCatalog(
  pals: Pal[],
  uniqueCombos: UniqueCombo[],
  childSlug: string,
  limit = 24,
): ParentPair[] {
  const bySlug = bySlugMap(pals);
  const child = bySlug.get(childSlug);
  if (!child) return [];

  const out: ParentPair[] = [];
  const seen = new Set<string>();

  for (const combo of uniqueCombos) {
    if (combo.child !== childSlug) continue;
    const [p0, p1] = combo.parents;
    const a = bySlug.get(p0 ?? "");
    const b = bySlug.get(p1 ?? "");
    if (!a && !b) continue;
    if (a && b) {
      const key = normPair(a.slug, b.slug);
      if (!seen.has(key)) {
        seen.add(key);
        out.push({ a, b, kind: "unique" });
      }
    }
  }

  const pool = formulaPool(pals).filter((p) => p.slug !== childSlug);
  for (let i = 0; i < pool.length && out.length < limit; i++) {
    for (let j = i; j < pool.length && out.length < limit; j++) {
      const a = pool[i]!;
      const b = pool[j]!;
      const result = predictOffspringWithCatalog(pals, uniqueCombos, a.slug, b.slug);
      if (result.childSlug === childSlug && result.kind === "formula") {
        const key = normPair(a.slug, b.slug);
        if (seen.has(key)) continue;
        seen.add(key);
        out.push({ a, b, kind: "formula" });
      }
    }
  }

  return out.slice(0, limit);
}

export function getUniqueCombosForPalFromMeta(uniqueCombos: UniqueCombo[], slug: string) {
  return uniqueCombos.filter((c) => c.child === slug || c.parents.includes(slug));
}
