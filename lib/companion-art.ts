/** Hero art for companion tool pages — official Steam screenshots, cached under /companion. */

export type CompanionArtTone = "tiers" | "breeding" | "teams" | "pals";

export const COMPANION_ART: Record<
  CompanionArtTone,
  { src: string; position: string }
> = {
  tiers: { src: "/companion/tiers.webp", position: "68% 22%" },
  breeding: { src: "/companion/breeding.webp", position: "center 42%" },
  teams: { src: "/companion/teams.webp", position: "55% 38%" },
  pals: { src: "/companion/pals.webp", position: "62% 36%" },
};

export function companionArtFor(tone: CompanionArtTone) {
  return COMPANION_ART[tone];
}
