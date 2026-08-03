import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GuideBody } from "@/components/guides/GuideBody";
import { GuideRelated } from "@/components/guides/GuideRelated";
import { GuideToc } from "@/components/guides/GuideToc";
import { JsonLd } from "@/components/seo/JsonLd";
import { SeoFaq } from "@/components/seo/SeoFaq";
import {
  getGuideBySlug,
  getGuideCategoryLabel,
  getGuides,
  getRelatedGuides,
} from "@/lib/guides/catalog";
import { pageMeta } from "@/lib/seo";
import { articleJsonLd, breadcrumbJsonLd, faqJsonLd } from "@/lib/seo/schema";

type Props = {
  params: Promise<{ slug: string }>;
};

function formatGuideDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}

export function generateStaticParams() {
  return getGuides().map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = getGuideBySlug(slug);
  if (!article) {
    return pageMeta({
      title: "Guide not found",
      description: "This Palworld guide could not be found.",
      path: `/guides/${slug}`,
      noIndex: true,
    });
  }

  return pageMeta({
    title: article.title,
    description: article.excerpt,
    path: `/guides/${article.slug}`,
    type: "article",
    publishedTime: article.publishedAt,
  });
}

export default async function GuideArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = getGuideBySlug(slug);
  if (!article) notFound();

  const related = getRelatedGuides(article);
  const sections = article.body.flatMap((block) =>
    block.type === "h2" && block.id
      ? [{ id: block.id, text: block.text }]
      : [],
  );

  return (
    <article className="guide-article">
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Guides", path: "/guides" },
            { name: article.title, path: `/guides/${article.slug}` },
          ]),
          articleJsonLd({
            title: article.title,
            description: article.excerpt,
            path: `/guides/${article.slug}`,
            publishedAt: article.publishedAt,
            updatedAt: article.updatedAt,
          }),
          faqJsonLd(article.faq),
        ]}
      />

      <header className="guide-article__header">
        <span className="guide-article__mesh" aria-hidden />
        <div className="guide-article__header-copy">
          <Link href="/guides" className="guide-article__back">
            Guides
          </Link>
          <p className="guide-article__eyebrow">
            {getGuideCategoryLabel(article.category)}
            {article.spoiler ? (
              <>
                <span aria-hidden>·</span>
                <span className="guide-article__spoiler">Spoilers</span>
              </>
            ) : null}
          </p>
          <h1 className="guide-article__title">{article.title}</h1>
          <p className="guide-article__excerpt">{article.excerpt}</p>
          <p className="guide-article__meta">
            Updated {formatGuideDate(article.updatedAt)} · Palworld 1.0
          </p>
        </div>
      </header>

      <div className="guide-article__layout">
        <GuideToc sections={sections} />

        <div className="guide-article__main">
          <GuideBody blocks={article.body} />

          <SeoFaq title="Guide FAQ" items={article.faq} />

          <GuideRelated
            related={related}
            relatedPalSlugs={article.relatedPalSlugs}
          />
        </div>
      </div>
    </article>
  );
}
