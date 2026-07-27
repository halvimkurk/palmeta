import type { Metadata } from "next";
import { Suspense } from "react";
import { JsonLd } from "@/components/seo/JsonLd";
import { SeoFaq } from "@/components/seo/SeoFaq";
import { TeamBuilderClient } from "@/components/teams/TeamBuilderClient";
import { pageMeta } from "@/lib/seo";
import { TEAMS_FAQ } from "@/lib/seo/faqs";
import { breadcrumbJsonLd, faqJsonLd, webAppJsonLd } from "@/lib/seo/schema";
import { getPals, getTeamPresets } from "@/lib/teams/catalog";

const DESCRIPTION =
  "Palworld 1.0 team builder — march under meta comps or forge a party of five around partner-skill synergies, with rosters you can save and share.";

export const metadata: Metadata = pageMeta({
  title: "Palworld Team Builder — Meta Comps & Party of 5",
  description: DESCRIPTION,
  path: "/teams",
});


export default function TeamsPage() {
  const pals = getPals();
  const presets = getTeamPresets();

  return (
    <>
      <JsonLd
        data={[
          webAppJsonLd({
            name: "Palworld Team Builder",
            description: DESCRIPTION,
            path: "/teams",
          }),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Team builder", path: "/teams" },
          ]),
          faqJsonLd(TEAMS_FAQ),
        ]}
      />
      <Suspense fallback={<p className="hub-hint">Loading team builder…</p>}>
        <TeamBuilderClient pals={pals} presets={presets} />
      </Suspense>
      <SeoFaq title="Team builder FAQ" items={TEAMS_FAQ} />
    </>
  );
}
