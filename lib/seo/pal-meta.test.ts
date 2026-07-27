import { describe, expect, it } from "vitest";
import { getPalBySlug } from "@/lib/teams/catalog";
import { findPalTiers } from "@/lib/tiers";
import {
  TOP_PAL_SLUGS,
  buildPalPageDescription,
  buildPalPageTitle,
  buildPalSeoIntro,
  isTopPalSlug,
} from "@/lib/seo/pal-meta";

describe("pal-meta", () => {
  it("defines exactly 30 top pal slugs that exist in catalog", () => {
    expect(TOP_PAL_SLUGS).toHaveLength(30);
    for (const slug of TOP_PAL_SLUGS) {
      expect(getPalBySlug(slug), slug).toBeTruthy();
    }
  });

  it("builds distinct descriptions for combat S-tier pals", () => {
    const a = buildPalPageDescription(
      getPalBySlug("jetragon")!,
      findPalTiers("jetragon"),
    );
    const b = buildPalPageDescription(
      getPalBySlug("anubis")!,
      findPalTiers("anubis"),
    );
    expect(a).toContain("Jetragon");
    expect(a).toContain("S-tier combat");
    expect(b).toContain("Anubis");
    expect(a).not.toBe(b);
  });

  it("uses intent titles for top pals", () => {
    const title = buildPalPageTitle(getPalBySlug("orserk")!, findPalTiers("orserk"));
    expect(title).toContain("Orserk Palworld");
    expect(title).toContain("Combat Tier");
  });

  it("returns seo intro for every pal", () => {
    expect(buildPalSeoIntro(getPalBySlug("jetragon")!, findPalTiers("jetragon"))).toMatch(
      /Jetragon/,
    );
    expect(buildPalSeoIntro(getPalBySlug("lamball")!, findPalTiers("lamball"))).toMatch(
      /Lamball/,
    );
    expect(isTopPalSlug("gobfin")).toBe(true);
    expect(isTopPalSlug("lamball")).toBe(false);
  });

  it("writes prose seo intros instead of tier bullet lists", () => {
    const intro = buildPalSeoIntro(getPalBySlug("knocklem")!, findPalTiers("knocklem"));
    expect(intro).toMatch(/Knocklem is an epic Earth pal/);
    expect(intro).toMatch(/Rock Crusher/);
    expect(intro).not.toMatch(/Combat tier/);
    expect(intro).not.toMatch(/Base workers/);
    expect(intro).not.toMatch(/Best base work on this sheet/);
  });
});
