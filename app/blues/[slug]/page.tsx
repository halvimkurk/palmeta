import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getBlueNoteBySlug, getBlueNotes } from "@/lib/blues";
import type { BlueBlock } from "@/lib/blues/types";
import { JsonLd } from "@/components/seo/JsonLd";
import { pageMeta } from "@/lib/seo";
import { articleJsonLd, breadcrumbJsonLd } from "@/lib/seo/schema";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getBlueNotes().map((n) => ({ slug: n.slug }));
}

export const dynamicParams = true;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const note = getBlueNoteBySlug(slug);
  if (!note) return { title: "Dev Blues" };
  return pageMeta({
    title: note.title,
    description: note.summary,
    path: `/blues/${note.slug}`,
    type: "article",
    publishedTime: note.publishedAt,
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

function BlockView({ block }: { block: BlueBlock }) {
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

export default async function BlueNotePage({ params }: Props) {
  const { slug } = await params;
  const note = getBlueNoteBySlug(slug);
  if (!note) notFound();

  const related = getBlueNotes()
    .filter((n) => n.slug !== slug)
    .slice(0, 3);

  return (
    <article className="news-article blues-article">
      <JsonLd
        data={[
          articleJsonLd({
            title: note.title,
            description: note.summary,
            path: `/blues/${note.slug}`,
            publishedAt: note.publishedAt,
          }),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Dev Blues", path: "/blues" },
            { name: note.title, path: `/blues/${note.slug}` },
          ]),
        ]}
      />
      <header className="news-article__head">
        <p className="news-article__crumb">
          <Link href="/blues">Dev Blues</Link>
          <span aria-hidden> / </span>
          <time dateTime={note.publishedAt}>{formatDate(note.publishedAt)}</time>
        </p>
        <p className="blues-kicker">Blue tracker</p>
        <h1>{note.title}</h1>
        <div className="news-card__meta">
          {note.tags.map((t) => (
            <span key={t} className="news-card__tag">
              {t}
            </span>
          ))}
        </div>
      </header>

      <div className="news-article__content prose">
        {note.body.map((block, i) => (
          <BlockView key={`${block.type}-${i}`} block={block} />
        ))}
      </div>

      <p className="blues-article__source">
        Source:{" "}
        <a href={note.sourceUrl} target="_blank" rel="noopener noreferrer">
          {note.sourceName} ↗
        </a>
      </p>

      <p className="news-article__cta">
        <Link href="/blues" className="btn btn--ghost">
          All Dev Blues
        </Link>
        <Link href="/tiers?role=combat" className="btn btn--primary">
          Summit Tiers
        </Link>
      </p>

      {related.length > 0 && (
        <section className="section">
          <h2 className="section__title">More blues</h2>
          <ul className="news-related">
            {related.map((r) => (
              <li key={r.id}>
                <Link href={`/blues/${r.slug}`}>
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
