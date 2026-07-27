"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { CompanionIntro } from "@/components/pals/CompanionIntro";
import { NAV } from "@/lib/nav";
import { CompanionTools } from "@/components/pals/CompanionTools";
import { ElementDots } from "@/components/pals/ElementDots";
import { PalIcon } from "@/components/teams/PalIcon";
import type { TierGrade } from "@/lib/tiers/types";
import {
  ELEMENT_LABELS,
  RARITY_LABELS,
  WORK_LABELS,
  defaultSortDir,
  filterPals,
  getEffectTagOptions,
  getWorkOptions,
  parsePalSort,
  parsePalSortDir,
  parseWorkId,
  sortPals,
  topWorks,
  type EffectTag,
  type Pal,
  type PalElement,
  type PalRarity,
  type PalSort,
  type PalSortDir,
  type WorkSuitabilityId,
} from "@/lib/teams";

type Props = {
  pals: Pal[];
  combatGradeBySlug: Record<string, TierGrade>;
};

type SortCol = PalSort;

const TIER_GRADE_RANK: Record<string, number> = {
  S: 0,
  A: 1,
  B: 2,
  C: 3,
  D: 4,
};

function atkOf(pal: Pal): number | null {
  if (!pal.stats) return null;
  return Math.max(pal.stats.melee, pal.stats.shot);
}

type SortBtnProps = {
  col: PalSort;
  label: string;
  active: boolean;
  sortDir: PalSortDir;
  onSort: (col: PalSort) => void;
};

function PalSortBtn({ col, label, active, sortDir, onSort }: SortBtnProps) {
  const arrow = sortDir === "desc" ? "▾" : "▴";
  return (
    <button
      type="button"
      className={`pals-th-sort ${active ? "is-active" : ""}`}
      aria-pressed={active}
      onClick={() => onSort(col)}
    >
      {label}
      {active ? <span aria-hidden> {arrow}</span> : null}
    </button>
  );
}

