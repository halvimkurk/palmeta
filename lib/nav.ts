/** Shared nav / page titles — keep sidebar and page h1s in sync. */

export const NAV = {
  tiers: {
    href: "/tiers?role=combat",
    match: "/tiers",
    label: "Summit Tiers",
    icon: "tiers",
    hint: "Role power ranks",
  },
  breeding: {
    href: "/breeding",
    match: "/breeding",
    label: "Egg Nest",
    icon: "eggs",
    hint: "What hatches next",
  },
  teams: {
    href: "/teams",
    match: "/teams",
    label: "Raid Roster",
    icon: "teams",
    hint: "Party of five",
  },
  pals: {
    href: "/pals",
    match: "/pals",
    label: "Paldeck",
    icon: "pals",
    hint: "Every pal sheet",
  },
  blues: {
    href: "/blues",
    match: "/blues",
    label: "Dev Blues",
    icon: "blues",
    hint: "Studio word",
  },
  news: {
    href: "/news",
    match: "/news",
    label: "Island Briefs",
    icon: "news",
    hint: "Patch & field notes",
  },
} as const;

export const TOOL_NAV = [NAV.tiers, NAV.breeding, NAV.teams, NAV.pals] as const;
export const FEED_NAV = [NAV.blues, NAV.news] as const;

export type NavIconName = (typeof NAV)[keyof typeof NAV]["icon"];
