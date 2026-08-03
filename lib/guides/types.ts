export const GUIDE_CATEGORIES = [
  "beginner",
  "progression",
  "bosses",
  "base",
  "capture",
  "collectibles",
  "endgame",
] as const;

export type GuideCategory = (typeof GUIDE_CATEGORIES)[number];

export type GuideTool = "breeding" | "tiers" | "teams" | "pals" | "map";

export type GuideBlock =
  | { type: "tldr"; items: string[] }
  | { type: "p"; text: string }
  | { type: "h2"; text: string; id?: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | {
      type: "callout";
      kind: "tip" | "warn" | "patch";
      title?: string;
      text: string;
    }
  | {
      type: "table";
      caption?: string;
      headers: string[];
      rows: string[][];
    }
  | {
      type: "image";
      src: string;
      alt: string;
      caption?: string;
    }
  | {
      type: "toolCta";
      tool: GuideTool;
      href: string;
      label: string;
      hint?: string;
    };

export type GuideFaq = { q: string; a: string };

export type GuideSourceRef = { name: string; url: string };

export type GuideArticle = {
  slug: string;
  title: string;
  excerpt: string;
  category: GuideCategory;
  tags: string[];
  publishedAt: string;
  updatedAt: string;
  featured?: boolean;
  spoiler?: boolean;
  relatedGuideSlugs?: string[];
  relatedPalSlugs?: string[];
  faq: GuideFaq[];
  body: GuideBlock[];
  sourceRefs: GuideSourceRef[];
};

export type GuidesCatalog = {
  version: number;
  articles: GuideArticle[];
};
