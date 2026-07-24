import { describe, expect, it } from "vitest";
import { filterPals, sortPals, topWorks, type Pal } from "@/lib/teams";
import { getPals } from "@/lib/teams/catalog";
import { getTierList } from "@/lib/tiers";
import { resolveTierList } from "@/lib/tiers/resolve";

const sample: Pal[] = [
  {
    slug: "jetragon",
    name: "Jetragon",
    elements: ["dragon"],
    rarity: "legendary",
    dexNo: 111,
    partnerSkill: {
      name: "Aerial Missile",
      description: "Flying nuke",
      tags: ["flying-mount", "combat-buffs"],
    },
    work: { gathering: 3 },
  },
  {
    slug: "anubis",
    name: "Anubis",
    elements: ["earth"],
    rarity: "epic",
    dexNo: 100,
    partnerSkill: {
      name: "Guardian",
      description: "Earth worker",
      tags: ["base-work"],
    },
    work: { handiwork: 6, mining: 6, transporting: 4 },
  },
];

describe("filterPals work", () => {
  it("filters by work and min level", () => {
    const out = filterPals(sample, { work: "mining", workMin: 5 });
    expect(out.map((p) => p.slug)).toEqual(["anubis"]);
  });

  it("sorts by focused work descending", () => {
    expect(
      sortPals(sample, "work", "mining").map((p) => p.slug),
    ).toEqual(["anubis", "jetragon"]);
  });
});

describe("topWorks", () => {
  it("returns highest levels first", () => {
    expect(topWorks(sample[1]!.work, 2)).toEqual([
      { id: "handiwork", level: 6 },
      { id: "mining", level: 6 },
    ]);
  });
});

describe("catalog work merge", () => {
  it("attaches work levels to curated pals", () => {
    const anubis = getPals().find((p) => p.slug === "anubis");
    expect(anubis?.work?.handiwork).toBe(6);
    expect(anubis?.work?.mining).toBe(6);
  });
});

describe("tier catalog", () => {
  it("resolves combat S pals from catalog", () => {
    const list = getTierList("combat");
    expect(list).toBeTruthy();
    const { bands, missingSlugs } = resolveTierList(list!);
    expect(missingSlugs).toEqual([]);
    const s = bands.find((b) => b.grade === "S");
    expect(s?.entries.some((e) => e.slug === "jetragon")).toBe(true);
    expect(s?.entries.every((e) => e.why.length > 0)).toBe(true);
  });
});
