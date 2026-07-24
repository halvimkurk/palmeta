"use client";

import Link from "next/link";
import { CompanionTools } from "@/components/pals/CompanionTools";
import { ElementDots } from "@/components/pals/ElementDots";
import { PalIcon } from "@/components/teams/PalIcon";
import type { UniqueCombo } from "@/lib/breeding/engine";
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

type Props = {
  pal: Pal;
  presets: TeamPreset[];
  tiers: TierHit[];
  uniqueCombos: UniqueCombo[];
  prevSlug?: string;
  nextSlug?: string;
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
}: Props) {
  const works = WORK_ORDER.filter((id) => (pal.work?.[id] ?? 0) > 0)
    .map((id) => ({ id, level: pal.work![id]! }))
    .sort((a, b) => b.level - a.level);
  const topWork = works[0];
  const stats = pal.stats;

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

          {(topTiers.length > 0 || topWork) && (
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
          Breeding
        </Link>
        <Link href="/tiers" className="chip chip--link chip--ghost">
          Tier lists
        </Link>
        <Link href="/pals" className="chip chip--link chip--ghost">
          ← Paldeck
        </Link>
      </div>

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

          <section className="pal-detail__panel pal-detail__panel--skill">
            <p className="pal-detail__panel-kicker">Partner skill</p>
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
                  <li key={`${c.parents.join("-")}-${c.child}`}>
                    <Link
                      href={`/breeding?a=${c.parents[0] ?? ""}&b=${c.parents[1] ?? ""}`}
                      className="pal-detail__breed-card"
                    >
                      <span className="pal-detail__breed-formula">
                        <em>{c.parents[0]}</em>
                        <span aria-hidden>×</span>
                        <em>{c.parents[1]}</em>
                        <span aria-hidden>→</span>
                        <strong>{c.child}</strong>
                      </span>
                      <span className="pal-detail__breed-cta">Open calculator</span>
                    </Link>
                  </li>
                ))}
              </ul>
              <p className="pal-detail__more">
                <Link href={`/breeding?child=${pal.slug}`}>More catalog parents →</Link>
              </p>
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
