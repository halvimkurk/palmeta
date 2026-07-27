"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CompanionIntro } from "@/components/pals/CompanionIntro";
import { CompanionTools } from "@/components/pals/CompanionTools";
import { CompCard } from "@/components/teams/CompCard";
import { ElementBadges } from "@/components/teams/ElementBadge";
import { PalIcon } from "@/components/teams/PalIcon";
import {
  EFFECT_TAG_LABELS,
  ELEMENT_LABELS,
  RARITY_LABELS,
  TEAM_SIZE,
  type EffectTag,
  type Pal,
  type PalElement,
  type PalRarity,
  type TeamPreset,
} from "@/lib/teams/types";
import {
  aggregateTeamEffects,
  encodeTeamParam,
  filterEffectsByTag,
  filterPals,
  findSavedTeamMatching,
  getEffectTagOptions,
  MAX_SAVED_TEAMS,
  parseTeamParam,
  teamToSlots,
  useSavedTeamsHydrated,
  useSavedTeamsStore,
  type SavedTeam,
} from "@/lib/teams";
import { toneForTag, toneForTags } from "@/lib/teams/effectTone";

type Props = {
  pals: Pal[];
  presets: TeamPreset[];
};

const TIER_ORDER: Record<string, number> = { S: 0, A: 1, B: 2, C: 3 };

function defaultTeamName(resolved: (Pal | null)[]): string {
  const names = resolved.filter((p): p is Pal => Boolean(p)).map((p) => p.name);
  if (names.length === 0) return "My team";
  if (names.length <= 2) return names.join(" · ");
  return `${names[0]} party`;
}

function teamFromSearch(
  searchParams: URLSearchParams,
  presets: TeamPreset[],
): { team: (string | null)[]; highlightPresetId?: string } {
  const presetId = searchParams.get("preset");
  const fromPreset = presetId ? presets.find((p) => p.id === presetId) : undefined;
  if (fromPreset) {
    return {
      team: Array.from({ length: TEAM_SIZE }, (_, i) => fromPreset.team[i] ?? null),
      highlightPresetId: fromPreset.id,
    };
  }
  return { team: parseTeamParam(searchParams.get("team")) };
}

