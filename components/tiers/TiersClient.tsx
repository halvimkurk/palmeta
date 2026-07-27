"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { CompanionIntro } from "@/components/pals/CompanionIntro";
import { CompanionTools } from "@/components/pals/CompanionTools";
import { ElementDots } from "@/components/pals/ElementDots";
import { PalIcon } from "@/components/teams/PalIcon";
import { parseTierRole, type TierGrade, type TierRole } from "@/lib/tiers";
import type { ResolvedTierList } from "@/lib/tiers/resolvedTypes";

type Props = {
  lists: ResolvedTierList[];
  disclaimer: string;
};

const GRADE_HINT: Record<TierGrade, string> = {
  S: "Best in role",
  A: "Excellent",
  B: "Solid",
  C: "Situational",
  D: "Early / niche",
};

export function TiersClient({ lists, disclaimer }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchRef = useRef<HTMLInputElement>(null);
  const [qDraft, setQDraft] = useState(searchParams.get("q") ?? "");
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const role = parseTierRole(searchParams.get("role"));
  const q = searchParams.get("q") ?? "";

  const active = lists.find((l) => l.role === role) ?? lists[0];

  useEffect(() => {
    setQDraft(q);
  }, [q]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target;
      if (
        t instanceof HTMLInputElement ||
        t instanceof HTMLTextAreaElement ||
        t instanceof HTMLSelectElement ||
        (t instanceof HTMLElement && t.isContentEditable)
      ) {
        return;
      }
      e.preventDefault();
      searchRef.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function pushParams(patch: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(patch)) {
      if (value == null || value === "") params.delete(key);
      else params.set(key, value);
    }
    const qs = params.toString();
    router.replace(qs ? `/tiers?${qs}` : "/tiers", { scroll: false });
  }

  function onSearchChange(value: string) {
    setQDraft(value);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => pushParams({ q: value }), 180);
  }

  const query = q.trim().toLowerCase();

  const bands = useMemo(() => {
    if (!active) return [];
    return active.bands
      .map((band) => ({
        ...band,
        entries: band.entries.filter((e) => {
          if (!query) return true;
          const hay = `${e.pal.name} ${e.why} ${e.slug}`.toLowerCase();
          return hay.includes(query);
        }),
      }))
      .filter((b) => b.entries.length > 0);
  }, [active, query]);

  if (!active) {
    return <p className="hub-hint">No tier lists yet.</p>;
  }

  return (
    <div className="tiers-page">
      <CompanionIntro
        tone="tiers"
        eyebrow="Summit Tiers · by role"
        title="Palworld Tier List 1.0"
        lead="Combat, base work, flying mounts, ground mounts, and capture helpers — every S–D placement includes a short why."
      >
        <CompanionTools />
      </CompanionIntro>

      <div className="tiers-controls">
        <div className="tiers-role-bar" role="tablist" aria-label="Tier role">
          {lists.map((list) => (
            <button
              key={list.role}
              type="button"
              role="tab"
              aria-selected={list.role === active.role}
              className={`tiers-role-tab ${list.role === active.role ? "is-active" : ""}`}
              onClick={() => pushParams({ role: list.role as TierRole })}
            >
              {list.label}
            </button>
          ))}
        </div>

        <div className="tiers-controls__meta">
          <p className="tiers-role-lead">{active.description}</p>
          <label className="filter-search tiers-search">
            <span className="filter-search__icon" aria-hidden>
              ⌕
            </span>
            <input
              ref={searchRef}
              type="search"
              placeholder="Filter… (/)"
              value={qDraft}
              onChange={(e) => onSearchChange(e.target.value)}
              aria-label="Filter tier list"
            />
          </label>
        </div>

        {bands.length > 1 ? (
          <div className="tiers-jumps" aria-label="Jump to grade">
            {bands.map((band) => (
              <a key={band.grade} href={`#tier-${band.grade}`} className="tiers-jump">
                <span className={`tier-badge tier-badge--${band.grade}`}>{band.grade}</span>
                <span>{band.entries.length}</span>
              </a>
            ))}
          </div>
        ) : null}
      </div>

      {bands.length === 0 ? (
        <p className="tiers-empty">No pals match “{q}” in {active.label}.</p>
      ) : (
        <div className="tiers-bands">
          {bands.map((band) => (
            <section
              key={band.grade}
              id={`tier-${band.grade}`}
              className={`tier-lane tier-lane--${band.grade}`}
              aria-label={`Tier ${band.grade} · ${GRADE_HINT[band.grade]}`}
            >
              <div className="tier-lane__grade">
                <span className={`tier-badge tier-badge--lg tier-badge--${band.grade}`}>
                  {band.grade}
                </span>
                <span className="tier-lane__hint">{GRADE_HINT[band.grade]}</span>
                <span className="tier-lane__count">{band.entries.length}</span>
              </div>

              <ul className="tier-lane__grid">
                {band.entries.map((entry) => (
                  <li key={entry.slug}>
                    <Link
                      href={`/pals/${entry.slug}`}
                      className="tier-tile"
                      title={entry.why}
                    >
                      <PalIcon pal={entry.pal} size={56} className="tier-tile__icon" />
                      <span className="tier-tile__name">{entry.pal.name}</span>
                      <span className="tier-tile__meta">
                        <ElementDots elements={entry.pal.elements} />
                      </span>
                      <span className="tier-tile__why">{entry.why}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}

      <p className="tiers-footnote">
        {disclaimer} <Link href="/pals">Browse pals</Link> ·{" "}
        <Link href="/breeding">Egg Nest</Link> · <Link href="/teams">Raid Roster</Link>
      </p>
    </div>
  );
}
