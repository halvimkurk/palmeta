import type { Pal } from "@/lib/teams/types";
import { ELEMENT_LABELS, RARITY_LABELS, WORK_LABELS, WORK_ORDER } from "@/lib/teams/types";
import type { TierGrade, TierRole } from "@/lib/tiers/types";

export type PalTierHit = {
  role: TierRole;
  label: string;
  grade: TierGrade;
  why: string;
};

/** High-search Paldeck pages — combat S, worker staples, popular breeding targets. */
export const TOP_PAL_SLUGS: readonly string[] = [
  "jetragon",
  "bellanoir-libero",
  "frostallion",
  "frostallion-noct",
  "jormuntide-ignis",
  "blazamut-ryu",
  "xenolord",
  "necromus",
  "paladius",
  "neptilius",
  "anubis",
  "shadowbeak",
  "orserk",
  "gobfin",
  "selyne",
  "lyleen",
  "lyleen-noct",
  "jormuntide",
  "astegon",
  "knocklem",
  "bastigor",
  "vixy",
  "blazamut",
  "bellanoir",
  "grizzbolt",
  "fenglope",
  "relaxaurus",
  "elizabee",
  "penking",
  "helzephyr-lux",
] as const;

const TOP_PAL_SET = new Set<string>(TOP_PAL_SLUGS);

export function isTopPalSlug(slug: string): boolean {
  return TOP_PAL_SET.has(slug);
}

function truncate(text: string, max: number): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > 40 ? cut.slice(0, lastSpace) : cut).trim()}…`;
}

function topWork(pal: Pal): { id: keyof typeof WORK_LABELS; level: number } | null {
  if (!pal.work) return null;
  const entries = WORK_ORDER.flatMap((id) => {
    const level = pal.work![id];
    return level != null && level > 0 ? [{ id, level }] : [];
  });
  if (entries.length === 0) return null;
  entries.sort((a, b) => b.level - a.level);
  return entries[0] ?? null;
}

function gradeRank(g: TierGrade): number {
  return { S: 0, A: 1, B: 2, C: 3, D: 4 }[g] ?? 9;
}

function bestTierHit(tiers: PalTierHit[]): PalTierHit | null {
  if (tiers.length === 0) return null;
  return [...tiers].sort((a, b) => gradeRank(a.grade) - gradeRank(b.grade))[0] ?? null;
}

function combatTier(tiers: PalTierHit[]): PalTierHit | undefined {
  return tiers.find((t) => t.role === "combat");
}

function elementsLabel(pal: Pal): string {
  return pal.elements.map((e) => ELEMENT_LABELS[e]).join(" / ");
}

/** Meta description — unique per pal from catalog facts, not a single boilerplate. */
export function buildPalPageDescription(pal: Pal, tiers: PalTierHit[]): string {
  const elements = elementsLabel(pal);
  const combat = combatTier(tiers);
  const work = topWork(pal);
  const chunks: string[] = [`${pal.name} (${elements}) — ${RARITY_LABELS[pal.rarity]} Palworld 1.0 pal sheet.`];

  if (combat) {
    chunks.push(`${combat.grade}-tier combat: ${combat.why}`);
  } else {
    const best = bestTierHit(tiers);
    if (best) chunks.push(`${best.grade}-tier ${best.label.toLowerCase()}: ${best.why}`);
  }

  if (work) {
    chunks.push(`Top work: ${WORK_LABELS[work.id]} ${work.level}.`);
  }

  chunks.push(`Partner skill “${pal.partnerSkill.name}”.`);

  if (pal.breeding?.ignoreCombi) {
    chunks.push("Not breedable from standard pairs — capture or unique combo.");
  } else {
    chunks.push("Stats, tiers, and breeding calculator links.");
  }

  return truncate(chunks.join(" "), 320);
}

/** Title — stronger intent phrasing on top-search pals. */
export function buildPalPageTitle(pal: Pal, tiers: PalTierHit[]): string {
  const combat = combatTier(tiers);
  if (isTopPalSlug(pal.slug) && combat) {
    return `${pal.name} Palworld — ${combat.grade} Combat Tier, Stats & Breeding`;
  }
  if (isTopPalSlug(pal.slug)) {
    const work = topWork(pal);
    if (work) {
      return `${pal.name} Palworld — ${WORK_LABELS[work.id]} ${work.level}, Stats & Breeding`;
    }
    return `${pal.name} Palworld — Stats, Work & Breeding`;
  }
  return `${pal.name} — Paldeck Stats & Breeding`;
}

/** Visible intro for top pals — indexable summary above the stat panels. */
export function buildPalSeoIntro(pal: Pal, tiers: PalTierHit[]): string | null {
  if (!isTopPalSlug(pal.slug)) return null;

  const elements = elementsLabel(pal);
  const combat = combatTier(tiers);
  const work = topWork(pal);
  const parts: string[] = [
    `${pal.name} is a ${RARITY_LABELS[pal.rarity].toLowerCase()} ${elements} pal in Palworld 1.0.`,
  ];

  if (combat) {
    parts.push(`Combat tier ${combat.grade}: ${combat.why}`);
  }

  const otherTiers = tiers
    .filter((t) => t.role !== "combat")
    .sort((a, b) => gradeRank(a.grade) - gradeRank(b.grade))
    .slice(0, 2);
  for (const t of otherTiers) {
    parts.push(`${t.label} ${t.grade}: ${t.why}`);
  }

  if (work) {
    parts.push(`Best base work on this sheet is ${WORK_LABELS[work.id]} level ${work.level}.`);
  }

  parts.push(
    `Partner skill ${pal.partnerSkill.name} — ${truncate(pal.partnerSkill.description, 140)}`,
  );

  if (pal.breeding?.ignoreCombi) {
    parts.push("Use the breeding section below for capture-only / unique combo notes.");
  } else {
    parts.push("Jump to the breeding calculator to find parent pairs for this pal.");
  }

  return parts.join(" ");
}

/** JSON-LD / OG text — fuller than partner-skill line alone. */
export function buildPalStructuredDescription(pal: Pal, tiers: PalTierHit[]): string {
  return truncate(buildPalPageDescription(pal, tiers), 500);
}
