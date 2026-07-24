/**
 * Download local pal portraits for Team Builder.
 * Source map: game icon filenames as hosted on public community sites.
 * Run: node scripts/fetch-pal-icons.mjs
 */
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const outDir = join(root, "public", "pal-icons");
const mapPath = join(root, "data", "catalog", "pal-icon-source.json");
const palsPath = join(root, "data", "catalog", "pals.v1.json");

const BASE = "https://palworld.gg/images/full_palicon";

mkdirSync(outDir, { recursive: true });

const nameToFile = Object.fromEntries(
  JSON.parse(readFileSync(mapPath, "utf8")),
);
const pals = JSON.parse(readFileSync(palsPath, "utf8")).pals;

let ok = 0;
let skip = 0;
let fail = 0;
const missing = [];

async function download(slug, file) {
  const dest = join(outDir, `${slug}.png`);
  if (existsSync(dest)) {
    skip += 1;
    return true;
  }
  const url = `${BASE}/${file}`;
  const res = await fetch(url);
  if (!res.ok) {
    fail += 1;
    missing.push({ slug, file, status: res.status });
    return false;
  }
  const buf = Buffer.from(await res.arrayBuffer());
  writeFileSync(dest, buf);
  ok += 1;
  return true;
}

for (const pal of pals) {
  const file = nameToFile[pal.name];
  if (!file) {
    fail += 1;
    missing.push({ slug: pal.slug, name: pal.name, reason: "no map" });
    continue;
  }
  await download(pal.slug, file);
}

console.log(`pal icons: downloaded=${ok} skipped=${skip} failed=${fail}`);
if (missing.length) {
  console.log("missing:", JSON.stringify(missing, null, 2));
  process.exitCode = 1;
}
