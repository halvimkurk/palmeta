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

function articleBefore(word: string): string {
  return /^[aeiou]/i.test(word) ? "an" : "a";
}

function lowercaseFirst(text: string): string {
  if (!text) return text;
  return text.charAt(0).toLowerCase() + text.slice(1);
}

/** Prefer the human label after an em dash (e.g. "Mining 7 — hauler" → "hauler"). */
function summarizeWhy(why: string): string {
  const dash = why.indexOf(" — ");
  if (dash >= 0) return why.slice(dash + 3).trim();
  return why.trim();
}

function joinOr(items: string[]): string {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0]!;
  if (items.length === 2) return `${items[0]} or ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, or ${items[items.length - 1]}`;
}

function usePhraseFromTier(t: PalTierHit): string {
  const gist = lowercaseFirst(summarizeWhy(t.why));
  switch (t.role) {
    case "workers":
      return `on base as a ${gist}`;
    case "ground-mounts":
      return `as a ${gist}`;
    case "flying-mounts":
      return `as a ${gist}`;
    case "catching":
      return `when catching pals (${gist})`;
    default:
      return gist;
  }
}

function partnerSkillSentence(name: string, description: string): string {
  const desc = description.replace(/\.$/, "").trim();
  if (desc.includes(" — ")) {
    const [lead, tail] = desc.split(" — ", 2);
    return `Its partner skill, ${name}, ${lowercaseFirst(lead!)} — ${lowercaseFirst(tail ?? "")}.`;
  }
  return `Its partner skill, ${name}, ${lowercaseFirst(desc)}.`;
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

/** Visible intro — short prose summary above the stat panels. */
export function buildPalSeoIntro(pal: Pal, tiers: PalTierHit[]): string {
  const elements = elementsLabel(pal);
  const rarity = RARITY_LABELS[pal.rarity].toLowerCase();
  const combat = combatTier(tiers);
  const work = topWork(pal);
  const otherTiers = tiers
    .filter((t) => t.role !== "combat")
    .sort((a, b) => gradeRank(a.grade) - gradeRank(b.grade))
    .slice(0, 2);

  const sentences: string[] = [];

  if (combat) {
    sentences.push(
      `${pal.name} is ${articleBefore(rarity)} ${rarity} ${elements} pal and ${articleBefore(combat.why)} ${lowercaseFirst(combat.why)}.`,
    );
  } else {
    const lead = otherTiers[0];
    const hook = lead
      ? `, often picked for ${lowercaseFirst(summarizeWhy(lead.why))}`
      : "";
    sentences.push(`${pal.name} is ${articleBefore(rarity)} ${rarity} ${elements} pal${hook}.`);
  }

  const uses = otherTiers.map(usePhraseFromTier);
  if (uses.length > 0) {
    sentences.push(`Players usually reach for it ${joinOr(uses)}.`);
  } else if (work) {
    sentences.push(
      `On base it shines at ${WORK_LABELS[work.id].toLowerCase()} (level ${work.level}).`,
    );
  } else if (!combat && tiers.length > 0) {
    const best = bestTierHit(tiers);
    if (best) {
      sentences.push(
        `It's a ${best.grade.toLowerCase()}-tier pick for ${best.label.toLowerCase()} — ${lowercaseFirst(summarizeWhy(best.why))}.`,
      );
    }
  }

  sentences.push(partnerSkillSentence(pal.partnerSkill.name, pal.partnerSkill.description));

  sentences.push(
    pal.breeding?.ignoreCombi
      ? "See the breeding section below for capture-only and unique combo notes."
      : "Use the breeding calculator below to find parent pairs.",
  );

  return sentences.join(" ");
}

/** JSON-LD / OG text — fuller than partner-skill line alone. */
export function buildPalStructuredDescription(pal: Pal, tiers: PalTierHit[]): string {
  return truncate(buildPalPageDescription(pal, tiers), 500);
}
