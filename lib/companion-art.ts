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
 * Official Pocketpair art (pre-cropped for home cards):
 * - pals: Xbox Super Hero key art (tight cast crop)
 * - breeding: same key art, left companion group
 * - teams: Steam screenshot — four mounted riders
 * - tiers: Steam screenshot — Zoe + Grizzbolt
 *
 * Run `pnpm companion:art` to refresh cached WebP files.
 */
export const COMPANION_ART: Record<CompanionArtTone, CompanionArt> = {
  tiers: {
    src: "/companion/tiers.webp",
    objectPosition: "50% 35%",
    credit: "Official screenshot — Zoe & Grizzbolt (Pocketpair / Steam)",
  },
  breeding: {
    src: "/companion/breeding.webp",
    objectPosition: "35% 55%",
    credit: "Official key art — Palworld (Pocketpair / Xbox)",
  },
  teams: {
    src: "/companion/teams.webp",
    objectPosition: "50% 55%",
    credit: "Official screenshot — mounted party (Pocketpair / Steam)",
  },
  pals: {
    src: "/companion/pals.webp",
    objectPosition: "50% 55%",
    credit: "Official key art — Palworld (Pocketpair / Xbox)",
  },
};

export function companionArtFor(tone: CompanionArtTone) {
  return COMPANION_ART[tone];
}
