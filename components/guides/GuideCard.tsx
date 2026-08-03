import Link from "next/link";
import { getGuideCategoryLabel } from "@/lib/guides/catalog";
import type { GuideArticle } from "@/lib/guides/types";

type Props = {
  article: GuideArticle;
  kicker?: string;
};

function formatGuideDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}

export function GuideCard({ article, kicker }: Props) {
  return (
    <Link href={`/guides/${article.slug}`} className="guide-card">
      {kicker ? <span className="guide-card__kicker">{kicker}</span> : null}
      <span className="guide-card__meta">
        {getGuideCategoryLabel(article.category)}
        <span aria-hidden>·</span>
        Updated {formatGuideDate(article.updatedAt)}
      </span>
      <span className="guide-card__title">{article.title}</span>
      <span className="guide-card__excerpt">{article.excerpt}</span>
    </Link>
  );
}
