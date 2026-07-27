/** Visible FAQ copy + JSON-LD source. Keep questions conversational; answers short and factual. */

export type FaqItem = { q: string; a: string };

export const HOME_FAQ: FaqItem[] = [
  {
    q: "What is Paldex?",
    a: "A free fan-made toolkit for Palworld 1.0 — tier lists, a breeding calculator, team builder, and Paldeck. Not affiliated with Pocketpair.",
  },
  {
    q: "Is the breeding calculator up to date?",
    a: "Yes. It runs on our 1.0 breeding catalog. Pick two parents to see the egg, or pick a target pal to find parent pairs. Your picks stay in the URL so you can share a combo.",
  },
  {
    q: "How do the tier lists work?",
    a: "Pals are ranked by role — combat, base work, mounts, catching — because a great fighter is not always a great worker. Switch tabs to see each list.",
  },
  {
    q: "Can I save or share teams?",
    a: "Yes. Your party encodes in the URL, and saved rosters stay in your browser — no account needed.",
  },
];

export const TIERS_FAQ: FaqItem[] = [
  {
    q: "Who should I use for combat in 1.0?",
    a: "Open the Combat tab and scan S-tier first — endgame picks like Jetragon, Bellanoir Libero, and Frostallion cover most boss fights. Swap for the boss element you are facing.",
  },
  {
    q: "Why not one overall tier list?",
    a: "A top fighter can be mediocre at base work, and a fast mount might not hit hard. Splitting by role keeps each list useful for the job you are doing.",
  },
  {
    q: "How do I find a pal on this page?",
    a: "Use the search box or press / to filter the active list by name.",
  },
  {
    q: "When do rankings change?",
    a: "After major Palworld patches. We recheck S–D placements against current meta and in-catalog stats.",
  },
];

export const BREEDING_FAQ: FaqItem[] = [
  {
    q: "How do I use the breeding calculator?",
    a: "Two modes: pick two parents and see the child, or pick a target pal and browse valid parent pairs. Useful before you spend cakes on a long chain.",
  },
  {
    q: "Can I breed toward a specific pal?",
    a: "Yes — reverse lookup lists combinations that produce your target, like Anubis or Jormuntide Ignis.",
  },
  {
    q: "Can I share a combo with a friend?",
    a: "Yes. The URL updates as you pick parents (?a= and ?b=) or a target (?child=). Copy the link from your address bar.",
  },
  {
    q: "Does this cover legendaries and special rules?",
    a: "Standard combi math from our catalog. Some legendaries have extra rules — check the pal's detail page if something looks off.",
  },
];

export const TEAMS_FAQ: FaqItem[] = [
  {
    q: "What teams are people running in 1.0?",
    a: "Browse Meta comps for starters — Orserk bullet builds, Gobfin weapon stacks, Libero raid parties, and utility setups. Swap pals for the boss element you need.",
  },
  {
    q: "Do partner skills stack?",
    a: "Mostly no — duplicate auras from the same species usually do not stack. Gobfin's Angry Shark still stacks player Attack, and Orserk's ramp stacks on the active Pal.",
  },
  {
    q: "Can I share my party?",
    a: "Yes. Add pals and copy the URL — all five slots encode in the link.",
  },
  {
    q: "Do I need an account to save teams?",
    a: "No. Custom rosters save in your browser's local storage.",
  },
];

export const PALS_FAQ: FaqItem[] = [
  {
    q: "What's in the Paldeck?",
    a: "Every pal in our catalog with stats, work levels, partner skills, and tier badges. Click any row for the full sheet.",
  },
  {
    q: "Can I sort by combat tier?",
    a: "Yes — use Sort: Tier or click the Tier column to rank S through D, then by name.",
  },
  {
    q: "Where do I go from a pal's page?",
    a: "Each pal links to tier lists, breeding pairs, and team presets where we have data.",
  },
];
