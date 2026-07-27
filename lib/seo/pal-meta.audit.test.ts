import { describe, expect, it } from "vitest";
import { getPals } from "@/lib/teams/catalog";
import { findPalTiers } from "@/lib/tiers";
import { buildPalPageDescription, buildPalSeoIntro, isTopPalSlug } from "@/lib/seo/pal-meta";

describe("pal descriptions audit", () => {
  const pals = getPals();

  it("every pal has partner skill name and description", () => {
    const missing: string[] = [];
    for (const pal of pals) {
      if (!pal.partnerSkill.name?.trim()) missing.push(`${pal.slug}: no skill name`);
      if (!pal.partnerSkill.description?.trim()) missing.push(`${pal.slug}: no skill description`);
    }
    expect(missing, missing.join("\n")).toEqual([]);
  });

  it("every pal has a meta description", () => {
    const missing: string[] = [];
    for (const pal of pals) {
      const desc = buildPalPageDescription(pal, findPalTiers(pal.slug));
      if (!desc?.trim() || desc.length < 40) missing.push(`${pal.slug}: short/missing meta (${desc?.length ?? 0})`);
    }
    expect(missing, missing.join("\n")).toEqual([]);
  });

  it("every pal has a visible seo intro", () => {
    const missing: string[] = [];
    const thin: string[] = [];
    for (const pal of pals) {
      const intro = buildPalSeoIntro(pal, findPalTiers(pal.slug));
      if (!intro?.trim()) missing.push(pal.slug);
      else if (intro.length < 60) thin.push(`${pal.slug} (${intro.length})`);
    }
    expect(missing, `missing seo intro (${missing.length}):\n${missing.join(", ")}`).toEqual([]);
    expect(thin, `thin seo intro:\n${thin.join("\n")}`).toEqual([]);
  });

  it("reports top-pal coverage", () => {
    const top = pals.filter((p) => isTopPalSlug(p.slug));
    expect(top).toHaveLength(30);
  });
});
