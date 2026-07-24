import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";
import { getNewsArticles } from "@/lib/news";
import { pageMeta } from "@/lib/seo";
import { breadcrumbJsonLd } from "@/lib/seo/schema";

export const metadata: Metadata = pageMeta({
  title: "Palworld News",
  description:
    "Palworld patch notes and community news condensed into short briefs — what changed and what it means for your roster.",
  path: "/news",
});

function formatDate(iso: string) {
  try {
    return new Intl.DateTimeFormat("en", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(iso));
  } catch {
    return iso.slice(0, 10);
  }
}

export default function NewsIndexPage() {
  const articles = getNewsArticles();

  return (
    <div>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "News", path: "/news" },
        ])}
      />
      <header className="page-head page-head--news">
        <h1>News</h1>
        <p>
          Patch notes and Palworld coverage, condensed into short briefs — what changed and
          what it means for your roster.
        </p>
      </header>

      {articles.length === 0 ? (
        <div className="empty-state">
          <p className="empty-state__kicker">Quiet on the islands</p>
          <h2>No articles yet</h2>
          <p>Check back after the next patch.</p>
        </div>
      ) : (
        <ul className="news-grid news-grid--text">
          {articles.map((a) => (
            <li key={a.id} className="news-card news-card--text">
              <Link href={`/news/${a.slug}`} className="news-card__link">
                <div className="news-card__body">
                  <div className="news-card__meta">
                    <time dateTime={a.publishedAt}>{formatDate(a.publishedAt)}</time>
                    {a.tags.slice(0, 3).map((t) => (
                      <span key={t} className="news-card__tag">
                        {t}
                      </span>
                    ))}
                  </div>
                  <h2>{a.title}</h2>
                  <p>{a.excerpt}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
