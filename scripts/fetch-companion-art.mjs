/**
 * Download official Palworld art for companion page heroes → public/companion/*.webp
 *
 * Sources: Steam store screenshots, trading cards, profile backgrounds.
 * Usage: node scripts/fetch-companion-art.mjs
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, "..", "public", "companion");
const UA = "PalmetaBot/1.0 (+https://palmeta.app; unofficial Palworld toolkit)";

/** @type {Record<string, { url: string, out: string, width: number }>} */
const ASSETS = {
  tiers: {
    url: "https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/items/1623730/124778e85aae5d2b1bc31f70fcdc48d7c65e27c9.jpg",
    out: "tiers.webp",
    width: 1200,
  },
  breeding: {
    url: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1623730/ss_1e6f7cf3c58086df2a3e9b13a988c2681d372b2d.1920x1080.jpg",
    out: "breeding.webp",
    width: 1200,
  },
  teams: {
    url: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1623730/ss_b3cea7c9f04a67d784d4c6a0c157a11d6268b189.1920x1080.jpg",
    out: "teams.webp",
    width: 1200,
  },
  pals: {
    url: "https://steamcommunity.com/economy/profilebackground/items/1623730/d88e6f9f99794ac579c1814455704c4e0d4bf174.jpg",
    out: "pals.webp",
    width: 1200,
  },
};

async function fetchBuffer(url) {
  const res = await fetch(url, { headers: { "user-agent": UA } });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

await mkdir(outDir, { recursive: true });

for (const [key, asset] of Object.entries(ASSETS)) {
  const raw = await fetchBuffer(asset.url);
  const webp = await sharp(raw)
    .resize(asset.width, null, { withoutEnlargement: true })
    .webp({ quality: 84 })
    .toBuffer();
  const dest = path.join(outDir, asset.out);
  await writeFile(dest, webp);
  console.log(`${key} → ${asset.out} (${(webp.length / 1024).toFixed(0)} KB)`);
}

console.log("Done. Art cached in public/companion/");
