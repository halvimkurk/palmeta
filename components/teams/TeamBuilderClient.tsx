"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CompanionIntro } from "@/components/pals/CompanionIntro";
import { NAV } from "@/lib/nav";
import { CompanionTools } from "@/components/pals/CompanionTools";
import { CompCard } from "@/components/teams/CompCard";
import { ElementBadges } from "@/components/teams/ElementBadge";
import { PalIcon } from "@/components/teams/PalIcon";
import { TeamEffectsPanel } from "@/components/teams/TeamEffectsPanel";
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
import { teamParamEquals } from "@/lib/teams/url";

type Props = {
  pals: Pal[];
  presets: TeamPreset[];
};

type View = "build" | "meta" | "saved";

const TIER_ORDER: Record<string, number> = { S: 0, A: 1, B: 2, C: 3 };

function defaultTeamName(resolved: (Pal | null)[]): string {
  const names = resolved.filter((p): p is Pal => Boolean(p)).map((p) => p.name);
  if (names.length === 0) return "My party";
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

function parseView(raw: string | null): View {
  if (raw === "meta" || raw === "saved") return raw;
  return "build";
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

  const [view, setView] = useState<View>(() => parseView(searchParams.get("view")));
  const [slots, setSlots] = useState<(string | null)[]>(() => boot.team);
  const [baselineSlots, setBaselineSlots] = useState<(string | null)[]>(() => boot.team);
  const [activeSlot, setActiveSlot] = useState<number | null>(null);
  const [q, setQ] = useState("");
  const [element, setElement] = useState<PalElement | "all">("all");
  const [rarity, setRarity] = useState<PalRarity | "all">("all");
  const [effectTag, setEffectTag] = useState<EffectTag | "all">("all");
  const [effectsFilter, setEffectsFilter] = useState<EffectTag | "all">("all");
  const [compTrait, setCompTrait] = useState<EffectTag | null>(null);
  const [loadedSavedId, setLoadedSavedId] = useState<string | null>(null);
  const [saveOpen, setSaveOpen] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [saveAsNew, setSaveAsNew] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [linkCopied, setLinkCopied] = useState(false);

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

  const loadedSaved = useMemo(
    () => (loadedSavedId ? savedTeams.find((t) => t.id === loadedSavedId) : undefined),
    [loadedSavedId, savedTeams],
  );

  const matchedSaved = useMemo(
    () => (savedHydrated ? findSavedTeamMatching(savedTeams, slots) : undefined),
    [savedHydrated, savedTeams, slots],
  );

  const isDirty = useMemo(
    () => !teamParamEquals(slots, baselineSlots),
    [slots, baselineSlots],
  );

  const activePreset = useMemo(
    () =>
      presets.find(
        (p) =>
          slots.join(",") ===
          Array.from({ length: TEAM_SIZE }, (_, i) => p.team[i] ?? null).join(","),
      ),
    [presets, slots],
  );

  const filled = slots.filter(Boolean).length;

  const partyTitle =
    loadedSaved?.name ?? activePreset?.name ?? (filled > 0 ? "Custom party" : "Empty party");

  const sortedPresets = useMemo(() => {
    if (!compTrait) return [];
    return [...presets]
      .filter((p) => p.effectFocus?.includes(compTrait))
      .sort((a, b) => {
        const sa = a.status === "outdated" ? 1 : 0;
        const sb = b.status === "outdated" ? 1 : 0;
        if (sa !== sb) return sa - sb;
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
    (next: (string | null)[], nextView?: View) => {
      const params = new URLSearchParams(searchParams.toString());
      const encoded = encodeTeamParam(next);
      if (next.every((s) => !s)) params.delete("team");
      else params.set("team", encoded);
      params.delete("preset");
      const v = nextView ?? view;
      if (v === "build") params.delete("view");
      else params.set("view", v);
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams, view],
  );

  const setViewAndUrl = useCallback(
    (next: View) => {
      setView(next);
      syncUrl(slots, next);
    },
    [slots, syncUrl],
  );

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    const { team, highlightPresetId } = teamFromSearch(params, presets);
    setSlots((prev) => (teamParamEquals(prev, team) ? prev : team));
    setBaselineSlots((prev) => (teamParamEquals(prev, team) ? prev : team));
    setView(parseView(params.get("view")));
    if (highlightPresetId) setLoadedSavedId(null);
  }, [searchParams, presets]);

  useEffect(() => {
    if (!notice) return;
    const t = window.setTimeout(() => setNotice(null), 2400);
    return () => window.clearTimeout(t);
  }, [notice]);

  useEffect(() => {
    if (!linkCopied) return;
    const t = window.setTimeout(() => setLinkCopied(false), 2000);
    return () => window.clearTimeout(t);
  }, [linkCopied]);

  function applyParty(
    next: (string | null)[],
    opts?: { savedId?: string | null; switchToBuild?: boolean },
  ) {
    setSlots(next);
    setBaselineSlots(next);
    setActiveSlot(null);
    setLoadedSavedId(opts?.savedId ?? null);
    syncUrl(next, opts?.switchToBuild === false ? view : "build");
    if (opts?.switchToBuild !== false) setView("build");
  }

  function setSlot(index: number, slug: string | null) {
    setSlots((prev) => {
      const next = [...prev];
      next[index] = slug;
      syncUrl(next);
      return next;
    });
    setActiveSlot(null);
  }

  function clearParty() {
    const empty = Array.from({ length: TEAM_SIZE }, () => null);
    applyParty(empty, { savedId: null });
    setNotice("Party cleared");
  }

  function loadPreset(preset: TeamPreset) {
    const next = Array.from({ length: TEAM_SIZE }, (_, i) => preset.team[i] ?? null);
    applyParty(next, { savedId: null });
    setNotice(`Loaded ${preset.name}`);
  }

  function loadSaved(saved: SavedTeam) {
    applyParty(teamToSlots(saved.team), { savedId: saved.id });
    setNotice(`Loaded ${saved.name}`);
  }

  function openSave(asNew: boolean) {
    setSaveAsNew(asNew);
    setSaveName(
      asNew
        ? defaultTeamName(resolved)
        : (loadedSaved?.name ?? matchedSaved?.name ?? defaultTeamName(resolved)),
    );
    setSaveOpen(true);
  }

  function commitSave() {
    const name = saveName.trim() || defaultTeamName(resolved);
    const canUpdate = !saveAsNew && (loadedSaved ?? matchedSaved);

    if (canUpdate) {
      const target = loadedSaved ?? matchedSaved!;
      updateTeam(target.id, slots);
      if (name !== target.name) renameTeam(target.id, name);
      setLoadedSavedId(target.id);
      setBaselineSlots([...slots]);
      setSaveOpen(false);
      setNotice("Party saved");
      return;
    }

    const entry = saveTeam(name, slots);
    if (!entry) {
      setNotice(
        savedTeams.length >= MAX_SAVED_TEAMS
          ? `Limit ${MAX_SAVED_TEAMS} — delete one in My teams`
          : "Add at least one Pal",
      );
      return;
    }
    setLoadedSavedId(entry.id);
    setBaselineSlots([...slots]);
    setSaveOpen(false);
    setNotice("Party saved");
  }

  function quickSave() {
    if (loadedSaved && isDirty) {
      updateTeam(loadedSaved.id, slots);
      setBaselineSlots([...slots]);
      setNotice("Changes saved");
      return;
    }
    if (matchedSaved && isDirty) {
      updateTeam(matchedSaved.id, slots);
      setLoadedSavedId(matchedSaved.id);
      setBaselineSlots([...slots]);
      setNotice("Changes saved");
      return;
    }
    openSave(true);
  }

  function copyShareLink() {
    const url = window.location.href;
    void navigator.clipboard.writeText(url).then(() => setLinkCopied(true));
  }

  function startRename(saved: SavedTeam) {
    setRenamingId(saved.id);
    setRenameValue(saved.name);
  }

  function commitRename() {
    if (!renamingId) return;
    renameTeam(renamingId, renameValue);
    setRenamingId(null);
    setNotice("Renamed");
  }

  const canSave = filled > 0;
  const showQuickSave = canSave && (isDirty || !loadedSaved);
  const saveLabel =
    loadedSaved && isDirty ? "Save changes" : matchedSaved && isDirty ? "Save changes" : "Save party";
  const tagOptions = getEffectTagOptions();

  return (
    <div className="teams">
      <CompanionIntro
        tone="teams"
        eyebrow={NAV.teams.eyebrow}
        title={NAV.teams.label}
        lead={NAV.teams.lead}
      >
        <CompanionTools />
      </CompanionIntro>

      <nav className="teams-view-bar" aria-label="Team builder sections">
        <button
          type="button"
          className={`teams-view-tab ${view === "build" ? "is-active" : ""}`}
          aria-current={view === "build" ? "page" : undefined}
          onClick={() => setViewAndUrl("build")}
        >
          Build party
        </button>
        <button
          type="button"
          className={`teams-view-tab ${view === "meta" ? "is-active" : ""}`}
          aria-current={view === "meta" ? "page" : undefined}
          onClick={() => setViewAndUrl("meta")}
        >
          Meta comps
          <span className="teams-view-tab__count">{presets.length}</span>
        </button>
        <button
          type="button"
          className={`teams-view-tab ${view === "saved" ? "is-active" : ""}`}
          aria-current={view === "saved" ? "page" : undefined}
          onClick={() => setViewAndUrl("saved")}
        >
          My teams
          {savedHydrated && savedTeams.length > 0 ? (
            <span className="teams-view-tab__count">{savedTeams.length}</span>
          ) : null}
        </button>
      </nav>

      {view === "build" ? (
        <div className="teams-build">
          <header className="teams-party-bar">
            <div className="teams-party-bar__info">
              <h2 className="teams-party-bar__title">{partyTitle}</h2>
              <p className="teams-party-bar__meta">
                {filled}/5 pals
                {isDirty ? <span className="teams-party-bar__dirty">Unsaved changes</span> : null}
                {activePreset && !loadedSaved ? (
                  <span className="teams-party-bar__source">
                    From meta comp
                    {activePreset.status === "outdated" ? " · outdated" : ""}
                  </span>
                ) : null}
              </p>
            </div>
            <div className="teams-party-bar__actions">
              {saveOpen ? (
                <form
                  className="teams-party-bar__save-form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    commitSave();
                  }}
                >
                  <input
                    type="text"
                    value={saveName}
                    onChange={(e) => setSaveName(e.target.value)}
                    maxLength={40}
                    placeholder="Party name"
                    autoFocus
                    aria-label="Party name"
                  />
                  <button type="submit" className="chip chip--btn chip--sm teams-saved__btn-primary">
                    {saveAsNew ? "Save new" : "Save"}
                  </button>
                  <button
                    type="button"
                    className="chip chip--btn chip--sm chip--ghost"
                    onClick={() => setSaveOpen(false)}
                  >
                    Cancel
                  </button>
                </form>
              ) : (
                <>
                  {showQuickSave ? (
                    <button
                      type="button"
                      className="chip chip--btn chip--sm teams-saved__btn-primary"
                      onClick={quickSave}
                    >
                      {saveLabel}
                    </button>
                  ) : null}
                  {loadedSaved && isDirty ? (
                    <button
                      type="button"
                      className="chip chip--btn chip--sm chip--ghost"
                      onClick={() => openSave(true)}
                      disabled={savedTeams.length >= MAX_SAVED_TEAMS}
                    >
                      Save as new
                    </button>
                  ) : null}
                  <button
                    type="button"
                    className="chip chip--btn chip--sm chip--ghost"
                    onClick={copyShareLink}
                  >
                    {linkCopied ? "Copied!" : "Copy link"}
                  </button>
                  <button
                    type="button"
                    className="chip chip--btn chip--sm chip--ghost"
                    onClick={clearParty}
                    disabled={filled === 0}
                  >
                    Clear
                  </button>
                </>
              )}
              {notice ? (
                <span className="teams-party-bar__notice" role="status">
                  {notice}
                </span>
              ) : null}
            </div>
          </header>

          <section className="teams-board" aria-label="Party slots">
            <h3 className="teams-board__label">Your party</h3>
            <p className="teams-board__hint">Tap a slot, then pick a pal below.</p>
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
                        ? `${pal.name}, slot ${i + 1}, selected`
                        : `Empty slot ${i + 1}, selected`
                      : pal
                        ? `${pal.name}, slot ${i + 1}`
                        : `Empty slot ${i + 1}`
                  }
                >
                  {activeSlot === i ? (
                    <span className="teams-slot__pick">Pick below</span>
                  ) : (
                    <span className="teams-slot__index" aria-hidden>
                      {i + 1}
                    </span>
                  )}
                  {pal ? (
                    <>
                      <ElementBadges elements={pal.elements} size={14} className="teams-slot__els" />
                      <span className="teams-slot__media">
                        <PalIcon pal={pal} size={56} className="teams-slot__icon" priority={i < 2} />
                      </span>
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
                      <span className="teams-slot__media">
                        <span className="teams-slot__empty" aria-hidden>
                          +
                        </span>
                      </span>
                      <span className="teams-slot__name">Empty</span>
                    </>
                  )}
                </button>
              ))}
            </div>
          </section>

          <div className="teams-picker-head">
            <h3 className="teams-picker-head__title">Pal roster</h3>
            <div className="filters filters--toolbar teams-filters">
              <label className="filter-search filter-search--grow">
                <span className="filter-search__icon" aria-hidden>
                  ⌕
                </span>
                <input
                  type="search"
                  placeholder={`Search (${filteredPals.length}/${pals.length})`}
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
                Choosing for slot {activeSlot + 1} — tap a pal
              </p>
            ) : (
              <p className="teams-count">Tap a slot above, or auto-fills the next empty slot.</p>
            )}
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

          <TeamEffectsPanel
            effects={effects}
            palMap={palMap}
            filled={filled}
            filter={effectsFilter}
            onFilterChange={setEffectsFilter}
          />
        </div>
      ) : null}

      {view === "meta" ? (
        <section className="teams-comps" aria-label="Meta team comps">
          <header className="teams-meta-head">
            <div>
              <h2 className="teams-meta-head__title">Meta comps</h2>
              <p className="teams-meta-head__lead">
                Researched Palworld 1.0 parties — pick a playstyle, then load a comp. Outdated
                comps stay listed with a badge for old share links.
              </p>
            </div>
          </header>

          <div className="teams-comps__bar">
            <div className="tiers-role-bar pals-role-bar" role="tablist" aria-label="Comp traits">
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

          {!compTrait ? (
            <div className="teams-meta-empty">
              <p className="teams-meta-empty__kicker">Choose a playstyle</p>
              <p>Select a trait above to browse meta parties for raids, mounts, fishing, and more.</p>
            </div>
          ) : sortedPresets.length === 0 ? (
            <p className="hub-hint">No comps for this trait yet.</p>
          ) : (
            <ul className="teams-comps__list">
              {sortedPresets.map((p) => (
                <li key={p.id}>
                  <CompCard
                    name={p.name}
                    description={p.description}
                    tier={p.tier}
                    status={p.status}
                    team={p.team}
                    palMap={palMap}
                    traits={p.effectFocus}
                    active={activePreset?.id === p.id}
                    onSelect={() => loadPreset(p)}
                  />
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}

      {view === "saved" ? (
        <section className="teams-saved-page" aria-label="Saved teams">
          <header className="teams-meta-head">
            <div>
              <h2 className="teams-meta-head__title">My teams</h2>
              <p className="teams-meta-head__lead">
                Saved in this browser — up to {MAX_SAVED_TEAMS} parties. Load one to edit, or build
                a new party on the Build tab.
              </p>
            </div>
            {savedHydrated ? (
              <span className="teams-saved__count">
                {savedTeams.length}/{MAX_SAVED_TEAMS}
              </span>
            ) : null}
          </header>

          {!savedHydrated ? (
            <p className="hub-hint">Loading saved teams…</p>
          ) : savedTeams.length === 0 ? (
            <div className="teams-meta-empty">
              <p className="teams-meta-empty__kicker">No saved parties</p>
              <p>
                Build a party on the <button type="button" className="teams-inline-link" onClick={() => setViewAndUrl("build")}>Build party</button> tab, then hit Save party.
              </p>
            </div>
          ) : (
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
                const isActive = loadedSavedId === t.id || matchedSaved?.id === t.id;
                return (
                  <li key={t.id}>
                    <CompCard
                      name={t.name}
                      team={teamToSlots(t.team)}
                      palMap={palMap}
                      active={isActive}
                      meta={new Intl.DateTimeFormat("en", {
                        month: "short",
                        day: "numeric",
                      }).format(new Date(t.updatedAt))}
                      onSelect={() => loadSaved(t)}
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
                              if (loadedSavedId === t.id) setLoadedSavedId(null);
                              setNotice("Deleted");
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
          )}
        </section>
      ) : null}

      <p className="teams-footnote">
        <Link href="/pals">{NAV.pals.label}</Link> · <Link href="/tiers?role=combat">{NAV.tiers.label}</Link> ·{" "}
        <Link href="/breeding">{NAV.breeding.label}</Link>
      </p>
    </div>
  );
}
