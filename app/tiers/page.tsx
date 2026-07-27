import type { Metadata } from "next";
import { Suspense } from "react";
import { JsonLd } from "@/components/seo/JsonLd";
import { SeoFaq } from "@/components/seo/SeoFaq";
import { TiersClient } from "@/components/tiers/TiersClient";
import { pageMeta } from "@/lib/seo";
import { breadcrumbJsonLd, faqJsonLd, webAppJsonLd } from "@/lib/seo/schema";
import { getTierLists, getTiersCatalog } from "@/lib/tiers";
import { resolveAllTierLists } from "@/lib/tiers/resolve";

const DESCRIPTION =
  "Palworld 1.0 tier list by role — combat, base workers, flying mounts, ground mounts, and catching helpers. Every S–D placement includes a short why.";

export const metadata: Metadata = pageMeta({
  title: "Palworld Tier List 1.0",
  description: DESCRIPTION,
  path: "/tiers",
});

const FAQ = [
  {
    q: "What is the best Palworld combat tier list for 1.0?",
    a: "Combat S-tier on Palworld Meta prioritizes endgame carries and supports such as Jetragon, Bellanoir Libero, Frostallion, Jormuntide Ignis, Orserk, and stackable Gobfin support — always read the short why notes for your boss element.",
  },
  {
    q: "Why split tiers by role instead of one overall list?",
    a: "A top combat Pal can be average at base work. Role lists keep rankings useful for bosses, ranching, flyers, ground travel, and capture economy.",
  },
  {
    q: "How often are tier lists updated?",
    a: "Placements track Palworld 1.0 meta and catalog work stats. After major patches, combat and worker bands are re-checked against public coverage and in-catalog numbers.",
  },
];

export default function TiersPage() {
  const catalog = getTiersCatalog();
  const lists = resolveAllTierLists(getTierLists());

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
            { name: "Summit Tiers", path: "/tiers" },
          ]),
          faqJsonLd(FAQ),
        ]}
      />
      <Suspense fallback={<p className="hub-hint">Loading tiers…</p>}>
        <TiersClient lists={lists} disclaimer={catalog.disclaimer} />
      </Suspense>
      <SeoFaq title="Tier list FAQ" items={FAQ} />
    </>
  );
}
