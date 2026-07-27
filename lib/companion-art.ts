/** Thematic hero art for companion tool pages (cached under public/companion/). */

export type CompanionArtTone = "tiers" | "breeding" | "teams" | "pals";

export type CompanionArt = {
  /** Path under public/, e.g. /companion/tiers.webp */
  src: string;
  /** CSS object-position for the cropped hero panel. */
  objectPosition: string;
  /** Short attribution for the asset source. */
  credit: string;
};

/**
 * Official Pocketpair art sources:
 * - tiers: Steam trading card (Jetragon)
 * - breeding: in-game base / ranch screenshot (Steam store)
 * - teams: co-op flight toward tower (Steam store)
 * - pals: Steam profile background key art (Depresso + Cattiva)
 *
 * Run `pnpm companion:art` to refresh cached WebP files.
 */
export const COMPANION_ART: Record<CompanionArtTone, CompanionArt> = {
  tiers: {
    src: "/companion/tiers.webp",
    objectPosition: "72% 42%",
    credit: "Steam trading card — Jetragon (Pocketpair)",
  },
  breeding: {
    src: "/companion/breeding.webp",
    objectPosition: "58% 48%",
    credit: "Official screenshot — Palworld (Pocketpair / Steam)",
  },
  teams: {
    src: "/companion/teams.webp",
    objectPosition: "68% 50%",
    credit: "Official screenshot — Palworld (Pocketpair / Steam)",
  },
  pals: {
    src: "/companion/pals.webp",
    objectPosition: "78% 50%",
    credit: "Steam profile background — Key Art (Pocketpair)",
  },
};

export function companionArtFor(tone: CompanionArtTone) {
  return COMPANION_ART[tone];
}
