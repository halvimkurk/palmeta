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

export function PalDetailClient({
  pal,
  presets,
  tiers,
  uniqueCombos,
  prevSlug,
  nextSlug,
}: Props) {
  const works = WORK_ORDER
    .filter((id) => (pal.work?.[id] ?? 0) > 0)
    .map((id) => ({ id, level: pal.work![id]! }))
    .sort((a, b) => b.level - a.level);
  const stats = pal.stats;

  return (
    <article className="pal-detail">
      <CompanionTools />
      <header className={`page-head pal-detail__head el-wash-${pal.elements[0]}`}>
        <PalIcon pal={pal} size={88} className="pal-detail__portrait" decorative={false} />
        <div>
          <p className="pal-detail__eyebrow">
            {pal.dexNo != null ? `#${pal.dexNo} · ` : null}
            <span className={`pal-rarity-chip rarity-${pal.rarity}`}>
              {RARITY_LABELS[pal.rarity]}
            </span>
            {pal.isNew ? " · NEW" : ""}
          </p>
          <h1>{pal.name}</h1>
          <ElementDots elements={pal.elements} labeled />
          <p className="pal-detail__desc">{pal.partnerSkill.description}</p>
        </div>
      </header>

      <div className="pal-detail__actions">
        <Link
          href={`/teams?team=${encodeTeamParam([pal.slug, null, null, null, null])}`}
          className="chip chip--link"
        >
          Add to team
        </Link>
        <Link href="/pals" className="chip chip--link chip--ghost">
          ← Pals list
        </Link>
        <Link href={`/breeding?child=${pal.slug}`} className="chip chip--link chip--ghost">
          Breeding
        </Link>
        <Link href="/tiers" className="chip chip--link chip--ghost">
          Tier lists
        </Link>
      </div>

      {stats ? (
        <section className="pal-detail__block">
          <h2>Combat stats</h2>
          <ul className="pal-detail__stats">
            {(
              [
                ["HP", stats.hp],
                ["Melee", stats.melee],
                ["Shot", stats.shot],
                ["Defense", stats.defense],
                ["Support", stats.support],
                ["Stamina", stats.stamina],
                ["Run", stats.runSpeed],
                ["Sprint", stats.rideSprintSpeed],
              ] as const
            )
              .filter(([, v]) => v != null)
              .map(([label, value]) => (
                <li key={label}>
                  <span>{label}</span>
                  <strong>{value}</strong>
                </li>
              ))}
          </ul>
          {pal.breeding?.ignoreCombi ? (
            <p className="pal-detail__combi">
              Cannot be bred from standard pairs — capture or hatch from a unique combo.
            </p>
          ) : null}
        </section>
      ) : null}

      <section className="pal-detail__block">
        <h2>Partner skill</h2>
        <p className="pal-detail__skill-name">{pal.partnerSkill.name}</p>
        <p>{pal.partnerSkill.description}</p>
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

      <section className="pal-detail__block">
        <h2>Work suitability</h2>
        {works.length === 0 ? (
          <p className="hub-hint">No work levels recorded for this Pal yet.</p>
        ) : (
          <ul className="pal-detail__work-grid">
            {works.map((w) => (
              <li key={w.id}>
                <Link
                  href={`/pals?work=${w.id}&workMin=${w.level}&sort=work`}
                  className="pal-detail__work-link"
                >
                  <span>{WORK_LABELS[w.id]}</span>
                  <strong>{w.level}</strong>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {uniqueCombos.length > 0 ? (
        <section className="pal-detail__block">
          <h2>Unique breeding</h2>
          <ul className="detail__party-list">
            {uniqueCombos.map((c) => (
              <li key={`${c.parents.join("-")}-${c.child}`}>
                <Link
                  href={`/breeding?a=${c.parents[0] ?? ""}&b=${c.parents[1] ?? ""}`}
                  className="detail__party-link"
                >
                  <strong>
                    {c.parents.join(" × ")} → {c.child}
                  </strong>
                  <span>Open in breeding calculator</span>
                </Link>
              </li>
            ))}
          </ul>
          <p className="hub-hint">
            <Link href={`/breeding?child=${pal.slug}`}>Find more catalog parents →</Link>
          </p>
        </section>
      ) : pal.breeding ? (
        <section className="pal-detail__block">
          <h2>Breeding</h2>
          <p className="hub-hint">
            <Link href={`/breeding?child=${pal.slug}`}>Find catalog parents for {pal.name}</Link>
          </p>
        </section>
      ) : null}

      {tiers.length > 0 ? (
        <section className="pal-detail__block">
          <h2>Tier placements</h2>
          <ul className="pal-detail__tiers">
            {tiers.map((t) => (
              <li key={`${t.role}-${t.grade}`}>
                <Link href={`/tiers?role=${t.role}`} className="pal-detail__tier-link">
                  <span className={`tier-badge tier-badge--${t.grade}`}>{t.grade}</span>
                  <span>
                    <strong>{t.label}</strong>
                    <span>{t.why}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {presets.length > 0 ? (
        <section className="pal-detail__block">
          <h2>Team presets</h2>
          <ul className="detail__party-list">
            {presets.map((p) => (
              <li key={p.id}>
                <Link href={`/teams?preset=${p.id}`} className="detail__party-link">
                  <strong>{p.name}</strong>
                  <span>{p.description}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <nav className="pal-detail__nav" aria-label="Adjacent pals">
        {prevSlug ? <Link href={`/pals/${prevSlug}`}>← Prev</Link> : <span />}
        {nextSlug ? <Link href={`/pals/${nextSlug}`}>Next →</Link> : <span />}
      </nav>
    </article>
  );
}
