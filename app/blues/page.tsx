import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";
import { getBlueNotes } from "@/lib/blues";
import { pageMeta } from "@/lib/seo";
import { breadcrumbJsonLd } from "@/lib/seo/schema";

export const metadata: Metadata = pageMeta({
  title: "Palworld Dev Notes",
  description:
    "Pocketpair developer notes and patch announcements for Palworld — a blue-tracker style feed with short summaries and source links.",
  path: "/blues",
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

export default function BluesPage() {
  const notes = getBlueNotes();

  return (
    <div>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Dev notes", path: "/blues" },
        ])}
      />
      <header className="page-head page-head--news">
        <p className="blues-kicker">Blue tracker</p>
        <h1>Dev notes</h1>
        <p>
          Curated Pocketpair announcements and patch callouts — official word from the
          studio, summarized for quick reading. Open a note for the full brief.
        </p>
      </header>

      <ul className="blues-list">
        {notes.map((n) => (
          <li key={n.id} className="blues-card">
            <Link href={`/blues/${n.slug}`} className="blues-card__link">
              <div className="blues-card__meta">
                <span className="blues-card__badge">Blue</span>
                <time dateTime={n.publishedAt}>{formatDate(n.publishedAt)}</time>
                {n.tags.slice(0, 3).map((t) => (
                  <span key={t} className="news-card__tag">
                    {t}
                  </span>
                ))}
              </div>
              <h2 className="blues-card__title">{n.title}</h2>
              <p className="blues-card__summary">{n.summary}</p>
              <span className="blues-card__more">Read note →</span>
            </Link>
          </li>
        ))}
      </ul>

      <p className="blues-foot">
        Looking for community briefs? <Link href="/news">News</Link>
      </p>
    </div>
  );
}
