/** Shared nav / page titles — keep sidebar and page h1s in sync. */

export const NAV = {
  tiers: {
    href: "/tiers?role=combat",
    match: "/tiers",
    label: "Tier List",
    eyebrow: "Ranked by role",
    lead: "War-champions, ranch-hands, sky steeds, and catchers — each path to the summit keeps its own court, and every pal earns a verdict on the climb.",
    hint: "Who rules combat, work & travel",
    icon: "tiers",
  },
  breeding: {
    href: "/breeding",
    match: "/breeding",
    label: "Breeding Calculator",
    eyebrow: "Lineage & nests",
    lead: "Pair two parents and read the omen in the egg, or name the hatchling you seek and trace every bloodline that might deliver it.",
    hint: "Foretell the hatch, trace the sire",
    icon: "eggs",
  },
  teams: {
    href: "/teams",
    match: "/teams",
    label: "Team Builder",
    eyebrow: "Party of five",
    lead: "Forge a five-pal war band, let partner auras weave into one rhythm, or march under a banner already proven in the meta.",
    hint: "Five souls, one battle rhythm",
    icon: "teams",
  },
  pals: {
    href: "/pals",
    match: "/pals",
    label: "Paldeck",
    eyebrow: "The bestiary",
    lead: "Every creature in the catalog — hunt by element or calling, sort by the stat that matters, and open any pal's chronicle of skills, work, and breeding roads.",
    hint: "Stats, skills & every pal's tale",
    icon: "pals",
  },
  map: {
    href: "/map?mode=hunt",
    match: "/map",
    label: "Map",
    eyebrow: "Palpagos fields",
    lead: "Alphas on the ridgeline, spawns in the brush, effigies and fast-travel stones — chart the island before you set out.",
    hint: "Alphas, spawns & hidden shrines",
    icon: "map",
  },
} as const;

export const TOOL_NAV = [NAV.pals, NAV.tiers, NAV.breeding, NAV.teams] as const;

export type NavIconName = (typeof NAV)[keyof typeof NAV]["icon"];
