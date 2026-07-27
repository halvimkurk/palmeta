import type { Metadata } from "next";
import { Suspense } from "react";
import { PalsListClient } from "@/components/pals/PalsListClient";
import { JsonLd } from "@/components/seo/JsonLd";
import { SeoFaq } from "@/components/seo/SeoFaq";
import { pageMeta } from "@/lib/seo";
import { PALS_FAQ } from "@/lib/seo/faqs";
import { breadcrumbJsonLd, faqJsonLd, webAppJsonLd } from "@/lib/seo/schema";
import { getPals } from "@/lib/teams/catalog";
import { getCombatGradeBySlug } from "@/lib/tiers";

const DESCRIPTION =
  "Palworld Paldeck — browse every pal with combat stats, work suitability, partner skills, tier placements, and breeding routes for 1.0.";

export const metadata: Metadata = pageMeta({
  title: "Palworld Paldeck — Stats, Work & Breeding",
  description: DESCRIPTION,
  path: "/pals",
});


export default function PalsPage() {
  const pals = getPals();
  const combatGradeBySlug = getCombatGradeBySlug();

  return (
    <>
      <JsonLd
        data={[
          webAppJsonLd({
            name: "Palworld Paldeck",
            description: DESCRIPTION,
            path: "/pals",
          }),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Paldeck", path: "/pals" },
          ]),
          faqJsonLd(PALS_FAQ),
        ]}
      />
      <Suspense fallback={<p className="hub-hint">Loading pals…</p>}>
        <PalsListClient pals={pals} combatGradeBySlug={combatGradeBySlug} />
      </Suspense>
      <SeoFaq title="Paldeck FAQ" items={PALS_FAQ} />
    </>
  );
}
