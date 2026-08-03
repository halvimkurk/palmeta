import Link from "next/link";
import { CompanionTools } from "@/components/pals/CompanionTools";
import { getGuideCategoryLabel } from "@/lib/guides/catalog";
import type { GuideArticle } from "@/lib/guides/types";

type Props = {
  related: GuideArticle[];
  relatedPalSlugs?: string[];
};

export function GuideRelated({ related, relatedPalSlugs = [] }: Props) {
  return (
    <section className="guide-related" aria-label="Choose your next goal">
      <h2 className="guide-related__title">Choose your next goal</h2>

      {related.length ? (
        <div className="guide-related__guides">
          {related.map((article) => (
            <Link
              key={article.slug}
              href={`/guides/${article.slug}`}
              className="guide-related__link"
            >
              <span className="guide-related__cat">
                {getGuideCategoryLabel(article.category)}
              </span>
              <span className="guide-related__name">{article.title}</span>
            </Link>
          ))}
        </div>
      ) : null}

      {relatedPalSlugs.length ? (
        <div className="guide-related__pals">
          {relatedPalSlugs.map((slug) => (
            <Link
              key={slug}
              href={`/pals/${slug}`}
              className="guide-related__pal"
            >
              {slug.replace(/-/g, " ")}
            </Link>
          ))}
        </div>
      ) : null}

      <CompanionTools />
    </section>
  );
}
