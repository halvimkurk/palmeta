import type { Metadata } from "next";
import { Suspense } from "react";
import { PalsListClient } from "@/components/pals/PalsListClient";
import { JsonLd } from "@/components/seo/JsonLd";
import { SeoFaq } from "@/components/seo/SeoFaq";
import { pageMeta } from "@/lib/seo";
import { breadcrumbJsonLd, faqJsonLd, webAppJsonLd } from "@/lib/seo/schema";
import { getPals } from "@/lib/teams/catalog";
import { getCombatGradeBySlug } from "@/lib/tiers";

const DESCRIPTION =
  "Palworld Paldeck — browse every pal with combat stats, work suitability, partner skills, tier placements, and breeding calculator links for 1.0.";

export const metadata: Metadata = pageMeta({
  title: "Palworld Paldeck — Stats, Work & Breeding",
  description: DESCRIPTION,
  path: "/pals",
});

const FAQ = [
  {
    q: "What is the Paldeck on Palworld Meta?",
    a: "It is a sortable, filterable list of pals with stats, work levels, partner skills, and combat tier badges — open any pal for the full sheet.",
  },
  {
    q: "Can I sort pals by combat tier?",
    a: "Yes. Use Sort: Tier or click the Tier column header to rank by combat grade (S first), then name.",
  },
  {
    q: "Does each pal link to breeding and tier lists?",
    a: "Yes. Pal sheets show tier placements, work stats, and one-click links to the breeding calculator for parent pairs or reverse lookup.",
  },
];

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
          faqJsonLd(FAQ),
        ]}
      />
      <Suspense fallback={<p className="hub-hint">Loading pals…</p>}>
        <PalsListClient pals={pals} combatGradeBySlug={combatGradeBySlug} />
      </Suspense>
      <SeoFaq title="Paldeck FAQ" items={FAQ} />
    </>
  );
}
