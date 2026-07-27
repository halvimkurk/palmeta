import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";
import { SeoFaq } from "@/components/seo/SeoFaq";
import { TiersClient } from "@/components/tiers/TiersClient";
import { pageMeta } from "@/lib/seo";
import { TIERS_FAQ } from "@/lib/seo/faqs";
import { breadcrumbJsonLd, faqJsonLd, webAppJsonLd } from "@/lib/seo/schema";
import { getTierLists, getTiersCatalog, parseTierRole } from "@/lib/tiers";
import { resolveAllTierLists } from "@/lib/tiers/resolve";

const DESCRIPTION =
  "Palworld 1.0 tier list by role — combat, base workers, flying mounts, ground mounts, and catching helpers. Every S–D rank comes with placement notes for bosses, ranching, and travel.";

export const metadata: Metadata = pageMeta({
  title: "Palworld Tier List 1.0 — Combat, Work & Mounts",
  description: DESCRIPTION,
  path: "/tiers",
});


export default async function TiersPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string; q?: string }>;
}) {
  const sp = await searchParams;
  const catalog = getTiersCatalog();
  const lists = resolveAllTierLists(getTierLists());
  const role = parseTierRole(sp.role);
  const q = sp.q ?? "";

  return (
    <>
      <JsonLd
        data={[
          webAppJsonLd({
            name: "Palworld Tier List",
            description: DESCRIPTION,
            path: "/tiers",
          }),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Tier list", path: "/tiers" },
          ]),
          faqJsonLd(TIERS_FAQ),
        ]}
      />
      <TiersClient lists={lists} disclaimer={catalog.disclaimer} role={role} q={q} />
      <SeoFaq title="Tier list FAQ" items={TIERS_FAQ} />
    </>
  );
}
