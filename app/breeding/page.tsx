import type { Metadata } from "next";
import { BreedingClient } from "@/components/breeding/BreedingClient";
import { JsonLd } from "@/components/seo/JsonLd";
import { SeoFaq } from "@/components/seo/SeoFaq";
import { pageMeta } from "@/lib/seo";
import { BREEDING_FAQ } from "@/lib/seo/faqs";
import { breadcrumbJsonLd, faqJsonLd, webAppJsonLd } from "@/lib/seo/schema";
import { getBreedingMeta, getPals } from "@/lib/teams/catalog";
import { parseBreedingMode } from "@/lib/breeding/url";

const DESCRIPTION =
  "Free Palworld 1.0 breeding calculator — foretell the egg from any parent pair or trace every lineage that yields your target pal.";

export const metadata: Metadata = pageMeta({
  title: "Palworld Breeding Calculator — Find Parents & Predict Eggs",
  description: DESCRIPTION,
  path: "/breeding",
});


export default async function BreedingPage({
  searchParams,
}: {
  searchParams: Promise<{ a?: string; b?: string; child?: string; mode?: string }>;
}) {
  const sp = await searchParams;
  const pals = getPals();
  const { uniqueCombos } = getBreedingMeta();
  const mode = parseBreedingMode(sp);

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
            { name: "Breeding calculator", path: "/breeding" },
          ]),
          faqJsonLd(BREEDING_FAQ),
        ]}
      />
      <BreedingClient
        pals={pals}
        uniqueCombos={uniqueCombos}
        mode={mode}
        parentA={sp.a ?? ""}
        parentB={sp.b ?? ""}
        child={sp.child ?? ""}
      />
      <SeoFaq title="Breeding calculator FAQ" items={BREEDING_FAQ} />
    </>
  );
}
