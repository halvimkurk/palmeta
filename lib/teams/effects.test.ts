import { describe, expect, it } from "vitest";
import { aggregateTeamEffects } from "@/lib/teams/effects";
import { encodeTeamParam, parseTeamParam } from "@/lib/teams/url";
import { getPalBySlug } from "@/lib/teams/catalog";

describe("aggregateTeamEffects", () => {
  it("stacks Gobfin player attack", () => {
    const g = getPalBySlug("gobfin")!;
    const effects = aggregateTeamEffects([g, g, g, null, null]);
    expect(effects.stacks).toHaveLength(1);
    expect(effects.stacks[0].value).toBe(30);
    expect(effects.stacks[0].label).toContain("30%");
    expect(effects.stacks[0].sources).toHaveLength(3);
  });

  it("lists unique non-stack skills", () => {
    const j = getPalBySlug("jetragon")!;
    const a = getPalBySlug("anubis")!;
    const effects = aggregateTeamEffects([j, a, null, null, null]);
    expect(effects.uniques.map((u) => u.palSlug).sort()).toEqual([
      "anubis",
      "jetragon",
    ]);
  });
});

describe("team URL", () => {
  it("round-trips five slots", () => {
    const slots = ["gobfin", null, "anubis", "jetragon", null];
    const encoded = encodeTeamParam(slots);
    expect(encoded).toBe("gobfin,,anubis,jetragon,");
    expect(parseTeamParam(encoded)).toEqual(slots);
  });
});
