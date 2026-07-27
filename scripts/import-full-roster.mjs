/**
 * Import full Paldex roster (~299) from palworld.gg Nuxt data module into:
 * - data/catalog/pals.v1.json
 * - data/catalog/pal-stats.v1.json
 * - data/catalog/pal-work.v1.json
 * - data/catalog/pal-breeding.v1.json
 * - data/catalog/pal-icon-source.json
 *
 * Preserves curated partner-skill stack metadata from the previous pals.v1.json
 * when the slug already existed (Gobfin auras, etc.).
 *
 * Run: node scripts/import-full-roster.mjs
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const catalogDir = join(root, "data/catalog");
const DATA_URL = "https://palworld.gg/_nuxt/CK2A4_hG.js";

const ELEMENT_MAP = {
  Normal: "normal",
  Fire: "fire",
  Water: "water",
  Electricity: "electricity",
  Leaf: "leaf",
  Ice: "ice",
  Earth: "earth",
  Dark: "dark",
  Dragon: "dragon",
};

const WORK_MAP = {
  Handcraft: "handiwork",
  Transport: "transporting",
  MonsterFarm: "farming",
  Collection: "gathering",
  Cool: "cooling",
  Deforest: "deforesting",
  EmitFlame: "kindling",
  GenerateElectricity: "generating-electricity",
  Mining: "mining",
  ProductMedicine: "medicine-production",
  Seeding: "planting",
  Watering: "watering",
};

const TAG_MAP = {
  base: "base-work",
  combat: "combat-buffs",
  "boost-dark": "dark-boost",
  "boost-dragon": "dragon-boost",
  "boost-earth": "earth-boost",
  "boost-electricity": "electricity-boost",
  "boost-fire": "fire-boost",
  "boost-ice": "ice-boost",
  "boost-leaf": "leaf-boost",
  "boost-normal": "normal-boost",
  "boost-water": "water-boost",
  bow: "bow",
  capture: "capture",
  drops: "more-drops",
  eggs: "eggs",
  firearms: "firearms",
  fishing: "fishing",
  glider: "glider",
  healing: "healing",
  insulation: "insulation",
  melee: "melee",
  mobility: "mobility",
  shield: "shield",
  weight: "carry-weight",
};

function mapRarity(n) {
  if (n >= 20) return "legendary";
  if (n >= 8) return "epic";
  if (n >= 5) return "rare";
  return "common";
}

function extractObjectAt(raw, idx) {
  let start = idx;
  while (start > 0 && raw[start] !== "{") start--;
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
  return raw.slice(start, end);
}

/** Pull string value for `key:` supporting "…" or `…`. */
function readStringField(obj, key) {
  const dq = obj.match(new RegExp(`${key}:"((?:\\\\.|[^"\\\\])*)"`));
  if (dq) return dq[1].replace(/\\"/g, '"').replace(/\\n/g, "\n").replace(/\\r/g, "");
  const bq = obj.match(new RegExp(`${key}:\`([\\s\\S]*?)\``));
  if (bq) return bq[1].replace(/\r/g, "").replace(/\\n/g, "\n");
  return "";
}

function cleanDesc(s) {
  return s
    .replace(/\[elem:[^\]]+\]/gi, "")
    .replace(/\[\/?\w+[^\]]*\]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function parseWork(obj) {
  const block = obj.match(/work:\{([^}]*)\}/)?.[1] ?? "";
  /** @type {Record<string, number>} */
  const out = {};
  for (const m of block.matchAll(/(\w+):(\d+)/g)) {
    const id = WORK_MAP[m[1]];
    if (id) out[id] = Number(m[2]);
  }
  return out;
}

function parseStats(obj) {
  const block = obj.match(/stats:\{([^}]+)\}/)?.[1] ?? "";
  /** @type {Record<string, number>} */
  const raw = {};
  for (const m of block.matchAll(/(\w+):([\d.e+]+)/g)) {
    raw[m[1]] = Number(m[2]);
  }
  if (!Number.isFinite(raw.hp)) return null;
  return {
    hp: raw.hp,
    melee: raw.melee,
    shot: raw.shot,
    defense: raw.defense,
    support: raw.support,
    stamina: raw.stamina,
    runSpeed: raw.runSpeed,
    rideSprintSpeed: raw.rideSprintSpeed,
    price: raw.price,
  };
}

function parseElements(obj) {
  const block = obj.match(/elements:\[([^\]]*)\]/)?.[1] ?? "";
  const out = [];
  for (const m of block.matchAll(/"([^"]+)"/g)) {
    const mapped = ELEMENT_MAP[m[1]];
    if (mapped) out.push(mapped);
  }
  return out;
}

