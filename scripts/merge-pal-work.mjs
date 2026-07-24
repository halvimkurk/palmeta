/**
 * Extract work suitability from scraped pals-0.md into pal-work.v1.json.
 * Merged at runtime onto pals so regenerating partner skills won't wipe work levels.
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const WORKS = [
  ["gathering", "Gathering"],
  ["cooling", "Cooling"],
  ["deforesting", "Deforesting"],
  ["kindling", "Kindling"],
  ["generating-electricity", "Generating Electricity"],
  ["handiwork", "Handiwork"],
  ["mining", "Mining"],
  ["farming", "Farming"],
  ["oil-extracting", "Oil Extracting"],
  ["medicine-production", "Medicine Production"],
  ["planting", "Planting"],
  ["transporting", "Transporting"],
  ["watering", "Watering"],
];

function parseWorks(chunk) {
  /** @type {Record<string, number>} */
  const out = {};
  for (const [id, label] of WORKS) {
    const re = new RegExp(label.replace(/ /g, "\\s*") + "\\s*(\\d+)", "i");
    const m = chunk.match(re);
    if (m) out[id] = Number(m[1]);
  }
  return out;
}

function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const mdPaths = [
  join(
    process.env.USERPROFILE || "",
    ".cursor/projects/c-Users-anton-OneDrive-Desktop-Work-palworld-achievements/uploads/pals-0.md",
  ),
  join(root, "uploads/pals-0.md"),
  join(root, "data/raw/pals-0.md"),
];

let md = "";
for (const p of mdPaths) {
  try {
    md = readFileSync(p, "utf8");
    console.log("Using", p);
    break;
  } catch {
    /* next */
  }
}
if (!md) {
  console.error("pals-0.md not found");
  process.exit(1);
}

const catalog = JSON.parse(
  readFileSync(join(root, "data/catalog/pals.v1.json"), "utf8"),
);

/** @type {Record<string, Record<string, number>>} */
const bySlug = {};
let hits = 0;
const misses = [];

for (const pal of catalog.pals) {
  const esc = escapeRe(pal.name);
  let m = new RegExp(esc + esc + "\\s*#", "i").exec(md);
  if (!m) m = new RegExp(esc + "\\s*#(?:\\d|[A-Z])", "i").exec(md);
  if (!m) {
    misses.push(pal.slug);
    continue;
  }
  // Truncate before the next pal card ("Fire element…", "NEW…").
  const from = md.slice(m.index);
  const nextCard = from.slice(30).search(
    /(?:NEW)?(?:Dragon|Earth|Water|Fire|Ice|Dark|Leaf|Electricity|Normal)\s*element/i,
  );
  const chunk = from.slice(0, nextCard > 0 ? nextCard + 30 : 140);
  const work = parseWorks(chunk);
  if (Object.keys(work).length === 0) {
    misses.push(`${pal.slug}(no-work)`);
    continue;
  }
  bySlug[pal.slug] = work;
  hits++;
}

const out = {
  version: 1,
  updatedAt: new Date().toISOString().slice(0, 10),
  source: "palworld.gg pals dump (work levels)",
  pals: bySlug,
};

const outPath = join(root, "data/catalog/pal-work.v1.json");
mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, JSON.stringify(out, null, 2) + "\n");

// Strip embedded work from pals.v1.json — keep single source of truth in pal-work.v1.json
let stripped = 0;
for (const pal of catalog.pals) {
  if (pal.work) {
    delete pal.work;
    stripped++;
  }
}
if (stripped) {
  writeFileSync(
    join(root, "data/catalog/pals.v1.json"),
    JSON.stringify(catalog, null, 2) + "\n",
  );
}

console.log(`Wrote work for ${hits}/${catalog.pals.length} → ${outPath}`);
if (stripped) console.log(`Stripped embedded work from pals.v1.json (${stripped})`);
if (misses.length) console.log("Misses:", misses.join(", "));
