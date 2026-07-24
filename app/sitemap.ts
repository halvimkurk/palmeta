import type { MetadataRoute } from "next";
import { getBlueNotes } from "@/lib/blues";
import { getNewsArticles } from "@/lib/news";
import { SITE_URL } from "@/lib/seo";
import { getPals } from "@/lib/teams/catalog";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: now, changeFrequency: "weekly", priority: 1 },
    {
      url: `${SITE_URL}/tiers`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.95,
    },
    {
      url: `${SITE_URL}/breeding`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.95,
    },
    {
      url: `${SITE_URL}/teams`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/pals`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/news`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/blues`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.55,
    },
    {
      url: `${SITE_URL}/privacy`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.2,
    },
  ];

  const pals: MetadataRoute.Sitemap = getPals().map((p) => ({
    url: `${SITE_URL}/pals/${p.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const news: MetadataRoute.Sitemap = getNewsArticles().map((a) => ({
    url: `${SITE_URL}/news/${a.slug}`,
    lastModified: new Date(a.updatedAt || a.publishedAt),
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  const blues: MetadataRoute.Sitemap = getBlueNotes().map((n) => ({
    url: `${SITE_URL}/blues/${n.slug}`,
    lastModified: new Date(n.publishedAt),
    changeFrequency: "monthly",
    priority: 0.45,
  }));

  return [...staticRoutes, ...pals, ...news, ...blues];
}
