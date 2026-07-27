/**
 * Cache official Palworld Steam art for companion page heroes.
 * Uses in-game screenshots and library hero — no logo/header overlays.
 * Run: node scripts/fetch-companion-art.mjs [--force]
 */
import { mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, "..", "public", "companion");
const force = process.argv.includes("--force");

/** Official Steam CDN — in-game screenshots without store text overlays. */
const ASSETS = [
  {
    file: "tiers.webp",
    url: "https://cdn.akamai.steamstatic.com/steam/apps/1623730/library_hero.jpg",
  },
  {
    file: "breeding.webp",
    url: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1623730/648ed4266fc18f413292292741304ef648421c55/ss_648ed4266fc18f413292292741304ef648421c55.1920x1080.jpg",
  },
  {
    file: "teams.webp",
    url: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1623730/ss_06e27c15c7b4b10233c937b887cf6a6925c83009.1920x1080.jpg",
  },
  {
    file: "pals.webp",
    url: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1623730/ss_1e6f7cf3c58086df2a3e9b13a988c2681d372b2d.1920x1080.jpg",
  },
];

mkdirSync(outDir, { recursive: true });

const UA = "PalmetaAssetBot/1.0 (+https://palmeta.app)";

for (const asset of ASSETS) {
  const dest = join(outDir, asset.file);
  if (existsSync(dest) && !force) {
    console.log("skip", asset.file);
    continue;
  }
  const res = await fetch(asset.url, { headers: { "user-agent": UA } });
  if (!res.ok) {
    console.warn("fail", asset.file, res.status);
    continue;
  }
  const buf = Buffer.from(await res.arrayBuffer());
  await sharp(buf)
    .resize({ width: 960, withoutEnlargement: true })
    .webp({ quality: 84 })
    .toFile(dest);
  console.log(force && existsSync(dest) ? "refresh" : "ok", asset.file);
}
