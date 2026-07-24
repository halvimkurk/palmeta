export type NewsBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "ul"; items: string[] };

export type NewsSourceRef = {
  name: string;
  url: string;
};

export type NewsArticle = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string;
  updatedAt: string;
  tags: string[];
  body: NewsBlock[];
  /** Internal provenance — not required on the page, kept for re-ingest. */
  sourceRefs: NewsSourceRef[];
};

export type NewsCatalog = {
  version: string;
  generatedAt: string;
  articles: NewsArticle[];
};
