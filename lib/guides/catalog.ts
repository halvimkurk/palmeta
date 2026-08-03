import guidesJson from "@/data/guides/articles.json";
import type { GuideArticle, GuidesCatalog } from "@/lib/guides/types";

const catalog = guidesJson as GuidesCatalog;

export function getGuides(): GuideArticle[] {
  return [...catalog.articles].sort((a, b) =>
    b.updatedAt.localeCompare(a.updatedAt),
  );
}

export function getGuideBySlug(slug: string): GuideArticle | undefined {
  return catalog.articles.find((a) => a.slug === slug);
}

export function getFeaturedGuides(limit = 3): GuideArticle[] {
  const featured = catalog.articles.filter((a) => a.featured);
  const pool = featured.length ? featured : getGuides();
  return pool.slice(0, limit);
}

export function getRelatedGuides(
  article: GuideArticle,
  limit = 3,
): GuideArticle[] {
  const bySlug = new Map(catalog.articles.map((a) => [a.slug, a]));
  const fromMeta = (article.relatedGuideSlugs ?? [])
    .map((s) => bySlug.get(s))
    .filter((a): a is GuideArticle => Boolean(a));

  if (fromMeta.length >= limit) return fromMeta.slice(0, limit);

  const extras = getGuides().filter(
    (a) =>
      a.slug !== article.slug &&
      !fromMeta.some((m) => m.slug === a.slug) &&
      (a.category === article.category ||
        a.tags.some((t) => article.tags.includes(t))),
  );

  return [...fromMeta, ...extras].slice(0, limit);
}

export function getGuideCategoryLabel(category: GuideArticle["category"]) {
  const labels: Record<GuideArticle["category"], string> = {
    beginner: "Beginner",
    progression: "Progression",
    bosses: "Bosses",
    base: "Base",
    capture: "Capture",
    collectibles: "Collectibles",
    endgame: "Endgame",
  };
  return labels[category];
}
