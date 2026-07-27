"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { CompanionTools } from "@/components/pals/CompanionTools";
import { ElementDots } from "@/components/pals/ElementDots";
import { ElementBadge } from "@/components/teams/ElementBadge";
import { PalIcon } from "@/components/teams/PalIcon";
import { NAV } from "@/lib/nav";
import {
  EFFECT_TAG_LABELS,
  RARITY_LABELS,
  WORK_LABELS,
  WORK_ORDER,
  encodeTeamParam,
  type Pal,
  type TeamPreset,
} from "@/lib/teams";
import type { TierGrade, TierRole } from "@/lib/tiers/types";

type TierHit = {
  role: TierRole;
  label: string;
  grade: TierGrade;
  why: string;
};

/** Minimal pal ref for unique breeding formula cards. */
export type BreedPalRef = Pick<Pal, "slug" | "name" | "elements">;

export type UniqueBreedComboView = {
  parentA: BreedPalRef;
  parentB: BreedPalRef;
  child: BreedPalRef;
};

type Props = {
  pal: Pal;
  presets: TeamPreset[];
  tiers: TierHit[];
  uniqueCombos: UniqueBreedComboView[];
  prevSlug?: string;
  nextSlug?: string;
  seoIntro?: string;
};

const COMBAT_KEYS = [
  ["HP", "hp"],
  ["Melee", "melee"],
  ["Shot", "shot"],
  ["Defense", "defense"],
  ["Support", "support"],
  ["Stamina", "stamina"],
] as const;

const MOVE_KEYS = [
  ["Run", "runSpeed"],
  ["Sprint", "rideSprintSpeed"],
] as const;

function gradeRank(g: TierGrade) {
  return { S: 0, A: 1, B: 2, C: 3, D: 4 }[g] ?? 9;
}

