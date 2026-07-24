import type { Metadata } from "next";

export const SITE_URL = "https://palmeta.app";
export const SITE_NAME = "Palworld Meta";
export const SITE_TAGLINE =
  "Unofficial Palworld 1.0 toolkit — tier lists, breeding calculator, team builder, and Paldeck.";

export const DEFAULT_DESCRIPTION =
  "Palworld 1.0 toolkit: role tier lists with reasons, a breeding calculator for parent pairs and reverse lookup, a party builder with meta comps, and a full Paldeck with stats and work suitability.";

/** Build absolute page metadata with canonical + social cards. */
export function pageMeta(opts: {
  title: string;
  description: string;
  path: string;
  type?: "website" | "article";
  publishedTime?: string;
  images?: string[];
  noIndex?: boolean;
}): Metadata {
  const url = new URL(opts.path, SITE_URL).toString();
  const images = opts.images?.length
    ? opts.images.map((url) => ({ url }))
    : [{ url: "/opengraph-image", width: 1200, height: 630, alt: SITE_NAME }];

  return {
    title: opts.title,
    description: opts.description,
    alternates: { canonical: opts.path },
    robots: opts.noIndex
      ? { index: false, follow: true }
      : { index: true, follow: true },
    openGraph: {
      title: opts.title.includes(SITE_NAME) ? opts.title : `${opts.title} · ${SITE_NAME}`,
      description: opts.description,
      url,
      siteName: SITE_NAME,
      type: opts.type ?? "website",
      locale: "en_US",
      images,
      ...(opts.publishedTime ? { publishedTime: opts.publishedTime } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: opts.title.includes(SITE_NAME) ? opts.title : `${opts.title} · ${SITE_NAME}`,
      description: opts.description,
      images: opts.images?.length ? opts.images : ["/opengraph-image"],
    },
  };
}