function parsePartnerTags(obj, mount, desc) {
  const tags = new Set();
  // Prefer tags sitting near partnerSkill (after desc)
  const psIdx = obj.indexOf("partnerSkill:");
  const window = psIdx >= 0 ? obj.slice(psIdx, psIdx + 2500) : obj;
  const tagBlocks = [...window.matchAll(/tags:\[([^\]]*)\]/g)];
  for (const block of tagBlocks) {
    for (const t of block[1].matchAll(/"([^"]+)"/g)) {
      const mapped = TAG_MAP[t[1]];
      if (mapped) tags.add(mapped);
    }
  }
  if (mount === "flying") tags.add("flying-mount");
  if (mount === "ground") tags.add("ground-mount");
  const d = desc.toLowerCase();
  if (d.includes("flying mount")) tags.add("flying-mount");
  if (/\bcan be ridden\b/.test(d) && !tags.has("flying-mount")) {
    tags.add("ground-mount");
  }
  if (Object.keys(parseWork(obj)).length > 0 && !tags.has("base-work")) {
    // soft signal — only if skill text mentions work/base
    if (/\b(work|base|craft|farm|mine|gather)\b/i.test(desc)) tags.add("base-work");
  }
  return [...tags];
}

function parseMount(obj) {
  const m = obj.match(/mount:"(flying|ground)"/);
  return m?.[1] ?? null;
}

function parseNumber(obj, key) {
  const m = obj.match(new RegExp(`${key}:([\\d.e+]+)`));
  const n = Number(m?.[1]);
  return Number.isFinite(n) ? n : undefined;
}

function parseBoolBang(obj, key) {
  if (new RegExp(`${key}:!0`).test(obj)) return true;
  if (new RegExp(`${key}:!1`).test(obj)) return false;
  return undefined;
}

console.log("Fetching", DATA_URL);
const raw = await (await fetch(DATA_URL)).text();

/** @type {Map<string, string>} */
const objectsBySlug = new Map();
for (const m of raw.matchAll(/slug:"([a-z0-9-]+)"/g)) {
  const slug = m[1];
  if (objectsBySlug.has(slug)) continue;
  objectsBySlug.set(slug, extractObjectAt(raw, m.index));
}

console.log("Unique pals in source:", objectsBySlug.size);

/** Previous curated overlay */
/** @type {Map<string, object>} */
const previousBySlug = new Map();
const prevPath = join(catalogDir, "pals.v1.json");
if (existsSync(prevPath)) {
  const prev = JSON.parse(readFileSync(prevPath, "utf8"));
  for (const p of prev.pals ?? []) previousBySlug.set(p.slug, p);
}

/** @type {Map<string, string>} id/key → slug */
const idToSlug = new Map();

/** @type {object[]} */
const pals = [];
/** @type {Record<string, object>} */
const statsBySlug = {};
/** @type {Record<string, object>} */
const workBySlug = {};
/** @type {Record<string, object>} */
const breedBySlug = {};
/** @type {[string, string][]} */
const iconPairs = [];

for (const [slug, obj] of objectsBySlug) {
  const id = readStringField(obj, "id") || slug;
  const key = readStringField(obj, "key");
  idToSlug.set(id.toLowerCase(), slug);
  if (key) idToSlug.set(key.toLowerCase(), slug);
  // Variant keys often use underscore form of id
  idToSlug.set(id.toLowerCase().replace(/-/g, "_"), slug);

  const name = readStringField(obj, "name") || slug;
  const rarityNum = parseNumber(obj, "rarity") ?? 1;
  const index = parseNumber(obj, "index");
  const elements = parseElements(obj);
  const stats = parseStats(obj);
  const work = parseWork(obj);
  const mount = parseMount(obj);

  const psBlockMatch = obj.match(/partnerSkill:\{/);
  let partnerName = "—";
  let partnerDesc = "";
  if (psBlockMatch && psBlockMatch.index != null) {
    const psObj = extractObjectAt(obj, psBlockMatch.index + "partnerSkill:".length);
    partnerName = readStringField(psObj, "name") || "—";
    partnerDesc = cleanDesc(readStringField(psObj, "desc"));
  }

  const tags = parsePartnerTags(obj, mount, partnerDesc);
  const prev = previousBySlug.get(slug);
  /** @type {object} */
  let partnerSkill = {
    name: partnerName === "-" ? "—" : partnerName,
    description: partnerDesc || "Partner skill details unavailable.",
    tags: tags.length ? tags : prev?.partnerSkill?.tags ?? ["combat-buffs"],
  };

  if (prev?.partnerSkill) {
    // Prefer curated stack metadata + richer tags when present
    const curated = prev.partnerSkill;
    partnerSkill = {
      name: curated.name || partnerSkill.name,
      description: curated.description || partnerSkill.description,
      tags:
        curated.tags?.length >= (partnerSkill.tags?.length ?? 0)
          ? curated.tags
          : partnerSkill.tags,
      ...(curated.stackGroup
        ? {
            stackGroup: curated.stackGroup,
            stackValue: curated.stackValue,
            stackUnit: curated.stackUnit,
            stackLabel: curated.stackLabel,
          }
        : {}),
    };
  }

  const pal = {
    slug,
    name,
    elements,
    rarity: mapRarity(rarityNum),
    ...(index != null ? { dexNo: index } : {}),
    partnerSkill,
  };
  pals.push(pal);

  if (stats) statsBySlug[slug] = stats;
  if (Object.keys(work).length) workBySlug[slug] = work;

  const combiRank = parseNumber(obj, "combiRank");
  const combiPriority = parseNumber(obj, "combiPriority");
  const ignoreCombi = parseBoolBang(obj, "ignoreCombi");
  breedBySlug[slug] = {
    ...(combiRank != null ? { combiRank } : {}),
    ...(combiPriority != null ? { combiPriority } : {}),
    ...(ignoreCombi != null ? { ignoreCombi } : {}),
    ...(index != null ? { index } : {}),
  };

  const icon = readStringField(obj, "icon");
  if (icon) {
    const file = icon.endsWith(".png") ? icon : `${icon}.png`;
    iconPairs.push([name, file]);
  }
}

pals.sort((a, b) => {
  const da = a.dexNo ?? 9999;
  const db = b.dexNo ?? 9999;
  if (da !== db) return da - db;
  return a.name.localeCompare(b.name);
});

/** Unique breeding combos — map game ids → our slugs */
/** @type {Map<string, { parents: [string, string]; child: string }>} */
const uniqueMap = new Map();
for (const [slug, obj] of objectsBySlug) {
  const comboIdx = obj.indexOf("combos:[");
  if (comboIdx < 0) continue;
  const slice = obj.slice(comboIdx, comboIdx + 8000);
  for (const m of slice.matchAll(
    /\{a:"([^"]+)",b:"([^"]+)",child:"([^"]+)"\}/g,
  )) {
    const a = idToSlug.get(m[1].toLowerCase());
    const b = idToSlug.get(m[2].toLowerCase());
    const child = idToSlug.get(m[3].toLowerCase());
    if (!a || !b || !child) continue;
    if (a === b && a === child) continue;
    const parents = /** @type {[string, string]} */ (
      [a, b].sort((x, y) => x.localeCompare(y))
    );
    const key = `${parents[0]}|${parents[1]}|${child}`;
    uniqueMap.set(key, { parents, child });
  }
}

