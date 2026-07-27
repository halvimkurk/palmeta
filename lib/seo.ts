import type { Metadata } from "next";

/** Production origin until thepaldex.com DNS is pointed here. */
export const PRODUCTION_SITE_URL = "https://palworld-achievements.vercel.app";
/** Planned custom domain — switch PRODUCTION_SITE_URL when live. */
export const BRAND_DOMAIN = "thepaldex.com";

/** Canonical origin — preview uses VERCEL_URL; prod uses PRODUCTION_SITE_URL. */
function resolveSiteUrl(): string {
  if (process.env.VERCEL_ENV === "preview" && process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  if (process.env.NODE_ENV === "development") {
    const local = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
    return local ?? "http://localhost:3000";
  }

  return PRODUCTION_SITE_URL;
}

export const SITE_URL = resolveSiteUrl();
export const SITE_HOST = new URL(SITE_URL).host;
export const SITE_NAME = "ThePaldex";
export const SITE_TAGLINE = "The island changed. So did the ranks.";

export const DEFAULT_DESCRIPTION =
  "ThePaldex — Palworld 1.0 companion: role tier lists, a breeding calculator for parent pairs and reverse lookup, a party builder with meta comps, and a full Paldeck with stats and work suitability.";

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