export function TeamBuilderClient({ pals, presets }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const savedHydrated = useSavedTeamsHydrated();
  const savedTeams = useSavedTeamsStore((s) => s.teams);
  const saveTeam = useSavedTeamsStore((s) => s.saveTeam);
  const updateTeam = useSavedTeamsStore((s) => s.updateTeam);
  const renameTeam = useSavedTeamsStore((s) => s.renameTeam);
  const deleteTeam = useSavedTeamsStore((s) => s.deleteTeam);

  const boot = useMemo(
    () => teamFromSearch(new URLSearchParams(searchParams.toString()), presets),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- initial URL only
    [],
  );
  const highlightPresetId = boot.highlightPresetId;

  const [slots, setSlots] = useState<(string | null)[]>(() => boot.team);
  const [activeSlot, setActiveSlot] = useState<number | null>(null);
  const [q, setQ] = useState("");
  const [element, setElement] = useState<PalElement | "all">("all");
  const [rarity, setRarity] = useState<PalRarity | "all">("all");
  const [effectTag, setEffectTag] = useState<EffectTag | "all">("all");
  const [effectsFilter, setEffectsFilter] = useState<EffectTag | "all">("all");
  const [compTrait, setCompTrait] = useState<EffectTag | "all">("all");
  const [saving, setSaving] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [saveNotice, setSaveNotice] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [activeSavedId, setActiveSavedId] = useState<string | null>(null);
  const [forceNewSave, setForceNewSave] = useState(false);

  const palMap = useMemo(() => new Map(pals.map((p) => [p.slug, p])), [pals]);

  const resolved = useMemo(
    () => slots.map((s) => (s ? palMap.get(s) ?? null : null)),
    [slots, palMap],
  );

  const effects = useMemo(() => {
    const raw = aggregateTeamEffects(resolved);
    return filterEffectsByTag(raw, effectsFilter);
  }, [resolved, effectsFilter]);

  const filteredPals = useMemo(
    () => filterPals(pals, { q, element, rarity, effectTag }),
    [pals, q, element, rarity, effectTag],
  );

  const matchedSaved = useMemo(
    () => (savedHydrated ? findSavedTeamMatching(savedTeams, slots) : undefined),
    [savedHydrated, savedTeams, slots],
  );

  const activeSaved = useMemo(
    () =>
      savedHydrated && activeSavedId
        ? savedTeams.find((t) => t.id === activeSavedId)
        : undefined,
    [savedHydrated, savedTeams, activeSavedId],
  );

  const canUpdateExisting = Boolean(matchedSaved || activeSaved);

  const sortedPresets = useMemo(() => {
    return [...presets]
      .filter((p) => {
        if (compTrait === "all") return true;
        return p.effectFocus?.includes(compTrait);
      })
      .sort((a, b) => {
        const ta = TIER_ORDER[a.tier ?? "C"] ?? 9;
        const tb = TIER_ORDER[b.tier ?? "C"] ?? 9;
        if (ta !== tb) return ta - tb;
        return a.name.localeCompare(b.name);
      });
  }, [presets, compTrait]);

  const compsTraitOptions = useMemo(() => {
    const ids = new Set<EffectTag>();
    for (const p of presets) {
      for (const t of p.effectFocus ?? []) ids.add(t);
    }
    return [...ids].sort((a, b) => EFFECT_TAG_LABELS[a].localeCompare(EFFECT_TAG_LABELS[b]));
  }, [presets]);

  const syncUrl = useCallback(
    (next: (string | null)[]) => {
      const params = new URLSearchParams(searchParams.toString());
      const encoded = encodeTeamParam(next);
      if (next.every((s) => !s)) params.delete("team");
      else params.set("team", encoded);
      params.delete("preset");
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  useEffect(() => {
    const { team } = teamFromSearch(
      new URLSearchParams(searchParams.toString()),
      presets,
    );
    setSlots((prev) => {
      const same = prev.every((s, i) => s === team[i]);
      return same ? prev : team;
    });
  }, [searchParams, presets]);

  useEffect(() => {
    if (!saveNotice) return;
    const t = window.setTimeout(() => setSaveNotice(null), 2200);
    return () => window.clearTimeout(t);
  }, [saveNotice]);

  function setSlot(index: number, slug: string | null) {
    setSlots((prev) => {
      const next = [...prev];
      next[index] = slug;
      syncUrl(next);
      return next;
    });
    setActiveSlot(null);
  }

  function applySlots(next: (string | null)[], opts?: { keepActiveSaved?: boolean }) {
    setSlots(next);
    syncUrl(next);
    setActiveSlot(null);
    if (!opts?.keepActiveSaved) setActiveSavedId(null);
  }

  function applyPreset(preset: TeamPreset) {
    applySlots(Array.from({ length: TEAM_SIZE }, (_, i) => preset.team[i] ?? null));
  }

  function applySaved(saved: SavedTeam) {
    setActiveSavedId(saved.id);
    applySlots(teamToSlots(saved.team), { keepActiveSaved: true });
  }

  function clearTeam() {
    applySlots(Array.from({ length: TEAM_SIZE }, () => null));
  }

  function openSaveForm(asNew = false) {
    setForceNewSave(asNew);
    setSaveName(
      asNew
        ? defaultTeamName(resolved)
        : (matchedSaved?.name ?? activeSaved?.name ?? defaultTeamName(resolved)),
    );
    setSaving(true);
    setSaveNotice(null);
  }

  function commitSave() {
    const createNew = forceNewSave;
    const target = createNew ? undefined : matchedSaved ?? activeSaved;
    if (target) {
      updateTeam(target.id, slots);
      const nextName = saveName.trim();
      if (nextName && nextName !== target.name) {
        renameTeam(target.id, nextName);
      }
      setActiveSavedId(target.id);
      setForceNewSave(false);
      setSaving(false);
      setSaveNotice("Team updated");
      return;
    }
    const entry = saveTeam(saveName || defaultTeamName(resolved), slots);
    if (!entry) {
      setSaveNotice(
        savedTeams.length >= MAX_SAVED_TEAMS
          ? `Limit ${MAX_SAVED_TEAMS} teams — delete one first`
          : "Add at least one Pal",
      );
      return;
    }
    setActiveSavedId(entry.id);
    setForceNewSave(false);
    setSaving(false);
    setSaveNotice("Saved");
  }

  function startRename(saved: SavedTeam) {
    setRenamingId(saved.id);
    setRenameValue(saved.name);
  }

  function commitRename() {
    if (!renamingId) return;
    renameTeam(renamingId, renameValue);
    setRenamingId(null);
  }

  const filled = slots.filter(Boolean).length;
  const tagOptions = getEffectTagOptions();
  const highlightedSavedId = matchedSaved?.id ?? activeSavedId;
  const activePresetId = presets.find(
    (p) =>
      slots.join(",") ===
      Array.from({ length: TEAM_SIZE }, (_, i) => p.team[i] ?? null).join(","),
  )?.id;

  return (
    <div className="teams">
      <CompanionIntro
        tone="pals"
        eyebrow="Party forge"
        title="Raid Roster"
        lead="Load a proven comp or build your own party of 5 — partner-skill synergies update as you swap pals."
      >
        <CompanionTools />
      </CompanionIntro>

      <section className="teams-comps" aria-label="Top meta teams">
        <div className="teams-meta-head">
          <div>
            <h2 className="teams-meta-head__title">
              {compTrait === "all" ? "Top meta teams" : "Meta comps"}
            </h2>
            <p className="teams-meta-head__lead">
              {compTrait === "all"
                ? "Researched 1.0 party comps — load one into the builder below. Trait filters narrow the list."
                : "Comps matching this trait. Switch to All traits for the full meta board."}
            </p>
          </div>
          <p className="teams-comps__sort">Sort: Tier</p>
        </div>

        <div className="teams-comps__bar">
          <div className="tiers-role-bar pals-role-bar" role="tablist" aria-label="Comp traits">
            <button
              type="button"
              role="tab"
              aria-selected={compTrait === "all"}
              className={`tiers-role-tab ${compTrait === "all" ? "is-active" : ""}`}
              onClick={() => setCompTrait("all")}
            >
              All traits
            </button>
            {compsTraitOptions.map((t) => (
              <button
                key={t}
                type="button"
                role="tab"
                aria-selected={compTrait === t}
                className={`tiers-role-tab ${compTrait === t ? "is-active" : ""}`}
                onClick={() => setCompTrait(t)}
              >
                {EFFECT_TAG_LABELS[t]}
              </button>
            ))}
          </div>
        </div>

        {sortedPresets.length === 0 ? (
          <p className="hub-hint">No comps for this trait.</p>
        ) : (
          <ul className={`teams-comps__list ${compTrait === "all" ? "teams-comps__list--meta" : ""}`}>
            {sortedPresets.map((p) => (
              <li key={p.id}>
                <CompCard
                  name={p.name}
                  description={p.description}
                  tier={p.tier}
                  team={p.team}
                  palMap={palMap}
                  traits={p.effectFocus}
                  active={activePresetId === p.id || highlightPresetId === p.id}
                  actionLabel="Use comp"
                  onSelect={() => applyPreset(p)}
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="teams-dock">
        <section className="teams-saved" aria-label="Saved teams">
          <div className="teams-saved__bar">
            {saving ? (
              <form
                className="teams-saved__form"
                onSubmit={(e) => {
                  e.preventDefault();
                  commitSave();
                }}
              >
                <label className="teams-saved__name">
                  <span className="sr-only">Team name</span>
                  <input
                    type="text"
                    value={saveName}
                    onChange={(e) => setSaveName(e.target.value)}
                    maxLength={40}
                    placeholder="Team name"
                    autoFocus
                    aria-label="Team name"
                  />
                </label>
                <button
                  type="submit"
                  className="chip chip--btn chip--sm teams-saved__btn-primary"
                  disabled={filled === 0}
                >
                  Save new team
                </button>
                <button
                  type="button"
                  className="chip chip--btn chip--sm chip--ghost"
                  onClick={() => {
                    setSaving(false);
                    setForceNewSave(false);
                  }}
                >
                  Cancel
                </button>
              </form>
            ) : (
              <>
                <button
                  type="button"
                  className="chip chip--btn chip--sm teams-saved__btn-primary"
                  disabled={filled === 0 || savedTeams.length >= MAX_SAVED_TEAMS}
                  title={
                    savedTeams.length >= MAX_SAVED_TEAMS
                      ? `Limit ${MAX_SAVED_TEAMS} saved teams — delete one first`
                      : "Save current party as a new named team"
                  }
                  onClick={() => openSaveForm(true)}
                >
                  Save new team
                </button>
                {canUpdateExisting ? (
                  <button
                    type="button"
                    className="chip chip--btn chip--sm"
                    disabled={filled === 0}
                    onClick={() => {
                      const target = matchedSaved ?? activeSaved;
                      if (!target) return;
                      updateTeam(target.id, slots);
                      setActiveSavedId(target.id);
                      setSaveNotice("Team updated");
                    }}
                  >
                    Update team
                  </button>
                ) : null}
                <button
                  type="button"
                  className="chip chip--btn chip--sm chip--ghost"
                  onClick={clearTeam}
                >
                  Clear
                </button>
              </>
            )}
            {saveNotice ? (
              <span className="teams-saved__notice" role="status">
                {saveNotice}
              </span>
            ) : null}
            {savedHydrated && savedTeams.length > 0 ? (
              <span className="teams-saved__count">
                {savedTeams.length}/{MAX_SAVED_TEAMS}
              </span>
            ) : null}
          </div>

          {savedHydrated && savedTeams.length > 0 ? (
            <ul className="teams-saved__comps">
              {savedTeams.map((t) => {
                if (renamingId === t.id) {
                  return (
                    <li key={t.id} className="teams-saved__item is-renaming">
                      <form
                        className="teams-saved__rename"
                        onSubmit={(e) => {
                          e.preventDefault();
                          commitRename();
                        }}
                      >
                        <input
                          type="text"
                          value={renameValue}
                          onChange={(e) => setRenameValue(e.target.value)}
                          maxLength={40}
                          autoFocus
                          aria-label="Rename team"
                        />
                        <button type="submit" className="chip chip--btn chip--sm">
                          OK
                        </button>
                        <button
                          type="button"
                          className="chip chip--btn chip--sm chip--ghost"
                          onClick={() => setRenamingId(null)}
                        >
                          Cancel
                        </button>
                      </form>
                    </li>
                  );
                }
                return (
                  <li key={t.id}>
                    <CompCard
                      name={t.name}
                      team={teamToSlots(t.team)}
                      palMap={palMap}
                      active={highlightedSavedId === t.id}
                      actionLabel="Load"
                      onSelect={() => applySaved(t)}
                      secondary={
                        <>
                          <button
                            type="button"
                            className="chip chip--btn chip--sm chip--ghost"
                            aria-label={`Rename ${t.name}`}
                            onClick={() => startRename(t)}
                          >
                            Rename
                          </button>
                          <button
                            type="button"
                            className="chip chip--btn chip--sm chip--ghost"
                            aria-label={`Delete ${t.name}`}
                            onClick={() => {
                              deleteTeam(t.id);
                              if (activeSavedId === t.id) setActiveSavedId(null);
                              setSaveNotice("Deleted");
                            }}
                          >
                            Delete
                          </button>
                        </>
                      }
                    />
                  </li>
                );
              })}
            </ul>
          ) : savedHydrated ? (
            <p className="teams-saved__hint">
              Build a party, then{" "}
              <span className="teams-saved__hint-em">Save new team</span> — kept in this
              browser (up to {MAX_SAVED_TEAMS}).
            </p>
          ) : null}
        </section>

        <section className="teams-board" aria-label="Party and effects">
          <div className="teams-slots">
            {resolved.map((pal, i) => (
              <button
                key={i}
                type="button"
                className={`teams-slot ${activeSlot === i ? "is-active" : ""} ${pal ? "has-pal" : ""}`}
                onClick={() => setActiveSlot(activeSlot === i ? null : i)}
                aria-pressed={activeSlot === i}
                aria-label={
                  activeSlot === i
                    ? pal
                      ? `${pal.name}, slot ${i + 1}, selected for swap`
                      : `Empty slot ${i + 1}, selected`
                    : pal
                      ? `${pal.name}, slot ${i + 1}`
                      : `Empty slot ${i + 1}`
                }
              >
                {activeSlot === i ? (
                  <span className="teams-slot__pick">Selecting</span>
                ) : (
                  <span className="teams-slot__index" aria-hidden>
                    {i + 1}
                  </span>
                )}
                {pal ? (
                  <>
                    <ElementBadges elements={pal.elements} size={14} className="teams-slot__els" />
                    <PalIcon pal={pal} size={56} className="teams-slot__icon" priority={i < 2} />
                    <span className="teams-slot__name">{pal.name}</span>
                    <span
                      className="teams-slot__clear"
                      role="presentation"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSlot(i, null);
                      }}
                    >
                      ×
                    </span>
                  </>
                ) : (
                  <>
                    <span className="teams-slot__empty" aria-hidden>
                      +
                    </span>
                    <span className="teams-slot__name">Select</span>
                  </>
                )}
              </button>
            ))}
          </div>

          <details className="teams-effects" aria-label="Team effects">
            <summary className="teams-effects__head">
              <span className="teams-effects__title">
                Team Effects
                {filled > 0 ? (
                  <span className="teams-effects__count">
                    {effects.stacks.length + effects.uniques.length}
                  </span>
                ) : null}
              </span>
              <label
                className="filter-select filter-select--sm"
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
              >
                <span className="sr-only">Filter effects</span>
                <select
                  value={effectsFilter}
                  onChange={(e) => setEffectsFilter(e.target.value as EffectTag | "all")}
                >
                  {tagOptions.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </label>
            </summary>
            {filled === 0 ? (
              <p className="teams-effects__empty">Add Pals to see partner-skill synergies.</p>
            ) : (
              <ul className="teams-effects__list">
                {effects.stacks.map((s) => {
                  const tone = toneForTags(s.tags);
                  return (
                    <li
                      key={s.group}
                      className={`teams-effect is-stack teams-effect--${tone}`}
                      title={s.sources.join(" · ")}
                    >
                      <div className="teams-effect__badges">
                        <span className="effect-badge effect-badge--stack">
                          Stack ×{s.sources.length}
                        </span>
                        {s.tags.slice(0, 2).map((t) => (
                          <span
                            key={t}
                            className={`effect-badge effect-badge--${toneForTag(t)}`}
                          >
                            {EFFECT_TAG_LABELS[t]}
                          </span>
                        ))}
                      </div>
                      <strong>{s.label}</strong>
                      <span className="teams-effect__meta">{s.sources.join(" · ")}</span>
                    </li>
                  );
                })}
                {effects.uniques.map((u) => {
                  const tone = toneForTags(u.tags);
                  return (
                    <li
                      key={`${u.palSlug}-${u.skillName}`}
                      className={`teams-effect teams-effect--${tone}`}
                      title={u.description}
                    >
                      <div className="teams-effect__badges">
                        {u.tags.slice(0, 3).map((t) => (
                          <span
                            key={t}
                            className={`effect-badge effect-badge--${toneForTag(t)}`}
                          >
                            {EFFECT_TAG_LABELS[t]}
                          </span>
                        ))}
                      </div>
                      <strong>
                        {u.palName} — {u.skillName}
                      </strong>
                      <span className="teams-effect__meta">{u.description}</span>
                    </li>
                  );
                })}
                {effects.stacks.length === 0 && effects.uniques.length === 0 ? (
                  <li className="teams-effects__empty">No effects match this filter.</li>
                ) : null}
              </ul>
            )}
          </details>
        </section>
      </div>

      <div className="teams-picker-head">
        <div className="filters filters--toolbar teams-filters">
          <label className="filter-search filter-search--grow">
            <span className="filter-search__icon" aria-hidden>
              ⌕
            </span>
            <input
              type="search"
              placeholder={`Search Pals (${filteredPals.length}/${pals.length})`}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              aria-label="Search pals"
            />
          </label>
          <label className="filter-select filter-select--sm">
            <span className="sr-only">Effect</span>
            <select
              value={effectTag}
              onChange={(e) => setEffectTag(e.target.value as EffectTag | "all")}
            >
              {tagOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
          <label className="filter-select filter-select--sm">
            <span className="sr-only">Element</span>
            <select
              value={element}
              onChange={(e) => setElement(e.target.value as PalElement | "all")}
            >
              <option value="all">Element</option>
              {(Object.keys(ELEMENT_LABELS) as PalElement[]).map((el) => (
                <option key={el} value={el}>
                  {ELEMENT_LABELS[el]}
                </option>
              ))}
            </select>
          </label>
          <label className="filter-select filter-select--sm">
            <span className="sr-only">Rarity</span>
            <select
              value={rarity}
              onChange={(e) => setRarity(e.target.value as PalRarity | "all")}
            >
              <option value="all">Rarity</option>
              {(Object.keys(RARITY_LABELS) as PalRarity[]).map((r) => (
                <option key={r} value={r}>
                  {RARITY_LABELS[r]}
                </option>
              ))}
            </select>
          </label>
        </div>
        {activeSlot != null ? (
          <p className="teams-count teams-count--pick">
            Picking for slot {activeSlot + 1} — click a Pal below
          </p>
        ) : null}
      </div>

      <ul className="teams-pal-grid">
        {filteredPals.map((pal) => {
          const selected = slots.includes(pal.slug);
          return (
            <li key={pal.slug}>
              <button
                type="button"
                className={`teams-pal rarity-${pal.rarity} ${selected ? "is-selected" : ""}`}
                title={`${pal.name} · ${pal.partnerSkill.name}`}
                onClick={() => {
                  if (activeSlot != null) {
                    setSlot(activeSlot, pal.slug);
                    return;
                  }
                  const empty = slots.findIndex((s) => !s);
                  if (empty >= 0) setSlot(empty, pal.slug);
                }}
              >
                <ElementBadges elements={pal.elements} size={16} className="teams-pal__els" />
                {pal.isNew ? <span className="teams-pal__new">NEW</span> : null}
                <PalIcon pal={pal} size={52} className="teams-pal__portrait" />
                <span className="teams-pal__name">{pal.name}</span>
                <span className={`teams-pal__rarity rarity-${pal.rarity}`}>
                  {RARITY_LABELS[pal.rarity]}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <p className="teams-footnote">
        Teams save in this browser — share the link to hand a build to a friend.{" "}
        <Link href="/pals">Paldeck</Link> · <Link href="/tiers?role=combat">Summit Tiers</Link> ·{" "}
        <Link href="/breeding">Egg Nest</Link>
      </p>
    </div>
  );
}
