import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PalDetailClient } from "@/components/pals/PalDetailClient";
import { JsonLd } from "@/components/seo/JsonLd";
import { getUniqueCombosForPal } from "@/lib/breeding";
import { pageMeta, SITE_NAME, SITE_URL } from "@/lib/seo";
import { breadcrumbJsonLd } from "@/lib/seo/schema";
import { getPalBySlug, getPals, getPresetsForPal } from "@/lib/teams/catalog";
import { getPalIconSrc } from "@/lib/teams/icons";
import { sortPals } from "@/lib/teams/query";
import { ELEMENT_LABELS } from "@/lib/teams/types";
import { findPalTiers } from "@/lib/tiers";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return getPals().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const pal = getPalBySlug(slug);
  if (!pal) return { title: "Pal" };

  const elements = pal.elements.map((e) => ELEMENT_LABELS[e]).join(" / ");
  const description = `${pal.name} (${elements}) — Palworld stats, partner skill “${pal.partnerSkill.name}”, work suitability, breeding routes, and tier placements on ${SITE_NAME}.`;

  return pageMeta({
    title: `${pal.name} — Paldeck`,
    description,
    path: `/pals/${pal.slug}`,
    images: [getPalIconSrc(pal.slug)],
  });
}

export default async function PalDetailPage({ params }: Props) {
  const { slug } = await params;
  const pal = getPalBySlug(slug);
  if (!pal) notFound();

  const ordered = sortPals(getPals(), "name");
  const idx = ordered.findIndex((p) => p.slug === slug);
  const prevSlug = idx > 0 ? ordered[idx - 1]?.slug : undefined;
  const nextSlug = idx >= 0 && idx < ordered.length - 1 ? ordered[idx + 1]?.slug : undefined;
  const tiers = findPalTiers(slug);

  return (
    <>
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "Thing",
            name: pal.name,
            description: pal.partnerSkill.description,
            url: `${SITE_URL}/pals/${pal.slug}`,
            image: `${SITE_URL}${getPalIconSrc(pal.slug)}`,
          },
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Paldeck", path: "/pals" },
            { name: pal.name, path: `/pals/${pal.slug}` },
          ]),
        ]}
      />
      <PalDetailClient
        pal={pal}
        presets={getPresetsForPal(slug)}
        tiers={tiers}
        uniqueCombos={getUniqueCombosForPal(slug)}
        prevSlug={prevSlug}
        nextSlug={nextSlug}
      />
    </>
  );
}
