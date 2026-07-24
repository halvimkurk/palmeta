export type BlueBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "ul"; items: string[] };

export type BlueNote = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  publishedAt: string;
  sourceName: string;
  sourceUrl: string;
  tags: string[];
  body: BlueBlock[];
};

export type BluesCatalog = {
  version: string;
  generatedAt: string;
  notes: BlueNote[];
};