const uniqueCombos = [...uniqueMap.values()].sort((x, y) =>
  x.child.localeCompare(y.child),
);

const today = new Date().toISOString().slice(0, 10);
mkdirSync(catalogDir, { recursive: true });

writeFileSync(
  join(catalogDir, "pals.v1.json"),
  JSON.stringify(
    {
      version: 2,
      updatedAt: today,
      source: "palworld.gg Nuxt pals module + curated partner-skill overlays",
      pals,
    },
    null,
    2,
  ) + "\n",
);

writeFileSync(
  join(catalogDir, "pal-stats.v1.json"),
  JSON.stringify(
    {
      version: 1,
      updatedAt: today,
      source: "palworld.gg Nuxt pals en data module",
      pals: statsBySlug,
    },
    null,
    2,
  ) + "\n",
);

writeFileSync(
  join(catalogDir, "pal-work.v1.json"),
  JSON.stringify(
    {
      version: 1,
      updatedAt: today,
      source: "palworld.gg Nuxt pals work suitabilities",
      pals: workBySlug,
    },
    null,
    2,
  ) + "\n",
);

writeFileSync(
  join(catalogDir, "pal-breeding.v1.json"),
  JSON.stringify(
    {
      version: 2,
      updatedAt: today,
      source: "palworld.gg combiRank + unique combos (id→slug mapped)",
      formula:
        "floor((rankA + rankB + 1) / 2) → closest combiRank (tie → lower combiPriority)",
      ranks: breedBySlug,
      uniqueCombos,
    },
    null,
    2,
  ) + "\n",
);

// Dedupe icon map by display name (last wins)
const iconMap = new Map(iconPairs);
writeFileSync(
  join(catalogDir, "pal-icon-source.json"),
  JSON.stringify([...iconMap.entries()].sort((a, b) => a[0].localeCompare(b[0]))) +
    "\n",
);

console.log(
  `Wrote ${pals.length} pals; stats=${Object.keys(statsBySlug).length}; work=${Object.keys(workBySlug).length}; uniqueCombos=${uniqueCombos.length}; icons=${iconMap.size}`,
);
console.log(
  `Preserved curated overlays: ${[...previousBySlug.keys()].filter((s) => objectsBySlug.has(s)).length}`,
);

// Sanity: unresolved combo ids sample
let unresolved = 0;
for (const [, obj] of objectsBySlug) {
  const comboIdx = obj.indexOf("combos:[");
  if (comboIdx < 0) continue;
  const slice = obj.slice(comboIdx, comboIdx + 4000);
  for (const m of slice.matchAll(
    /\{a:"([^"]+)",b:"([^"]+)",child:"([^"]+)"\}/g,
  )) {
    if (
      !idToSlug.has(m[1].toLowerCase()) ||
      !idToSlug.has(m[2].toLowerCase()) ||
      !idToSlug.has(m[3].toLowerCase())
    ) {
      unresolved++;
    }
  }
}
console.log("Unresolved combo id refs (raw count):", unresolved);
