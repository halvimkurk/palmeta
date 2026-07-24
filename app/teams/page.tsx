import type { Metadata } from "next";
import { Suspense } from "react";
import { JsonLd } from "@/components/seo/JsonLd";
import { SeoFaq } from "@/components/seo/SeoFaq";
import { TeamBuilderClient } from "@/components/teams/TeamBuilderClient";
import { pageMeta } from "@/lib/seo";
import { breadcrumbJsonLd, faqJsonLd, webAppJsonLd } from "@/lib/seo/schema";
import { getPals, getTeamPresets } from "@/lib/teams/catalog";

const DESCRIPTION =
  "Palworld team builder for 1.0 — load researched meta comps or build a party of five around partner-skill synergies, then save and share your roster.";

export const metadata: Metadata = pageMeta({
  title: "Palworld Team Builder",
  description: DESCRIPTION,
  path: "/teams",
});

const FAQ = [
  {
    q: "What are the best Palworld meta teams in 1.0?",
    a: "Top meta comps on Palworld Meta cover Orserk bullet-ramp parties, Gobfin weapon stacks, Libero raid leads, and utility builds for fishing or hauling. Load a comp into the builder, then swap for boss weakness.",
  },
  {
    q: "Do partner skills stack in Palworld 1.0?",
    a: "Most duplicate auras no longer stack. Gobfin Angry Shark still stacks for player Attack, and Orserk’s bullet ramp stacks with itself on the active Pal. Prefer distinct species for other buffs.",
  },
  {
    q: "Can I save custom teams?",
    a: "Yes. Built parties save in your browser localStorage so you can reload them later without an account.",
  },
];

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
          faqJsonLd(FAQ),
        ]}
      />
      <Suspense fallback={<p className="hub-hint">Loading team builder…</p>}>
        <TeamBuilderClient pals={pals} presets={presets} />
      </Suspense>
      <SeoFaq title="Team builder FAQ" items={FAQ} />
    </>
  );
}
