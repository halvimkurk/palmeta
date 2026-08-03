import type { Metadata } from "next";
import { GuideCard } from "@/components/guides/GuideCard";
import { JsonLd } from "@/components/seo/JsonLd";
import { getGuides } from "@/lib/guides/catalog";
import { pageMeta } from "@/lib/seo";
import { breadcrumbJsonLd } from "@/lib/seo/schema";

const DESCRIPTION =
  "Practical Palworld 1.0 guides for progression, breeding, Capture Power, Pal Effigies, towers, and base planning.";

export const metadata: Metadata = pageMeta({
  title: "Palworld 1.0 Guides — Progression, Breeding & Capture",
  description: DESCRIPTION,
  path: "/guides",
});

export default function GuidesIndexPage() {
  const guides = getGuides();

  return (
    <div className="guides-index">
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Guides", path: "/guides" },
          ]),
        ]}
      />

      <header className="guides-index__header">
        <p className="guides-index__eyebrow">Plan your next goal</p>
        <h1 className="guides-index__title">Palworld 1.0 Guides</h1>
        <p className="guides-index__lead">
          Clear routes for the decisions that cost the most time: what to do
          next, which pals to raise, when to breed, and how to stop wasting
          spheres.
        </p>
      </header>

      <div className="guides-index__grid">
        {guides.map((article, index) => (
          <GuideCard
            key={article.slug}
            article={article}
            kicker={String(index + 1).padStart(2, "0")}
          />
        ))}
      </div>
    </div>
  );
}
