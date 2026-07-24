import newsJson from "@/data/news/articles.json";
import type { NewsArticle, NewsCatalog } from "@/lib/news/types";

const catalog = newsJson as NewsCatalog;

export function getNewsCatalog(): NewsCatalog {
  return catalog;
}

export function getNewsArticles(): NewsArticle[] {
  return [...catalog.articles].sort(
    (a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt),
  );
}

export function getNewsArticleBySlug(slug: string): NewsArticle | undefined {
  return catalog.articles.find((a) => a.slug === slug);
}

export function getRelatedNews(slug: string, limit = 3): NewsArticle[] {
  const current = getNewsArticleBySlug(slug);
  if (!current) return getNewsArticles().slice(0, limit);
  const tagSet = new Set(current.tags);
  return getNewsArticles()
    .filter((a) => a.slug !== slug)
    .map((a) => ({
      a,
      score: a.tags.reduce((n, t) => n + (tagSet.has(t) ? 1 : 0), 0),
    }))
    .sort((x, y) => y.score - x.score || Date.parse(y.a.publishedAt) - Date.parse(x.a.publishedAt))
    .slice(0, limit)
    .map((x) => x.a);
}
