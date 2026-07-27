export type PalElement =
  | "normal"
  | "fire"
  | "water"
  | "electricity"
  | "leaf"
  | "ice"
  | "earth"
  | "dark"
  | "dragon";

export type PalRarity = "common" | "rare" | "epic" | "legendary";

/** Partner-skill buckets — mirrors palworld.gg team-builder filters. */
export type EffectTag =
  | "flying-mount"
  | "ground-mount"
  | "bow"
  | "firearms"
  | "melee"
  | "combat-buffs"
  | "status"
  | "healing"
  | "shield"
  | "glider"
  | "mobility"
  | "carry-weight"
  | "insulation"
  | "ice-boost"
  | "dark-boost"
  | "dragon-boost"
  | "earth-boost"
  | "leaf-boost"
  | "electricity-boost"
  | "water-boost"
  | "fire-boost"
  | "normal-boost"
  | "more-drops"
  | "fishing"
  | "capture"
  | "eggs"
  | "base-work";

export type WorkSuitabilityId =
  | "kindling"
  | "watering"
  | "planting"
  | "generating-electricity"
  | "handiwork"
  | "gathering"
  | "deforesting"
  | "mining"
  | "medicine-production"
  | "cooling"
  | "transporting"
  | "farming"
  | "oil-extracting";

/** Work id → level (1–5 typically; endgame can be higher). */
export type PalWork = Partial<Record<WorkSuitabilityId, number>>;

export type PalCombatStats = {
  hp: number;
  melee: number;
  shot: number;
  defense: number;
  support?: number;
  stamina?: number;
  runSpeed?: number;
  rideSprintSpeed?: number;
  price?: number;
};

export type PalBreeding = {
  combiRank: number;
  combiPriority?: number;
  ignoreCombi?: boolean;
  index?: number;
};

export type PartnerSkill = {
  name: string;
  description: string;
  tags: EffectTag[];
  /** Stackable aura — e.g. Gobfin player attack %. Summed across party. */
  stackGroup?: string;
  stackValue?: number;
  /** Display unit after the number, e.g. "%" or " kg" */
  stackUnit?: string;
  /** Template with {n} for summed value, e.g. "+{n}% player attack" */
  stackLabel?: string;
};

/** Level-up active combat skill (move) learned by a pal. */
export type PalActiveSkill = {
  level: number;
  name: string;
  description: string;
  element: PalElement;
  power: number;
  cooldown: number;
};

export type Pal = {
  slug: string;
  name: string;
  elements: PalElement[];
  rarity: PalRarity;
  /** Paldeck index when known */
  dexNo?: number;
  partnerSkill: PartnerSkill;
  /** Highlight 1.0 / recent additions */
  isNew?: boolean;
  /** Base work suitability levels when known */
  work?: PalWork;
  /** Combat base stats when known */
  stats?: PalCombatStats;
  /** Breeding / combi rank when known */
  breeding?: PalBreeding;
  /** Level-up active skills when known */
  actives?: PalActiveSkill[];
};

/** Current = researched 1.0 meta; outdated = kept for reference / share links. */
export type TeamPresetStatus = "current" | "outdated";

export type TeamPreset = {
  id: string;
  name: string;
  description: string;
  /** Community placement for comps browser (Blitz-style). */
  tier?: "S" | "A" | "B" | "C";
  /** Defaults to current when omitted. */
  status?: TeamPresetStatus;
  /** Up to 5 pal slugs (nulls padded in UI) */
  team: string[];
  effectFocus?: EffectTag[];
};

export type PalsCatalog = {
  version: number;
  updatedAt: string;
  pals: Pal[];
};

export type AggregatedStack = {
  group: string;
  label: string;
  value: number;
  unit: string;
  sources: string[];
  tags: EffectTag[];
};

export type AggregatedUniqueEffect = {
  palSlug: string;
  palName: string;
  skillName: string;
  description: string;
  tags: EffectTag[];
};

export type TeamEffects = {
  stacks: AggregatedStack[];
  uniques: AggregatedUniqueEffect[];
  allTags: EffectTag[];
};

export const TEAM_SIZE = 5;

export const WORK_LABELS: Record<WorkSuitabilityId, string> = {
  kindling: "Kindling",
  watering: "Watering",
  planting: "Planting",
  "generating-electricity": "Electricity",
  handiwork: "Handiwork",
  gathering: "Gathering",
  deforesting: "Logging",
  mining: "Mining",
  "medicine-production": "Medicine",
  cooling: "Cooling",
  transporting: "Transport",
  farming: "Farming",
  "oil-extracting": "Oil",
};

export const WORK_ORDER: WorkSuitabilityId[] = [
  "kindling",
  "watering",
  "planting",
  "generating-electricity",
  "handiwork",
  "gathering",
  "deforesting",
  "mining",
  "medicine-production",
  "cooling",
  "transporting",
  "farming",
  "oil-extracting",
];

export const EFFECT_TAG_LABELS: Record<EffectTag, string> = {
  "flying-mount": "Flying Mount",
  "ground-mount": "Ground Mount",
  bow: "Bow / Arrows",
  firearms: "Firearms",
  melee: "Melee",
  "combat-buffs": "Combat Buffs",
  status: "Status Ailments",
  healing: "Healing",
  shield: "Shield",
  glider: "Glider",
  mobility: "Mobility",
  "carry-weight": "Carry Weight",
  insulation: "Insulation",
  "ice-boost": "Ice Boost",
  "dark-boost": "Dark Boost",
  "dragon-boost": "Dragon Boost",
  "earth-boost": "Earth Boost",
  "leaf-boost": "Leaf Boost",
  "electricity-boost": "Electricity Boost",
  "water-boost": "Water Boost",
  "fire-boost": "Fire Boost",
  "normal-boost": "Normal Boost",
  "more-drops": "More Drops",
  fishing: "Fishing",
  capture: "Capture",
  eggs: "Eggs / Breeding",
  "base-work": "Base / Work",
};

export const ELEMENT_LABELS: Record<PalElement, string> = {
  normal: "Normal",
  fire: "Fire",
  water: "Water",
  electricity: "Electricity",
  leaf: "Leaf",
  ice: "Ice",
  earth: "Earth",
  dark: "Dark",
  dragon: "Dragon",
};

export const RARITY_LABELS: Record<PalRarity, string> = {
  common: "Common",
  rare: "Rare",
  epic: "Epic",
  legendary: "Legendary",
};
