/**
 * Download + crop official Palworld art for home tool cards → public/companion/*.webp
 *
 * Usage: node scripts/fetch-companion-art.mjs
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, "..", "public", "companion");
const UA = "ThePaldexBot/1.0 (+https://thepaldex.com; unofficial Palworld toolkit)";

const TARGET_W = 1400;
const RATIO = 2.15;
const TARGET_H = Math.round(TARGET_W / RATIO);

/** @type {Record<string, { url: string, out: string, extract: (w: number, h: number) => { left: number, top: number, width: number, height: number } }>} */
const ASSETS = {
  pals: {
    url: "https://store-images.s-microsoft.com/image/apps.54359.13654268679289325.ececb946-5639-4e77-b347-9d188d4e7e02.58b7fb42-a33a-48ea-a6c9-c990b4653b2f",
    out: "pals.webp",
    extract: (W, H) => {
      const height = Math.round(H * 0.52);
      const width = Math.round(height * RATIO);
      return { left: (W - width) / 2 + W * 0.02, top: H * 0.42, width, height };
    },
  },
  breeding: {
    url: "https://cdn.mobygames.com/promos/18172409-palworld-screenshot.png",
    out: "breeding.webp",
    extract: (W, H) => {
      const height = Math.round(H * 0.92);
      const width = Math.round(height * RATIO);
      return {
        left: Math.max(0, (W - Math.min(width, W)) / 2),
        top: Math.max(0, (H - height) / 2),
        width: Math.min(width, W),
        height,
      };
    },
  },
  teams: {
    url: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1623730/efec2f6aaaca15d66e30455e3b57383fdaa246c5/ss_efec2f6aaaca15d66e30455e3b57383fdaa246c5.1920x1080.jpg",
    out: "teams.webp",
    extract: (W, H) => {
      const height = Math.round(H * 0.78);
      const width = Math.round(height * RATIO);
      if (width >= W) {
        const hh = Math.round(W / RATIO);
        return { left: 0, top: (H - hh) * 0.4, width: W, height: hh };
      }
      return { left: (W - width) / 2, top: H * 0.18, width, height };
    },
  },
  tiers: {
    url: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1623730/e2c34987fa3f3893480afed747b0c2ede52e5a31/ss_e2c34987fa3f3893480afed747b0c2ede52e5a31.1920x1080.jpg",
    out: "tiers.webp",
    extract: (W, H) => {
      const height = Math.round(H * 0.68);
      const width = Math.round(height * RATIO);
      let left = W * 0.28;
      if (left + width > W) left = W - width;
      return { left, top: 0, width, height };
    },
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
  const meta = await sharp(raw).metadata();
  const box = asset.extract(meta.width, meta.height);
  const left = Math.max(0, Math.round(box.left));
  const top = Math.max(0, Math.round(box.top));
  const width = Math.min(Math.round(box.width), meta.width - left);
  const height = Math.min(Math.round(box.height), meta.height - top);

  const webp = await sharp(raw)
    .extract({ left, top, width, height })
    .resize(TARGET_W, TARGET_H, { fit: "cover", position: "centre" })
    .webp({ quality: 86 })
    .toBuffer();

  await writeFile(path.join(outDir, asset.out), webp);
  console.log(`${key} → ${asset.out} (${(webp.length / 1024).toFixed(0)} KB)`);
}

console.log("Done. Art cached in public/companion/");
