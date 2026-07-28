import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  PalDetailClient,
  type BreedPalRef,
  type UniqueBreedComboView,
} from "@/components/pals/PalDetailClient";
import { JsonLd } from "@/components/seo/JsonLd";
import { getUniqueCombosForPal } from "@/lib/breeding";
import {
  buildPalPageDescription,
  buildPalPageTitle,
  buildPalSeoIntro,
  buildPalStructuredDescription,
} from "@/lib/seo/pal-meta";
import { pageMeta, SITE_URL } from "@/lib/seo";
import { breadcrumbJsonLd } from "@/lib/seo/schema";
import { getPalBySlug, getPals, getPresetsForPal } from "@/lib/teams/catalog";
import { getPalIconSrc } from "@/lib/teams/icons";
import type { PalElement } from "@/lib/teams/types";
import { findPalTiers } from "@/lib/tiers";

type Props = {
  params: Promise<{ slug: string }>;
};

function slugToDisplayName(slug: string) {
  return slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function toBreedPalRef(slug: string): BreedPalRef {
  const pal = getPalBySlug(slug);
  if (pal) {
    return { slug: pal.slug, name: pal.name, elements: pal.elements };
  }
  return {
    slug,
    name: slugToDisplayName(slug),
    elements: ["normal"] as PalElement[],
  };
}

function resolveUniqueCombos(slug: string): UniqueBreedComboView[] {
  return getUniqueCombosForPal(slug).map((c) => ({
    parentA: toBreedPalRef(c.parents[0] ?? ""),
    parentB: toBreedPalRef(c.parents[1] ?? ""),
    child: toBreedPalRef(c.child),
  }));
}

export async function generateStaticParams() {
  return getPals().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const pal = getPalBySlug(slug);
  if (!pal) return { title: "Pal" };

  const tiers = findPalTiers(slug);

  return pageMeta({
    title: buildPalPageTitle(pal, tiers),
    description: buildPalPageDescription(pal, tiers),
    path: `/pals/${pal.slug}`,
    images: [getPalIconSrc(pal.slug)],
  });
}

export default async function PalDetailPage({ params }: Props) {
  const { slug } = await params;
  const pal = getPalBySlug(slug);
  if (!pal) notFound();

  const tiers = findPalTiers(slug);
  const seoIntro = buildPalSeoIntro(pal, tiers);
  const structuredDescription = buildPalStructuredDescription(pal, tiers);

  return (
    <>
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "Thing",
            name: pal.name,
            description: structuredDescription,
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
        uniqueCombos={resolveUniqueCombos(slug)}
        seoIntro={seoIntro}
      />
    </>
  );
}
