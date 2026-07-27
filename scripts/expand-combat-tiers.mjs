/**
 * Fill missing combat-tier grades for any catalog pal not already ranked.
 * Keeps all existing editorial placements; assigns C/D (and occasional B)
 * from combat stats + rarity for new roster entries.
 *
 * Run after import-full-roster.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const pals = JSON.parse(readFileSync(join(root, "data/catalog/pals.v1.json"), "utf8"));
const stats = JSON.parse(readFileSync(join(root, "data/catalog/pal-stats.v1.json"), "utf8"));
const tiersPath = join(root, "data/catalog/tiers.v1.json");
const tiers = JSON.parse(readFileSync(tiersPath, "utf8"));

function combatScore(slug) {
  const s = stats.pals[slug];
  if (!s) return 0;
  return (
    (s.shot ?? 0) * 1.25 +
    (s.melee ?? 0) +
    (s.defense ?? 0) * 0.35 +
    (s.hp ?? 0) * 0.06
  );
}

const combat = tiers.lists.find((l) => l.role === "combat");
if (!combat) {
  console.error("No combat list");
  process.exit(1);
}

const placed = new Set();
for (const band of combat.bands) {
  for (const e of band.pals) placed.add(e.slug);
}

const missing = pals.pals.filter((p) => !placed.has(p.slug));
const scored = missing
  .map((p) => ({
    slug: p.slug,
    name: p.name,
    rarity: p.rarity,
    score: combatScore(p.slug),
  }))
  .sort((a, b) => b.score - a.score);

const scores = scored.map((s) => s.score).filter((n) => n > 0).sort((a, b) => a - b);
const pct = (p) => {
  if (!scores.length) return 0;
  const i = Math.min(scores.length - 1, Math.floor((p / 100) * scores.length));
  return scores[i];
};
const p85 = pct(85);
const p60 = pct(60);
const p30 = pct(30);

function gradeFor(entry) {
  if (entry.rarity === "legendary" && entry.score >= p60) return "B";
  if (entry.rarity === "legendary") return "C";
  if (entry.score >= p85 && (entry.rarity === "epic" || entry.rarity === "legendary"))
    return "B";
  if (entry.score >= p60) return "C";
  if (entry.score >= p30) return "D";
  return "D";
}

const whyFor = {
  B: "Roster expand — strong combat stats among unranked 1.0 pals (review later)",
  C: "Roster expand — mid combat stats; usable filler until editorial pass",
  D: "Roster expand — lower combat priority vs ranked meta",
};

/** @type {Record<string, { slug: string; why: string }[]>} */
const add = { S: [], A: [], B: [], C: [], D: [] };
for (const e of scored) {
  const g = gradeFor(e);
  add[g].push({ slug: e.slug, why: whyFor[g] });
}

for (const band of combat.bands) {
  const extra = add[band.grade] ?? [];
  if (!extra.length) continue;
  const have = new Set(band.pals.map((p) => p.slug));
  for (const e of extra) {
    if (!have.has(e.slug)) band.pals.push(e);
  }
  band.pals.sort((a, b) => a.slug.localeCompare(b.slug));
}

tiers.version = Math.max(tiers.version ?? 3, 4);
tiers.updatedAt = new Date().toISOString().slice(0, 10);
tiers.disclaimer =
  "Community ranking for Palworld 1.0 — editorial S–A bands plus stats-based fill for the full Paldex. New roster entries marked “Roster expand” need a human pass.";

writeFileSync(tiersPath, JSON.stringify(tiers, null, 2) + "\n");

console.log(
  `Combat fill: missing=${missing.length} → B=${add.B.length} C=${add.C.length} D=${add.D.length} (thresholds p85=${p85.toFixed(0)} p60=${p60.toFixed(0)} p30=${p30.toFixed(0)})`,
);