export function PalDetailClient({
  pal,
  presets,
  tiers,
  uniqueCombos,
  prevSlug,
  nextSlug,
  seoIntro,
}: Props) {
  const works = WORK_ORDER.filter((id) => (pal.work?.[id] ?? 0) > 0)
    .map((id) => ({ id, level: pal.work![id]! }))
    .sort((a, b) => b.level - a.level);
  const topWork = works[0];
  const stats = pal.stats;
  const actives = pal.actives ?? [];
  const activesRef = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.hash === "#active-skills" && activesRef.current) {
      activesRef.current.open = true;
    }
  }, []);

  const combatStats = stats
    ? COMBAT_KEYS.flatMap(([label, key]) => {
        const value = stats[key];
        return value == null ? [] : [{ label, value }];
      })
    : [];
  const moveStats = stats
    ? MOVE_KEYS.flatMap(([label, key]) => {
        const value = stats[key];
        return value == null ? [] : [{ label, value }];
      })
    : [];
  const combatMax = Math.max(1, ...combatStats.map((s) => s.value));
  const moveMax = Math.max(1, ...moveStats.map((s) => s.value));

  const topTiers = [...tiers].sort((a, b) => gradeRank(a.grade) - gradeRank(b.grade));

  return (
    <article className="pal-detail">
      <CompanionTools />

      <header className={`pal-detail__hero el-wash-${pal.elements[0]}`}>
        <PalIcon pal={pal} size={112} className="pal-detail__portrait" decorative={false} />
        <div className="pal-detail__hero-main">
          <p className="pal-detail__eyebrow">
            {pal.dexNo != null ? <span className="pal-detail__dex">#{pal.dexNo}</span> : null}
            <span className={`pal-rarity-chip rarity-${pal.rarity}`}>
              {RARITY_LABELS[pal.rarity]}
            </span>
            {pal.isNew ? <span className="pal-detail__new">NEW</span> : null}
          </p>
          <h1 className="pal-detail__name">{pal.name}</h1>
          <ElementDots elements={pal.elements} labeled />

          {(topTiers.length > 0 || topWork || pal.partnerSkill.name) && (
            <ul className="pal-detail__highlights" aria-label="Key highlights">
              {topTiers.slice(0, 3).map((t) => (
                <li key={`${t.role}-${t.grade}`}>
                  <Link href={`/tiers?role=${t.role}`} className="pal-detail__hl">
                    <span className={`tier-badge tier-badge--${t.grade}`}>{t.grade}</span>
                    <span className="pal-detail__hl-label">{t.label}</span>
                  </Link>
                </li>
              ))}
              {topWork ? (
                <li>
                  <Link
                    href={`/pals?work=${topWork.id}&workMin=${topWork.level}&sort=work`}
                    className="pal-detail__hl pal-detail__hl--work"
                  >
                    <span className="pal-detail__hl-num">{topWork.level}</span>
                    <span className="pal-detail__hl-label">{WORK_LABELS[topWork.id]}</span>
                  </Link>
                </li>
              ) : null}
              <li>
                <a href="#primary-skill" className="pal-detail__hl pal-detail__hl--skill">
                  <span className="pal-detail__hl-kicker">Primary</span>
                  <span className="pal-detail__hl-label">{pal.partnerSkill.name}</span>
                </a>
              </li>
            </ul>
          )}
        </div>
      </header>

      <div className="pal-detail__actions">
        <Link
          href={`/teams?team=${encodeTeamParam([pal.slug, null, null, null, null])}`}
          className="chip chip--link chip--accent"
        >
          Add to team
        </Link>
        <Link href={`/breeding?child=${pal.slug}`} className="chip chip--link chip--ghost">
          {NAV.breeding.label}
        </Link>
        <Link href="/tiers" className="chip chip--link chip--ghost">
          {NAV.tiers.label}
        </Link>
        <Link href="/pals" className="chip chip--link chip--ghost">
          ← {NAV.pals.label}
        </Link>
      </div>

      {seoIntro ? (
        <p className="pal-detail__seo-intro">{seoIntro}</p>
      ) : null}

      <div className="pal-detail__columns">
        <div className="pal-detail__col">
          {combatStats.length > 0 ? (
            <section className="pal-detail__panel">
              <h2 className="pal-detail__panel-title">Combat stats</h2>
              <ul className="pal-detail__stat-bars">
                {combatStats.map((s) => {
                  const pct = Math.round((s.value / combatMax) * 100);
                  const hot = s.value >= combatMax * 0.92;
                  return (
                    <li
                      key={s.label}
                      className={hot ? "pal-detail__stat is-hot" : "pal-detail__stat"}
                    >
                      <div className="pal-detail__stat-top">
                        <span>{s.label}</span>
                        <strong>{s.value}</strong>
                      </div>
                      <div
                        className="pal-detail__stat-track"
                        role="presentation"
                        aria-hidden
                      >
                        <span style={{ width: `${pct}%` }} />
                      </div>
                    </li>
                  );
                })}
              </ul>
              {moveStats.length > 0 ? (
                <ul className="pal-detail__move-stats">
                  {moveStats.map((s) => {
                    const pct = Math.round((s.value / moveMax) * 100);
                    return (
                      <li key={s.label}>
                        <span>{s.label}</span>
                        <strong>{s.value}</strong>
                        <div className="pal-detail__stat-track" aria-hidden>
                          <span style={{ width: `${pct}%` }} />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : null}
              {pal.breeding?.ignoreCombi ? (
                <p className="pal-detail__note">
                  Cannot be bred from standard pairs — capture or hatch from a unique combo.
                </p>
              ) : null}
            </section>
          ) : null}

          <section
            id="primary-skill"
            className="pal-detail__panel pal-detail__panel--skill"
          >
            <p className="pal-detail__panel-kicker">Primary skill</p>
            <h2 className="pal-detail__skill-name">{pal.partnerSkill.name}</h2>
            <p className="pal-detail__skill-desc">{pal.partnerSkill.description}</p>
            <ul className="pal-detail__tags">
              {pal.partnerSkill.tags.map((t) => (
                <li key={t}>
                  <Link href={`/pals?effect=${t}`} className="chip chip--link">
                    {EFFECT_TAG_LABELS[t]}
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          {actives.length > 0 ? (
            <details
              ref={activesRef}
              id="active-skills"
              className="pal-detail__panel pal-detail__panel--actives"
            >
              <summary className="pal-detail__actives-summary">
                <span className="pal-detail__actives-summary-main">
                  <span className="pal-detail__panel-title pal-detail__panel-title--inline">
                    Active skills
                  </span>
                  <span className="pal-detail__actives-count">
                    {actives.length} moves
                  </span>
                </span>
                <span className="pal-detail__actives-toggle">
                  <span className="pal-detail__actives-toggle-show">Show</span>
                  <span className="pal-detail__actives-toggle-hide">Hide</span>
                  <span className="pal-detail__actives-chevron" aria-hidden />
                </span>
              </summary>
              <ul className="pal-detail__actives-list">
                {actives.map((sk) => (
                  <li key={`${sk.level}-${sk.name}`} className="pal-detail__active">
                    <div className="pal-detail__active-top">
                      <span className="pal-detail__active-lv">Lv {sk.level}</span>
                      <div className="pal-detail__active-main">
                        <strong className="pal-detail__active-name">{sk.name}</strong>
                        {sk.description ? (
                          <p className="pal-detail__active-desc">{sk.description}</p>
                        ) : null}
                      </div>
                      <ElementBadge element={sk.element} size={22} className="pal-detail__active-el" />
                      <span className="pal-detail__active-stat" title="Power">
                        <span className="pal-detail__active-stat-key">Power</span>
                        <span className="pal-detail__active-stat-val">{sk.power}</span>
                      </span>
                      <span className="pal-detail__active-stat" title="Cooldown">
                        <span className="pal-detail__active-stat-key">CD</span>
                        <span className="pal-detail__active-stat-val">{sk.cooldown}s</span>
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </details>
          ) : null}
        </div>

        <div className="pal-detail__col">
          <section className="pal-detail__panel">
            <h2 className="pal-detail__panel-title">Work suitability</h2>
            {works.length === 0 ? (
              <p className="pal-detail__note">No work levels recorded for this Pal yet.</p>
            ) : (
              <ul className="pal-detail__work-tiles">
                {works.map((w, i) => (
                  <li key={w.id}>
                    <Link
                      href={`/pals?work=${w.id}&workMin=${w.level}&sort=work`}
                      className={
                        i === 0
                          ? "pal-detail__work-tile is-top"
                          : "pal-detail__work-tile"
                      }
                    >
                      <strong>{w.level}</strong>
                      <span>{WORK_LABELS[w.id]}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {tiers.length > 0 ? (
            <section className="pal-detail__panel">
              <h2 className="pal-detail__panel-title">Tier placements</h2>
              <ul className="pal-detail__tier-cards">
                {topTiers.map((t) => (
                  <li key={`${t.role}-${t.grade}`}>
                    <Link
                      href={`/tiers?role=${t.role}`}
                      className={`pal-detail__tier-card grade-${t.grade}`}
                    >
                      <span className={`tier-badge tier-badge--lg tier-badge--${t.grade}`}>
                        {t.grade}
                      </span>
                      <span className="pal-detail__tier-copy">
                        <strong>{t.label}</strong>
                        <span>{t.why}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {uniqueCombos.length > 0 ? (
            <section className="pal-detail__panel">
              <h2 className="pal-detail__panel-title">Unique breeding</h2>
              <ul className="pal-detail__breed-list">
                {uniqueCombos.map((c) => (
                  <li key={`${c.parentA.slug}-${c.parentB.slug}-${c.child.slug}`}>
                    <UniqueBreedCard combo={c} currentSlug={pal.slug} />
                  </li>
                ))}
              </ul>
              {pal.breeding && !pal.breeding.ignoreCombi ? (
                <p className="pal-detail__more">
                  <Link href={`/breeding?child=${pal.slug}`}>More catalog parents →</Link>
                </p>
              ) : null}
            </section>
          ) : pal.breeding ? (
            <section className="pal-detail__panel">
              <h2 className="pal-detail__panel-title">Breeding</h2>
              <Link href={`/breeding?child=${pal.slug}`} className="pal-detail__breed-card">
                <span className="pal-detail__breed-formula">
                  Find catalog parents for <strong>{pal.name}</strong>
                </span>
                <span className="pal-detail__breed-cta">Open calculator</span>
              </Link>
            </section>
          ) : null}

          {presets.length > 0 ? (
            <section className="pal-detail__panel">
              <h2 className="pal-detail__panel-title">Team presets</h2>
              <ul className="pal-detail__preset-list">
                {presets.map((p) => (
                  <li key={p.id}>
                    <Link href={`/teams?preset=${p.id}`} className="pal-detail__preset-card">
                      <strong>{p.name}</strong>
                      <span>{p.description}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      </div>

      <nav className="pal-detail__nav" aria-label="Adjacent pals">
        {prevSlug ? <Link href={`/pals/${prevSlug}`}>← Prev</Link> : <span />}
        {nextSlug ? <Link href={`/pals/${nextSlug}`}>Next →</Link> : <span />}
      </nav>
    </article>
  );
}

function UniqueBreedCard({
  combo,
  currentSlug,
}: {
  combo: UniqueBreedComboView;
  currentSlug: string;
}) {
  const isChild = combo.child.slug === currentSlug;
  const roleLabel = isChild ? "Only from" : "Breeds into";
  const href = `/breeding?a=${combo.parentA.slug}&b=${combo.parentB.slug}`;

  return (
    <Link href={href} className="pal-detail__breed-card">
      <span className="pal-detail__breed-meta">
        <span className="pal-detail__breed-role">{roleLabel}</span>
        <span className="pal-detail__breed-tag">Unique</span>
      </span>
      <span className="pal-detail__breed-formula" aria-hidden>
        <BreedFormulaPal refPal={combo.parentA} isYou={combo.parentA.slug === currentSlug} />
        <span className="pal-detail__breed-op">×</span>
        <BreedFormulaPal refPal={combo.parentB} isYou={combo.parentB.slug === currentSlug} />
        <span className="pal-detail__breed-op">→</span>
        <BreedFormulaPal refPal={combo.child} isYou={isChild} emphasize />
      </span>
      <span className="sr-only">
        {combo.parentA.name} times {combo.parentB.name} yields {combo.child.name}. Open calculator.
      </span>
      <span className="pal-detail__breed-cta">Open calculator</span>
    </Link>
  );
}

function BreedFormulaPal({
  refPal,
  isYou,
  emphasize = false,
}: {
  refPal: BreedPalRef;
  isYou: boolean;
  emphasize?: boolean;
}) {
  return (
    <span className={`pal-detail__breed-pal ${emphasize ? "is-result" : ""} ${isYou ? "is-you" : ""}`}>
      <PalIcon pal={refPal} size={40} />
      <span className="pal-detail__breed-pal-name">{refPal.name}</span>
      {isYou ? <span className="pal-detail__breed-you">You</span> : null}
    </span>
  );
}
