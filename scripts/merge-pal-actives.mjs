/**
 * Extract active combat skills (level-up moves) from palworld.gg Nuxt data.
 * Outputs data/catalog/pal-actives.v1.json — merged onto pals at runtime.
 *
 * Run: node scripts/merge-pal-actives.mjs
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

function extractBySlug(slug) {
  const marker = `slug:"${slug}"`;
  const idx = raw.indexOf(marker);
  if (idx < 0) return null;
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

function extractActivesArray(obj) {
  const marker = "actives:[";
  const idx = obj.indexOf(marker);
  if (idx < 0) return null;
  let i = idx + marker.length - 1; // at '['
  let depth = 0;
  const start = i;
  for (; i < obj.length; i++) {
    const ch = obj[i];
    if (ch === "[") depth++;
    else if (ch === "]") {
      depth--;
      if (depth === 0) {
        i++;
        break;
      }
    }
  }
  return obj.slice(start, i);
}

function cleanDesc(s) {
  return s
    .replace(/\\r\\n|\\n|\\r/g, " ")
    .replace(/\r\n|\n|\r/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function parseActives(arrSrc) {
  /** @type {{level:number,name:string,description:string,element:string,power:number,cooldown:number}[]} */
  const out = [];
  const re =
    /\{level:(\d+),name:"([^"]+)",desc:(?:`([\s\S]*?)`|"([^"]*)"),element:"([^"]+)",power:([\d.e+]+),cooldown:([\d.e+]+)/g;
  for (const m of arrSrc.matchAll(re)) {
    const element = ELEMENT_MAP[m[5]];
    if (!element) continue;
    out.push({
      level: Number(m[1]),
      name: m[2],
      description: cleanDesc(m[3] ?? m[4] ?? ""),
      element,
      power: Number(m[6]),
      cooldown: Number(m[7]),
    });
  }
  return out.sort((a, b) => a.level - b.level || a.name.localeCompare(b.name));
}

/** @type {Record<string, object[]>} */
const bySlug = {};
const misses = [];
let hits = 0;

for (const pal of catalog.pals) {
  const obj = extractBySlug(pal.slug);
  if (!obj) {
    misses.push(`${pal.slug}(no-obj)`);
    continue;
  }
  const arr = extractActivesArray(obj);
  if (!arr) {
    misses.push(`${pal.slug}(no-actives)`);
    continue;
  }
  const skills = parseActives(arr);
  if (skills.length === 0) {
    misses.push(`${pal.slug}(empty)`);
    continue;
  }
  bySlug[pal.slug] = skills;
  hits++;
}

const out = {
  version: 1,
  updatedAt: new Date().toISOString().slice(0, 10),
  source: "palworld.gg Nuxt pals actives[]",
  pals: bySlug,
};

const outPath = join(root, "data/catalog/pal-actives.v1.json");
mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, JSON.stringify(out, null, 2) + "\n");

console.log(`Wrote ${hits} pals → ${outPath}`);
if (misses.length) {
  console.log(`Misses (${misses.length}):`, misses.slice(0, 20).join(", "));
}
