/**
 * Extract combat stats + breeding rank for our curated pals from
 * palworld.gg Nuxt data module (`/_nuxt/CK2A4_hG.js` — en pals payload).
 *
 * Outputs:
 * - data/catalog/pal-stats.v1.json
 * - data/catalog/pal-breeding.v1.json (ranks + unique combos + algorithm note)
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const catalog = JSON.parse(
  readFileSync(join(root, "data/catalog/pals.v1.json"), "utf8"),
);

const DATA_URL = "https://palworld.gg/_nuxt/CK2A4_hG.js";
console.log("Fetching", DATA_URL);
const raw = await (await fetch(DATA_URL)).text();

function parseStatsBlock(block) {
  /** @type {Record<string, number>} */
  const out = {};
  for (const m of block.matchAll(/(\w+):([\d.e+]+)/g)) {
    out[m[1]] = Number(m[2]);
  }
  return out;
}

function extractBySlug(slug) {
  const marker = `slug:"${slug}"`;
  const idx = raw.indexOf(marker);
  if (idx < 0) return null;
  // Walk back to object start
  let start = idx;
  while (start > 0 && raw[start] !== "{") start--;
  // Walk forward with brace depth
  let depth = 0;
  let end = start;
  for (; end < raw.length; end++) {
    const ch = raw[end];
    if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) {
        end++;
        break;
      }
    }
  }
  const obj = raw.slice(start, end);
  const combiRank = Number(obj.match(/combiRank:(\d+)/)?.[1] ?? NaN);
  const combiPriority = Number(obj.match(/combiPriority:([\d.e+]+)/)?.[1] ?? NaN);
  const ignoreCombi = /ignoreCombi:!0/.test(obj);
  const statsRaw = obj.match(/stats:\{([^}]+)\}/)?.[1] ?? "";
  const stats = parseStatsBlock(statsRaw);
  const index = Number(obj.match(/index:(\d+)/)?.[1] ?? NaN);
  return {
    combiRank: Number.isFinite(combiRank) ? combiRank : undefined,
    combiPriority: Number.isFinite(combiPriority) ? combiPriority : undefined,
    ignoreCombi,
    index: Number.isFinite(index) ? index : undefined,
    stats: {
      hp: stats.hp,
      melee: stats.melee,
      shot: stats.shot,
      defense: stats.defense,
      support: stats.support,
      stamina: stats.stamina,
      runSpeed: stats.runSpeed,
      rideSprintSpeed: stats.rideSprintSpeed,
      price: stats.price,
    },
  };
}

const ourSlugs = new Set(catalog.pals.map((p) => p.slug));

/** Unique parent pairs that override average formula (child must be in our catalog). */
const CURATED_UNIQUE = [
  { parents: ["relaxaurus", "sparkit"], child: "relaxaurus-lux" },
  { parents: ["mossanda", "grizzbolt"], child: "mossanda-lux" },
  { parents: ["vanwyrm", "foxcicle"], child: "vanwyrm-cryst" },
  { parents: ["mau", "pengullet"], child: "mau-cryst" },
  { parents: ["gobfin", "rooby"], child: "gobfin-ignis" },
  { parents: ["suzaku", "jormuntide"], child: "suzaku-aqua" },
  { parents: ["blazehowl", "felbat"], child: "blazehowl-noct" },
  { parents: ["pyrin", "katress"], child: "pyrin-noct" },
  { parents: ["kingpaca", "reindrix"], child: "kingpaca-cryst" },
  { parents: ["reptyro", "foxcicle"], child: "reptyro-cryst" },
  { parents: ["robinquill", "fuddler"], child: "robinquill-terra" },
  { parents: ["dinossom", "rayhound"], child: "dinossom-lux" },
  { parents: ["eikthyrdeer", "hangyu"], child: "eikthyrdeer-terra" },
  { parents: ["frostallion", "helzephyr"], child: "frostallion-noct" },
  { parents: ["jormuntide", "arsox"], child: "jormuntide-ignis" },
  { parents: ["lyleen", "menasting"], child: "lyleen-noct" },
  { parents: ["wumpo", "cinnamoth"], child: "wumpo-botan" },
  { parents: ["helzephyr", "beakon"], child: "helzephyr-lux" },
  { parents: ["blazamut", "jetragon"], child: "blazamut-ryu" },
  { parents: ["wixen", "felbat"], child: "wixen-noct" },
  { parents: ["faleris", "jormuntide"], child: "faleris-aqua" },
].filter((c) => ourSlugs.has(c.child));

/** @type {Record<string, object>} */
const statsBySlug = {};
/** @type {Record<string, object>} */
const breedBySlug = {};
const misses = [];

for (const pal of catalog.pals) {
  const hit = extractBySlug(pal.slug);
  if (!hit || !hit.stats?.hp) {
    misses.push(pal.slug);
    continue;
  }
  statsBySlug[pal.slug] = hit.stats;
  breedBySlug[pal.slug] = {
    combiRank: hit.combiRank,
    combiPriority: hit.combiPriority,
    ignoreCombi: hit.ignoreCombi,
    index: hit.index,
  };
}

const statsOut = {
  version: 1,
  updatedAt: new Date().toISOString().slice(0, 10),
  source: "palworld.gg Nuxt pals en data module",
  pals: statsBySlug,
};

const breedOut = {
  version: 1,
  updatedAt: new Date().toISOString().slice(0, 10),
  source: "palworld.gg combiRank + curated unique combos",
  formula: "floor((rankA + rankB + 1) / 2) → closest combiRank (tie → lower combiPriority)",
  ranks: breedBySlug,
  uniqueCombos: CURATED_UNIQUE,
};

mkdirSync(join(root, "data/catalog"), { recursive: true });
writeFileSync(
  join(root, "data/catalog/pal-stats.v1.json"),
  JSON.stringify(statsOut, null, 2) + "\n",
);
writeFileSync(
  join(root, "data/catalog/pal-breeding.v1.json"),
  JSON.stringify(breedOut, null, 2) + "\n",
);

console.log(
  `Stats: ${Object.keys(statsBySlug).length}/${catalog.pals.length}; unique combos: ${CURATED_UNIQUE.length}`,
);
if (misses.length) console.log("Misses:", misses.join(", "));
