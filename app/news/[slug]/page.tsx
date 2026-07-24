import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  getNewsArticleBySlug,
  getNewsArticles,
  getRelatedNews,
} from "@/lib/news";
import type { NewsBlock } from "@/lib/news/types";
import { pageMeta } from "@/lib/seo";
import { articleJsonLd, breadcrumbJsonLd } from "@/lib/seo/schema";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getNewsArticles().map((a) => ({ slug: a.slug }));
}

export const dynamicParams = true;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = getNewsArticleBySlug(slug);
  if (!article) return { title: "News" };
  return pageMeta({
    title: article.title,
    description: article.excerpt,
    path: `/news/${article.slug}`,
    type: "article",
    publishedTime: article.publishedAt,
  });
}

function formatDate(iso: string) {
  try {
    return new Intl.DateTimeFormat("en", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(iso));
  } catch {
    return iso.slice(0, 10);
  }
}

function BlockView({ block }: { block: NewsBlock }) {
  if (block.type === "h2") return <h2>{block.text}</h2>;
  if (block.type === "ul") {
    return (
      <ul>
        {block.items.map((item) => (
          <li key={item.slice(0, 48)}>{item}</li>
        ))}
      </ul>
    );
  }
  return <p>{block.text}</p>;
}

export default async function NewsArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = getNewsArticleBySlug(slug);
  if (!article) notFound();

  const related = getRelatedNews(slug, 3);

  return (
    <article className="news-article">
      <JsonLd
        data={[
          articleJsonLd({
            title: article.title,
            description: article.excerpt,
            path: `/news/${article.slug}`,
            publishedAt: article.publishedAt,
            updatedAt: article.updatedAt,
          }),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "News", path: "/news" },
            { name: article.title, path: `/news/${article.slug}` },
          ]),
        ]}
      />
      <header className="news-article__head">
        <p className="news-article__crumb">
          <Link href="/news">News</Link>
          <span aria-hidden> / </span>
          <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time>
        </p>
        <h1>{article.title}</h1>
        <div className="news-card__meta">
          {article.tags.map((t) => (
            <span key={t} className="news-card__tag">
              {t}
            </span>
          ))}
        </div>
      </header>

      <div className="news-article__content prose">
        {article.body.map((block, i) => (
          <BlockView key={`${block.type}-${i}`} block={block} />
        ))}
      </div>

      <p className="news-article__cta">
        <Link href="/tiers?role=combat" className="btn btn--primary">
          Tier list
        </Link>
        <Link href="/breeding" className="btn btn--ghost">
          Breeding calculator
        </Link>
      </p>

      {related.length > 0 && (
        <section className="section">
          <h2 className="section__title">More news</h2>
          <ul className="news-related">
            {related.map((r) => (
              <li key={r.id}>
                <Link href={`/news/${r.slug}`}>
                  <span className="news-related__title">{r.title}</span>
                  <time dateTime={r.publishedAt}>{formatDate(r.publishedAt)}</time>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
