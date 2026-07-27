import type { ReactNode } from "react";
import Link from "next/link";
import { PalIcon } from "@/components/teams/PalIcon";
import {
  EFFECT_TAG_LABELS,
  TEAM_SIZE,
  type EffectTag,
  type Pal,
  type TeamPresetStatus,
} from "@/lib/teams/types";
import { toneForTag } from "@/lib/teams/effectTone";

type Props = {
  name: string;
  description?: string;
  tier?: "S" | "A" | "B" | "C";
  status?: TeamPresetStatus;
  team: (string | null)[];
  palMap: Map<string, Pal>;
  traits?: EffectTag[];
  active?: boolean;
  meta?: string;
  onSelect: () => void;
  secondary?: ReactNode;
};

export function CompCard({
  name,
  description,
  tier,
  status = "current",
  team,
  palMap,
  traits = [],
  active = false,
  meta,
  onSelect,
  secondary,
}: Props) {
  const slots = Array.from({ length: TEAM_SIZE }, (_, i) => {
    const slug = team[i] ?? null;
    return slug ? palMap.get(slug) ?? null : null;
  });
  const outdated = status === "outdated";

  return (
    <article
      className={`comp-card ${active ? "is-active" : ""} ${outdated ? "is-outdated" : ""}`}
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
    >
      <div className="comp-card__main">
        {tier ? (
          <span className={`tier-badge tier-badge--sm tier-badge--${tier}`} aria-label={`Tier ${tier}`}>
            {tier}
          </span>
        ) : (
          <span className="comp-card__tier-spacer" aria-hidden />
        )}

        <div className="comp-card__body">
          <div className="comp-card__titles">
            <h3 className="comp-card__name">{name}</h3>
            {outdated ? (
              <span className="comp-card__status comp-card__status--outdated" title="No longer top meta — kept for reference">
                Outdated
              </span>
            ) : null}
            {meta ? <span className="comp-card__meta">{meta}</span> : null}
          </div>

          {traits.length > 0 ? (
            <div className="comp-card__traits">
              {traits.slice(0, 3).map((t) => (
                <span key={t} className={`effect-badge effect-badge--${toneForTag(t)}`}>
                  {EFFECT_TAG_LABELS[t]}
                </span>
              ))}
            </div>
          ) : null}

          <ul className="comp-card__units" aria-label={`${name} party`}>
            {slots.map((pal, i) => (
              <li key={`${name}-${i}`} className={`comp-unit ${pal ? "" : "is-empty"}`}>
                {pal ? (
                  <Link
                    href={`/pals/${pal.slug}`}
                    className="comp-unit__link"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <PalIcon pal={pal} size={44} className="comp-unit__icon" />
                    <span className="comp-unit__name">{pal.name}</span>
                  </Link>
                ) : (
                  <>
                    <span className="comp-unit__empty" aria-hidden>
                      ·
                    </span>
                    <span className="comp-unit__name">—</span>
                  </>
                )}
              </li>
            ))}
          </ul>

          {description ? <p className="comp-card__desc">{description}</p> : null}
        </div>
      </div>

      <div className="comp-card__actions">
        <span className="comp-card__load">Load into party →</span>
        {secondary ? (
          <div className="comp-card__secondary" onClick={(e) => e.stopPropagation()}>
            {secondary}
          </div>
        ) : null}
      </div>
    </article>
  );
}
