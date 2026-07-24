import type { EffectTag } from "@/lib/teams/types";

/** Visual tone for small effect badges / left accents. */
export type EffectTone =
  | "stack"
  | "combat"
  | "mount"
  | "boost"
  | "support"
  | "gather"
  | "work";

const TAG_TONE: Record<EffectTag, EffectTone> = {
  "flying-mount": "mount",
  "ground-mount": "mount",
  glider: "mount",
  mobility: "mount",
  bow: "combat",
  firearms: "combat",
  melee: "combat",
  "combat-buffs": "combat",
  status: "combat",
  healing: "support",
  shield: "support",
  "carry-weight": "support",
  insulation: "support",
  "ice-boost": "boost",
  "dark-boost": "boost",
  "dragon-boost": "boost",
  "earth-boost": "boost",
  "leaf-boost": "boost",
  "electricity-boost": "boost",
  "water-boost": "boost",
  "fire-boost": "boost",
  "normal-boost": "boost",
  "more-drops": "gather",
  fishing: "gather",
  capture: "gather",
  eggs: "gather",
  "base-work": "work",
};

export function toneForTags(tags: EffectTag[]): EffectTone {
  return TAG_TONE[tags[0]!] ?? "combat";
}

export function toneForTag(tag: EffectTag): EffectTone {
  return TAG_TONE[tag] ?? "combat";
}
