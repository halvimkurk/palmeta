import { describe, expect, it } from "vitest";
import { findParentsForChild, predictOffspring } from "@/lib/breeding";
import { getPalBySlug, getPals } from "@/lib/teams/catalog";

describe("combat stats merge", () => {
  it("attaches hp/melee for Anubis", () => {
    const anubis = getPalBySlug("anubis");
    expect(anubis?.stats?.hp).toBe(120);
    expect(anubis?.stats?.melee).toBe(130);
    expect(anubis?.breeding?.combiRank).toBe(480);
  });

  it("covers the full catalog", () => {
    const withStats = getPals().filter((p) => p.stats?.hp);
    expect(withStats.length).toBe(getPals().length);
    expect(getPals().length).toBeGreaterThanOrEqual(287);
  });
});

describe("breeding predict", () => {
  it("returns unique combo for known variant", () => {
    const result = predictOffspring("mossanda", "grizzbolt");
    expect(result.kind).toBe("unique");
    expect(result.childSlug).toBe("mossanda-lux");
  });

  it("returns a formula child for same-parent breed", () => {
    const result = predictOffspring("lamball", "lamball");
    expect(result.kind).toBe("formula");
    expect(result.childSlug).toBeTruthy();
    expect(result.targetRank).toBeTypeOf("number");
  });

  it("finds catalog parents for a target", () => {
    const pairs = findParentsForChild("anubis", 10);
    expect(pairs.length).toBeGreaterThan(0);
    expect(pairs.every((p) => p.a.slug && p.b.slug)).toBe(true);
  });
});