export function PalsListClient({ pals, combatGradeBySlug }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchRef = useRef<HTMLInputElement>(null);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const element = (searchParams.get("element") ?? "all") as PalElement | "all";
  const rarity = (searchParams.get("rarity") ?? "all") as PalRarity | "all";
  const effectTag = (searchParams.get("effect") ?? "all") as EffectTag | "all";
  const work = parseWorkId(searchParams.get("work"));
  const workMin = Math.max(1, Number(searchParams.get("workMin") ?? "1") || 1);
  const sort = parsePalSort(searchParams.get("sort"));
  const sortDir = parsePalSortDir(searchParams.get("dir"), sort);
  const q = searchParams.get("q") ?? "";
  const [searchDraft, setSearchDraft] = useState(q);

  const hasActiveFilters =
    Boolean(q) ||
    element !== "all" ||
    rarity !== "all" ||
    effectTag !== "all" ||
    work !== "all" ||
    sort !== "name";

  useEffect(() => {
    setSearchDraft(q);
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
      searchRef.current?.select();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    return () => {
      if (searchTimer.current) clearTimeout(searchTimer.current);
    };
  }, []);

  function pushParams(next: Record<string, string | undefined>) {
    const params = new URLSearchParams(searchParams.toString());

    const setOrDrop = (
      key: string,
      value: string | undefined,
      dropValues: string[] = [],
    ) => {
      if (value === undefined) return;
      if (!value || dropValues.includes(value)) params.delete(key);
      else params.set(key, value);
    };

    setOrDrop("element", next.element ?? element, ["all"]);
    setOrDrop("rarity", next.rarity ?? rarity, ["all"]);
    setOrDrop("effect", next.effect ?? effectTag, ["all"]);
    setOrDrop("work", next.work ?? work, ["all"]);

    const workValue = next.work ?? work;
    const workMinValue = next.workMin ?? String(workMin);
    if (workValue === "all" || Number(workMinValue) <= 1) params.delete("workMin");
    else params.set("workMin", workMinValue);

    const sortValue = (next.sort ?? sort) as PalSort;
    const dirValue = (next.dir ?? sortDir) as PalSortDir;
    const naturalDir = defaultSortDir(sortValue);

    if (sortValue === "name") params.delete("sort");
    else params.set("sort", sortValue);

    if (dirValue !== naturalDir) params.set("dir", dirValue);
    else params.delete("dir");

    if (next.q !== undefined) setOrDrop("q", next.q, [""]);

    const qs = params.toString();
    router.replace(qs ? `/pals?${qs}` : "/pals", { scroll: false });
  }

  function clearFilters() {
    setSearchDraft("");
    router.replace("/pals", { scroll: false });
  }

  function onSearchChange(value: string) {
    setSearchDraft(value);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => pushParams({ q: value }), 180);
  }

  function setSort(next: SortCol) {
    if (sort === next) {
      pushParams({ sort: next, dir: sortDir === "asc" ? "desc" : "asc" });
      return;
    }
    pushParams({ sort: next, dir: defaultSortDir(next) });
  }

  const filtered = useMemo(() => {
    const list = filterPals(pals, {
      q,
      element,
      rarity,
      effectTag,
      work,
      workMin,
    });
    if (sort === "tier") {
      const natural = defaultSortDir("tier");
      return [...list].sort((a, b) => {
        const ga = combatGradeBySlug[a.slug];
        const gb = combatGradeBySlug[b.slug];
        const ra = ga ? (TIER_GRADE_RANK[ga] ?? 8) : 9;
        const rb = gb ? (TIER_GRADE_RANK[gb] ?? 8) : 9;
        if (ra !== rb) {
          const cmp = ra - rb;
          return sortDir === natural ? cmp : -cmp;
        }
        return a.name.localeCompare(b.name);
      });
    }
    return sortPals(list, sort, work, sortDir);
  }, [pals, q, element, rarity, effectTag, work, workMin, sort, sortDir, combatGradeBySlug]);

  const primaryTags = getEffectTagOptions().filter(
    (o) =>
      o.id === "all" ||
      [
        "flying-mount",
        "ground-mount",
        "base-work",
        "combat-buffs",
        "capture",
        "fishing",
        "carry-weight",
      ].includes(o.id),
  );

  const elements = Object.keys(ELEMENT_LABELS) as PalElement[];

  return (
    <div className="pals-page">
      <CompanionIntro
        tone="pals"
        eyebrow={NAV.pals.eyebrow}
        title={NAV.pals.label}
        lead={NAV.pals.lead}
      >
        <CompanionTools />
      </CompanionIntro>

      <div className="pals-toolbar">
        <div className="tiers-role-bar pals-role-bar" role="tablist" aria-label="Role / skill">
          {primaryTags.map((opt) => (
            <button
              key={opt.id}
              type="button"
              role="tab"
              aria-selected={effectTag === opt.id}
              className={`tiers-role-tab ${effectTag === opt.id ? "is-active" : ""}`}
              onClick={() => pushParams({ effect: opt.id })}
            >
              {opt.label === "All effects" ? "All" : opt.label}
            </button>
          ))}
        </div>

        <div className="pals-element-bar" role="group" aria-label="Element">
          <button
            type="button"
            className={`pals-el-tab ${element === "all" ? "is-active" : ""}`}
            aria-pressed={element === "all"}
            onClick={() => pushParams({ element: "all" })}
          >
            All
          </button>
          {elements.map((el) => (
            <button
              key={el}
              type="button"
              className={`pals-el-tab ${element === el ? "is-active" : ""}`}
              aria-pressed={element === el}
              title={ELEMENT_LABELS[el]}
              onClick={() => pushParams({ element: el })}
            >
              <span className={`el-dot el-${el}`} aria-hidden />
              <span className="pals-el-tab__label">{ELEMENT_LABELS[el]}</span>
            </button>
          ))}
        </div>

        <div className="pals-toolbar__meta">
          <label className="filter-search filter-search--grow">
            <span className="filter-search__icon" aria-hidden>
              ⌕
            </span>
            <input
              ref={searchRef}
              type="search"
              placeholder="Search name or skill… (/)"
              value={searchDraft}
              onChange={(e) => onSearchChange(e.target.value)}
              aria-label="Search pals"
            />
          </label>
          <label className="filter-select">
            <span className="sr-only">Sort</span>
            <select
              value={sort}
              onChange={(e) => {
                const next = e.target.value as PalSort;
                pushParams({ sort: next, dir: defaultSortDir(next) });
              }}
              aria-label="Sort pals"
            >
              <option value="name">Sort: Name</option>
              <option value="dex">Sort: Dex #</option>
              <option value="element">Sort: Element</option>
              <option value="tier">Sort: Tier</option>
              <option value="hp">Sort: HP</option>
              <option value="atk">Sort: Atk</option>
              <option value="defense">Sort: Def</option>
              <option value="work">Sort: Work</option>
              <option value="combi">Sort: Breed</option>
              <option value="rarity">Sort: Rarity</option>
            </select>
          </label>
          <label className="filter-select">
            <span className="sr-only">Rarity</span>
            <select
              value={rarity}
              onChange={(e) =>
                pushParams({ rarity: e.target.value as PalRarity | "all" })
              }
            >
              <option value="all">All rarities</option>
              {(Object.keys(RARITY_LABELS) as PalRarity[]).map((r) => (
                <option key={r} value={r}>
                  {RARITY_LABELS[r]}
                </option>
              ))}
            </select>
          </label>
          <label className="filter-select">
            <span className="sr-only">Work</span>
            <select
              value={work}
              onChange={(e) =>
                pushParams({
                  work: e.target.value as WorkSuitabilityId | "all",
                  workMin: "1",
                })
              }
            >
              {getWorkOptions().map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
          {work !== "all" ? (
            <div className="filter-chips pals-work-min" role="group" aria-label="Minimum work level">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  className={`chip chip--btn ${workMin === n ? "is-active" : ""}`}
                  aria-pressed={workMin === n}
                  onClick={() => pushParams({ workMin: String(n) })}
                >
                  ≥{n}
                </button>
              ))}
            </div>
          ) : null}
          {hasActiveFilters ? (
            <button type="button" className="chip chip--btn chip--ghost" onClick={clearFilters}>
              Clear
            </button>
          ) : null}
        </div>
      </div>

      <p className="pals-count" aria-live="polite">
        <strong>{filtered.length}</strong> of {pals.length}
        {work !== "all"
          ? ` · ${WORK_LABELS[work as WorkSuitabilityId]} ≥${workMin}`
          : ""}
        {element !== "all" ? ` · ${ELEMENT_LABELS[element]}` : ""}
      </p>

      {filtered.length === 0 ? (
        <div className="pals-empty">
          <p>No pals match these filters.</p>
          <button type="button" className="chip chip--btn" onClick={clearFilters}>
            Clear filters
          </button>
        </div>
      ) : (
        <div className="pals-table-wrap">
          <table className="pals-table">
            <thead>
              <tr>
                <th scope="col" className="pals-th pals-th--rank">
                  <PalSortBtn
                    col="dex"
                    label="#"
                    active={sort === "dex"}
                    sortDir={sortDir}
                    onSort={setSort}
                  />
                </th>
                <th scope="col" className="pals-th pals-th--pal">
                  <PalSortBtn
                    col="name"
                    label="Pal"
                    active={sort === "name"}
                    sortDir={sortDir}
                    onSort={setSort}
                  />
                </th>
                <th scope="col" className="pals-th pals-th--el">
                  <PalSortBtn
                    col="element"
                    label="El"
                    active={sort === "element"}
                    sortDir={sortDir}
                    onSort={setSort}
                  />
                </th>
                <th scope="col" className="pals-th pals-th--tier">
                  <PalSortBtn
                    col="tier"
                    label="Tier"
                    active={sort === "tier"}
                    sortDir={sortDir}
                    onSort={setSort}
                  />
                </th>
                <th scope="col" className="pals-th pals-th--num">
                  <PalSortBtn
                    col="hp"
                    label="HP"
                    active={sort === "hp"}
                    sortDir={sortDir}
                    onSort={setSort}
                  />
                </th>
                <th scope="col" className="pals-th pals-th--num">
                  <PalSortBtn
                    col="atk"
                    label="Atk"
                    active={sort === "atk"}
                    sortDir={sortDir}
                    onSort={setSort}
                  />
                </th>
                <th scope="col" className="pals-th pals-th--num">
                  <PalSortBtn
                    col="defense"
                    label="Def"
                    active={sort === "defense"}
                    sortDir={sortDir}
                    onSort={setSort}
                  />
                </th>
                <th scope="col" className="pals-th pals-th--work">
                  <PalSortBtn
                    col="work"
                    label="Work"
                    active={sort === "work"}
                    sortDir={sortDir}
                    onSort={setSort}
                  />
                </th>
                <th scope="col" className="pals-th pals-th--num pals-th--breed">
                  <PalSortBtn
                    col="combi"
                    label="Breed"
                    active={sort === "combi"}
                    sortDir={sortDir}
                    onSort={setSort}
                  />
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((pal, index) => {
                const works = topWorks(pal.work, 2);
                const atk = atkOf(pal);
                const grade = combatGradeBySlug[pal.slug];

                return (
                  <tr className="pals-table__row" key={pal.slug}>
                      <td className="pals-td pals-td--rank">{index + 1}</td>
                      <td className="pals-td pals-td--pal">
                        <Link href={`/pals/${pal.slug}`} className="pals-table__pal">
                          <PalIcon pal={pal} size={40} />
                          <span className="pals-table__pal-text">
                            <span className="pals-table__name">
                              {pal.isNew ? <span className="pal-row__new">NEW</span> : null}
                              {pal.name}
                            </span>
                            <span className="pals-table__sub">
                              {pal.dexNo != null ? `#${pal.dexNo}` : "—"}
                              <span className={`pal-rarity-chip rarity-${pal.rarity}`}>
                                {RARITY_LABELS[pal.rarity]}
                              </span>
                            </span>
                          </span>
                        </Link>
                      </td>
                      <td className="pals-td pals-td--el">
                        <ElementDots elements={pal.elements} />
                      </td>
                      <td className="pals-td pals-td--tier">
                        {grade ? (
                          <Link
                            href="/tiers?role=combat"
                            className={`tier-badge tier-badge--sm tier-badge--${grade}`}
                            title={`Combat tier ${grade}`}
                          >
                            {grade}
                          </Link>
                        ) : (
                          <span className="pals-table__na">—</span>
                        )}
                      </td>
                      <td className="pals-td pals-td--num">
                        {pal.stats ? pal.stats.hp : "—"}
                      </td>
                      <td className="pals-td pals-td--num">{atk ?? "—"}</td>
                      <td className="pals-td pals-td--num">
                        {pal.stats ? pal.stats.defense : "—"}
                      </td>
                      <td className="pals-td pals-td--work">
                        {works.length === 0 ? (
                          <span className="pals-table__na">—</span>
                        ) : (
                          <span className="pals-table__works">
                            {works.map((w) => (
                              <span
                                key={w.id}
                                className="pal-work-pill pal-work-pill--compact"
                                title={WORK_LABELS[w.id]}
                              >
                                {WORK_LABELS[w.id]}
                                <em>{w.level}</em>
                              </span>
                            ))}
                          </span>
                        )}
                      </td>
                      <td className="pals-td pals-td--num pals-td--breed">
                        {pal.breeding?.combiRank ?? "—"}
                      </td>
                    </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
