"use client";

import { PalIcon } from "@/components/teams/PalIcon";
import {
  EFFECT_TAG_LABELS,
  type EffectTag,
  type Pal,
  type TeamEffects,
} from "@/lib/teams/types";
import { getEffectTagOptions } from "@/lib/teams";
import { toneForTag, toneForTags } from "@/lib/teams/effectTone";

type Props = {
  effects: TeamEffects;
  palMap: Map<string, Pal>;
  filled: number;
  filter: EffectTag | "all";
  onFilterChange: (tag: EffectTag | "all") => void;
};

function palsForNames(names: string[], palMap: Map<string, Pal>): Pal[] {
  const byName = new Map([...palMap.values()].map((p) => [p.name.toLowerCase(), p]));
  return names
    .map((n) => byName.get(n.toLowerCase()))
    .filter((p): p is Pal => Boolean(p));
}

export function TeamEffectsPanel({ effects, palMap, filled, filter, onFilterChange }: Props) {
  const tagOptions = getEffectTagOptions();
  const total = effects.stacks.length + effects.uniques.length;
  const stackCount = effects.stacks.length;
  const uniqueCount = effects.uniques.length;

  return (
    <section className="teams-effects-panel" aria-label="Partner skill effects">
      <header className="teams-effects-panel__head">
        <div>
          <h2 className="teams-effects-panel__title">Party effects</h2>
          {filled > 0 ? (
            <p className="teams-effects-panel__summary">
              {stackCount > 0 ? (
                <span>
                  {stackCount} stack{stackCount !== 1 ? "s" : ""}
                </span>
              ) : null}
              {stackCount > 0 && uniqueCount > 0 ? <span aria-hidden> · </span> : null}
              {uniqueCount > 0 ? (
                <span>
                  {uniqueCount} unique aura{uniqueCount !== 1 ? "s" : ""}
                </span>
              ) : null}
              {total === 0 ? <span>No active buffs yet</span> : null}
            </p>
          ) : (
            <p className="teams-effects-panel__summary">Add pals to see partner-skill synergies.</p>
          )}
        </div>
        <label className="filter-select filter-select--sm teams-effects-panel__filter">
          <span className="sr-only">Filter effects</span>
          <select
            value={filter}
            onChange={(e) => onFilterChange(e.target.value as EffectTag | "all")}
            disabled={filled === 0}
          >
            {tagOptions.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
      </header>

      {filled === 0 ? (
        <div className="teams-effects-panel__empty">
          <p>Pick up to five pals — stacking rules and auras update live here.</p>
        </div>
      ) : total === 0 ? (
        <div className="teams-effects-panel__empty">
          <p>No effects match this filter.</p>
        </div>
      ) : (
        <ul className="teams-effects-panel__list">
          {effects.stacks.map((s) => {
            const tone = toneForTags(s.tags);
            const sourcePals = palsForNames(s.sources, palMap);
            return (
              <li
                key={s.group}
                className={`teams-effect-card is-stack teams-effect-card--${tone}`}
              >
                <div className="teams-effect-card__top">
                  <span className="effect-badge effect-badge--stack">
                    Stacks ×{s.sources.length}
                  </span>
                  {s.tags.slice(0, 2).map((t) => (
                    <span key={t} className={`effect-badge effect-badge--${toneForTag(t)}`}>
                      {EFFECT_TAG_LABELS[t]}
                    </span>
                  ))}
                </div>
                <strong className="teams-effect-card__label">{s.label}</strong>
                <div className="teams-effect-card__sources">
                  {sourcePals.map((pal) => (
                    <span key={pal.slug} className="teams-effect-card__pal" title={pal.name}>
                      <PalIcon pal={pal} size={28} />
                      <span>{pal.name}</span>
                    </span>
                  ))}
                </div>
              </li>
            );
          })}
          {effects.uniques.map((u) => {
            const tone = toneForTags(u.tags);
            const pal = palMap.get(u.palSlug);
            return (
              <li
                key={`${u.palSlug}-${u.skillName}`}
                className={`teams-effect-card teams-effect-card--${tone}`}
              >
                <div className="teams-effect-card__top">
                  {u.tags.slice(0, 3).map((t) => (
                    <span key={t} className={`effect-badge effect-badge--${toneForTag(t)}`}>
                      {EFFECT_TAG_LABELS[t]}
                    </span>
                  ))}
                </div>
                <div className="teams-effect-card__unique-head">
                  {pal ? (
                    <PalIcon pal={pal} size={36} className="teams-effect-card__icon" />
                  ) : null}
                  <div>
                    <strong className="teams-effect-card__label">{u.skillName}</strong>
                    <span className="teams-effect-card__pal-name">{u.palName}</span>
                  </div>
                </div>
                <p className="teams-effect-card__desc">{u.description}</p>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
