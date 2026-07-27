import type { Metadata } from "next";
import { Suspense } from "react";
import { BreedingClient } from "@/components/breeding/BreedingClient";
import { JsonLd } from "@/components/seo/JsonLd";
import { SeoFaq } from "@/components/seo/SeoFaq";
import { pageMeta } from "@/lib/seo";
import { breadcrumbJsonLd, faqJsonLd, webAppJsonLd } from "@/lib/seo/schema";
import { getBreedingMeta, getPals } from "@/lib/teams/catalog";

const DESCRIPTION =
  "Free Palworld breeding calculator for 1.0 — predict the egg from any parent pair, or reverse-lookup every combo that produces a target pal.";

export const metadata: Metadata = pageMeta({
  title: "Palworld Breeding Calculator",
  description: DESCRIPTION,
  path: "/breeding",
});

const FAQ = [
  {
    q: "How does the Palworld breeding calculator work?",
    a: "Pick two parents to see the predicted child, or choose a target pal to list valid parent combinations from the site catalog. Use results to plan chains before you spend cakes.",
  },
  {
    q: "Can I find parents for a specific pal?",
    a: "Yes. Reverse lookup mode lists combinations that produce your target so you can breed toward Anubis, Jormuntide Ignis, or other goals instead of guessing pairs.",
  },
  {
    q: "Is this calculator for Palworld 1.0?",
    a: "Yes. Combos are driven by the curated Palworld Meta breeding data for the current catalog. Legendary and special rules still require checking the pal sheet notes when relevant.",
  },
];

export default function BreedingPage() {
  const pals = getPals();
  const { uniqueCombos } = getBreedingMeta();

  return (
    <>
      <JsonLd
        data={[
          webAppJsonLd({
            name: "Palworld Breeding Calculator",
            description: DESCRIPTION,
            path: "/breeding",
          }),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Egg Nest", path: "/breeding" },
          ]),
          faqJsonLd(FAQ),
        ]}
      />
      <Suspense fallback={<p className="hub-hint">Loading breeding…</p>}>
        <BreedingClient pals={pals} uniqueCombos={uniqueCombos} />
      </Suspense>
      <SeoFaq title="Breeding calculator FAQ" items={FAQ} />
    </>
  );
}
