import type { ReactNode } from "react";
import { PalIcon } from "@/components/teams/PalIcon";
import { EFFECT_TAG_LABELS, TEAM_SIZE, type EffectTag, type Pal } from "@/lib/teams/types";
import { toneForTag } from "@/lib/teams/effectTone";

type Props = {
  name: string;
  description?: string;
  tier?: "S" | "A" | "B" | "C";
  team: (string | null)[];
  palMap: Map<string, Pal>;
  traits?: EffectTag[];
  active?: boolean;
  meta?: string;
  actionLabel?: string;
  onSelect: () => void;
  secondary?: ReactNode;
};

export function CompCard({
  name,
  description,
  tier,
  team,
  palMap,
  traits = [],
  active = false,
  meta,
  actionLabel = "Use",
  onSelect,
  secondary,
}: Props) {
  const slots = Array.from({ length: TEAM_SIZE }, (_, i) => {
    const slug = team[i] ?? null;
    return slug ? palMap.get(slug) ?? null : null;
  });

  return (
    <article className={`comp-card ${active ? "is-active" : ""}`}>
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
                  <PalIcon pal={pal} size={44} className="comp-unit__icon" />
                ) : (
                  <span className="comp-unit__empty" aria-hidden>
                    ·
                  </span>
                )}
                <span className="comp-unit__name">{pal?.name ?? "—"}</span>
              </li>
            ))}
          </ul>

          {description ? <p className="comp-card__desc">{description}</p> : null}
        </div>
      </div>

      <div className="comp-card__actions">
        <button type="button" className="chip chip--btn chip--sm comp-card__use" onClick={onSelect}>
          {actionLabel}
        </button>
        {secondary}
      </div>
    </article>
  );
}
