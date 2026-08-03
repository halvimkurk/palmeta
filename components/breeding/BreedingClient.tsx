"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { CompanionIntro } from "@/components/pals/CompanionIntro";
import { NAV } from "@/lib/nav";
import { CompanionTools } from "@/components/pals/CompanionTools";
import { ElementDots } from "@/components/pals/ElementDots";
import { PalIcon } from "@/components/teams/PalIcon";
import {
  findParentsForChildWithCatalog,
  predictOffspringWithCatalog,
  type UniqueCombo,
} from "@/lib/breeding/engine";
import { type BreedingMode } from "@/lib/breeding/url";
import type { TierGrade } from "@/lib/tiers/types";
import type { Pal } from "@/lib/teams/types";

type Props = {
  pals: Pal[];
  uniqueCombos: UniqueCombo[];
  combatGradeBySlug: Record<string, TierGrade>;
  mode: BreedingMode;
  parentA: string;
  parentB: string;
  child: string;
};

export function BreedingClient({
  pals,
  uniqueCombos,
  combatGradeBySlug,
  mode,
  parentA,
  parentB,
  child,
}: Props) {
  const router = useRouter();
  const [qA, setQA] = useState("");
  const [qB, setQB] = useState("");
  const [qC, setQC] = useState("");
  const [pairQuery, setPairQuery] = useState("");
  const [pairKind, setPairKind] = useState<"all" | "unique" | "formula">("all");
  const [targetPickerOpen, setTargetPickerOpen] = useState(!child);
  const targetResultsRef = useRef<HTMLDivElement>(null);

  function replaceBreedingUrl(params: URLSearchParams) {
    const qs = params.toString();
    router.replace(qs ? `/breeding?${qs}` : "/breeding", { scroll: false });
  }

  function setPredictParents(a: string, b: string) {
    const params = new URLSearchParams();
    if (a) params.set("a", a);
    if (b) params.set("b", b);
    replaceBreedingUrl(params);
  }

  function setTargetMode(slug = "") {
    const params = new URLSearchParams();
    params.set("mode", "target");
    if (slug) params.set("child", slug);
    replaceBreedingUrl(params);
  }

  function setTargetChild(slug: string) {
    setTargetMode(slug);
    setTargetPickerOpen(false);
    setQC("");
    setPairQuery("");
    setPairKind("all");
  }

  const palMap = useMemo(() => new Map(pals.map((p) => [p.slug, p])), [pals]);

  const sorted = useMemo(
    () => [...pals].sort((a, b) => a.name.localeCompare(b.name)),
    [pals],
  );

  const filterOpts = (q: string) => {
    const needle = q.trim().toLowerCase();
    if (!needle) return sorted.slice(0, 40);
    return sorted.filter((p) => p.name.toLowerCase().includes(needle)).slice(0, 40);
  };

  const palA = parentA ? palMap.get(parentA) ?? null : null;
  const palB = parentB ? palMap.get(parentB) ?? null : null;
  const palChild = child ? palMap.get(child) ?? null : null;

  const prediction = useMemo(() => {
    if (!parentA || !parentB) return null;
    return predictOffspringWithCatalog(pals, uniqueCombos, parentA, parentB);
  }, [parentA, parentB, pals, uniqueCombos]);

  const pairs = useMemo(() => {
    if (!child) return [];
    return findParentsForChildWithCatalog(pals, uniqueCombos, child, 30);
  }, [child, pals, uniqueCombos]);

  const pairStats = useMemo(() => {
    let unique = 0;
    let formula = 0;
    for (const pair of pairs) {
      if (pair.kind === "unique") unique += 1;
      else formula += 1;
    }
    return { unique, formula, total: pairs.length };
  }, [pairs]);

  const filteredPairs = useMemo(() => {
    const needle = pairQuery.trim().toLowerCase();
    return pairs.filter((pair) => {
      if (pairKind !== "all" && pair.kind !== pairKind) return false;
      if (!needle) return true;
      return (
        pair.a.name.toLowerCase().includes(needle) ||
        pair.b.name.toLowerCase().includes(needle) ||
        pair.a.slug.includes(needle) ||
        pair.b.slug.includes(needle)
      );
    });
  }, [pairs, pairQuery, pairKind]);

  const pairSearchHints = useMemo(() => {
    const needle = pairQuery.trim().toLowerCase();
    if (needle.length < 1) return [];
    const seen = new Set<string>();
    const hints: { slug: string; name: string }[] = [];
    for (const pair of pairs) {
      for (const pal of [pair.a, pair.b]) {
        if (seen.has(pal.slug)) continue;
        const hit =
          pal.name.toLowerCase().includes(needle) || pal.slug.includes(needle);
        if (!hit) continue;
        seen.add(pal.slug);
        hints.push({ slug: pal.slug, name: pal.name });
        if (hints.length >= 5) return hints;
      }
    }
    return hints;
  }, [pairs, pairQuery]);

  useEffect(() => {
    if (mode !== "target") return;
    if (!child) {
      setTargetPickerOpen(true);
      return;
    }
    setTargetPickerOpen(false);
    const id = window.requestAnimationFrame(() => {
      targetResultsRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
    return () => window.cancelAnimationFrame(id);
  }, [mode, child]);

  return (
    <div className="breed-page">
      <CompanionIntro
        tone="breeding"
        eyebrow={NAV.breeding.eyebrow}
        title={NAV.breeding.label}
        lead={NAV.breeding.lead}
      >
        <CompanionTools />
      </CompanionIntro>

      <div className="breed-mode" role="tablist" aria-label="Breeding mode">
        <button
          type="button"
          role="tab"
          className={`breed-mode__btn ${mode === "predict" ? "is-active" : ""}`}
          aria-selected={mode === "predict"}
          onClick={() => setPredictParents(parentA, parentB)}
        >
          Parents → child
        </button>
        <button
          type="button"
          role="tab"
          className={`breed-mode__btn ${mode === "target" ? "is-active" : ""}`}
          aria-selected={mode === "target"}
          onClick={() => setTargetMode(child || prediction?.childSlug || "")}
        >
          Child → parents
        </button>
      </div>

      {mode === "predict" ? (
        <section className="breed-panel" aria-label="Predict offspring">
          <div className="breed-stage" aria-live="polite">
            <BreedSlot
              pal={palA}
              emptyLabel="Parent A"
              grade={palA ? combatGradeBySlug[palA.slug] : undefined}
            />
            <span className="breed-stage__op" aria-hidden>
              ×
            </span>
            <BreedSlot
              pal={palB}
              emptyLabel="Parent B"
              grade={palB ? combatGradeBySlug[palB.slug] : undefined}
            />
            <span className="breed-stage__op breed-stage__op--egg" aria-hidden>
              →
            </span>
            <BreedSlot
              pal={prediction?.child ?? null}
              emptyLabel={parentA && parentB ? "No match" : "Egg"}
              highlight
              grade={
                prediction?.child
                  ? combatGradeBySlug[prediction.child.slug]
                  : undefined
              }
            />
          </div>

          {prediction?.child ? (
            <p className="breed-result-meta">
              <span className={`breed-kind breed-kind--${prediction.kind}`}>
                {prediction.kind === "unique" ? "Unique combo" : "Standard pairing"}
              </span>
              <Link href={`/pals/${prediction.child.slug}`}>Open {prediction.child.name}</Link>
            </p>
          ) : prediction ? (
            <p className="hub-hint">{prediction.note ?? "No result."}</p>
          ) : (
            <p className="hub-hint">Select Parent A and Parent B below.</p>
          )}

          <div className="breed-pickers">
            <PalPicker
              label="Parent A"
              value={parentA}
              q={qA}
              onQ={setQA}
              options={filterOpts(qA)}
              onChange={(slug) => setPredictParents(slug, parentB)}
              allSorted={sorted}
            />
            <PalPicker
              label="Parent B"
              value={parentB}
              q={qB}
              onQ={setQB}
              options={filterOpts(qB)}
              onChange={(slug) => setPredictParents(parentA, slug)}
              allSorted={sorted}
            />
          </div>
        </section>
      ) : (
        <section className="breed-panel" aria-label="Find parents">
          <div
            ref={targetResultsRef}
            className="breed-target-results"
            aria-live="polite"
            tabIndex={-1}
          >
            {palChild ? (
              <div className="breed-target-head">
                <div className="breed-target-head__main">
                  <Link
                    href={`/pals/${palChild.slug}`}
                    className="breed-target-head__icon"
                    aria-label={`Open ${palChild.name} in Paldeck`}
                  >
                    <PalIcon pal={palChild} size={72} />
                    {combatGradeBySlug[palChild.slug] ? (
                      <span
                        className={`tier-badge tier-badge--sm tier-badge--${combatGradeBySlug[palChild.slug]} breed-target-head__tier`}
                        title={`Combat tier ${combatGradeBySlug[palChild.slug]}`}
                      >
                        {combatGradeBySlug[palChild.slug]}
                      </span>
                    ) : null}
                  </Link>
                  <div className="breed-target-head__copy">
                    <p className="breed-target-head__label">Breeding for</p>
                    <h2>
                      <Link href={`/pals/${palChild.slug}`}>{palChild.name}</Link>
                    </h2>
                    <div className="breed-target-head__meta-row">
                      <ElementDots elements={palChild.elements} labeled />
                      <span className="breed-target-head__count">
                        {pairStats.total === 0
                          ? "No catalog pairs"
                          : `${pairStats.total} pair${pairStats.total === 1 ? "" : "s"}`}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="breed-target-head__tools">
                  <div className="breed-target-tools__top">
                    <label className="breed-pair-search">
                      <span className="breed-pair-search__label">Search</span>
                      <input
                        type="search"
                        value={pairQuery}
                        onChange={(e) => setPairQuery(e.target.value)}
                        placeholder="Find a parent in pairs…"
                        aria-label="Search parent pals in pairs"
                      />
                    </label>
                    {targetPickerOpen ? (
                      <button
                        type="button"
                        className="breed-target-action breed-target-action--ghost"
                        onClick={() => setTargetPickerOpen(false)}
                      >
                        Cancel
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="breed-target-action"
                        onClick={() => setTargetPickerOpen(true)}
                      >
                        Change target
                      </button>
                    )}
                  </div>

                  {pairSearchHints.length > 0 ? (
                    <div className="breed-pair-hints" role="list">
                      {pairSearchHints.map((hint) => (
                        <button
                          key={hint.slug}
                          type="button"
                          role="listitem"
                          className="breed-pair-hint"
                          onClick={() => setPairQuery(hint.name)}
                        >
                          {hint.name}
                        </button>
                      ))}
                    </div>
                  ) : null}

                  <div className="breed-pair-filters" role="group" aria-label="Pair type">
                    <button
                      type="button"
                      className={`breed-pair-filter ${pairKind === "all" ? "is-active" : ""}`}
                      aria-pressed={pairKind === "all"}
                      onClick={() => setPairKind("all")}
                    >
                      All {pairStats.total}
                    </button>
                    <button
                      type="button"
                      className={`breed-pair-filter ${pairKind === "unique" ? "is-active" : ""}`}
                      aria-pressed={pairKind === "unique"}
                      onClick={() => setPairKind("unique")}
                      disabled={pairStats.unique === 0}
                    >
                      Unique {pairStats.unique}
                    </button>
                    <button
                      type="button"
                      className={`breed-pair-filter ${pairKind === "formula" ? "is-active" : ""}`}
                      aria-pressed={pairKind === "formula"}
                      onClick={() => setPairKind("formula")}
                      disabled={pairStats.formula === 0}
                    >
                      Standard {pairStats.formula}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <p className="hub-hint breed-target-empty">
                Choose a target Pal below — parent pairs appear here as soon as you pick one.
              </p>
            )}
          </div>

          {targetPickerOpen || !palChild ? (
            <PalPicker
              label={palChild ? "Change target child" : "Target child"}
              value={child}
              q={qC}
              onQ={setQC}
              options={filterOpts(qC)}
              onChange={setTargetChild}
              allSorted={sorted}
              autoFocus={Boolean(palChild)}
            />
          ) : null}

          {palChild ? (
            pairs.length === 0 ? (
              <p className="hub-hint">
                No parent pairs inside this catalog. Some variants need a unique wild parent
                outside the curated list.
              </p>
            ) : filteredPairs.length === 0 ? (
              <p className="hub-hint">
                No pairs match “{pairQuery.trim() || pairKind}”. Clear search or switch filter.
              </p>
            ) : (
              <div className="breed-pairs-block">
                <p className="breed-pairs-count">
                  Showing <strong>{filteredPairs.length}</strong>
                  {filteredPairs.length !== pairStats.total
                    ? ` of ${pairStats.total}`
                    : ""}{" "}
                  pairs that hatch <strong>{palChild.name}</strong>
                  <span> · unique combos first</span>
                </p>
                <ul className="breed-pairs">
                  {filteredPairs.map((pair) => (
                    <li key={`${pair.a.slug}-${pair.b.slug}-${pair.kind}`}>
                      <article
                        className={`breed-pair ${pair.kind === "unique" ? "is-unique" : ""}`}
                      >
                        <div className="breed-pair__top">
                          <span
                            className={`breed-pair__tag ${pair.kind === "unique" ? "is-unique" : ""}`}
                          >
                            {pair.kind === "unique" ? "Unique" : "Standard"}
                          </span>
                        </div>
                        <div className="breed-pair__parents">
                          <BreedPairPal
                            pal={pair.a}
                            grade={combatGradeBySlug[pair.a.slug]}
                            highlight={parentMatchesQuery(pair.a, pairQuery)}
                          />
                          <span className="breed-pair__x" aria-hidden>
                            ×
                          </span>
                          <BreedPairPal
                            pal={pair.b}
                            grade={combatGradeBySlug[pair.b.slug]}
                            highlight={parentMatchesQuery(pair.b, pairQuery)}
                          />
                        </div>
                      </article>
                    </li>
                  ))}
                </ul>
              </div>
            )
          ) : null}
        </section>
      )}

      <p className="breed-footnote">
        Results follow the in-game breeding rules, including unique parent combos.{" "}
        <Link href="/pals">{NAV.pals.label}</Link> · <Link href="/tiers?role=combat">{NAV.tiers.label}</Link>
      </p>
    </div>
  );
}

function parentMatchesQuery(pal: Pal, query: string) {
  const needle = query.trim().toLowerCase();
  if (!needle) return false;
  return pal.name.toLowerCase().includes(needle) || pal.slug.includes(needle);
}

function BreedSlot({
  pal,
  emptyLabel,
  highlight = false,
  grade,
}: {
  pal: Pal | null;
  emptyLabel: string;
  highlight?: boolean;
  grade?: TierGrade;
}) {
  if (!pal) {
    return (
      <div className={`breed-slot is-empty ${highlight ? "is-highlight" : ""}`}>
        <span className="breed-slot__egg" aria-hidden />
        <span>{emptyLabel}</span>
      </div>
    );
  }
  return (
    <Link
      href={`/pals/${pal.slug}`}
      className={`breed-slot ${highlight ? "is-highlight" : ""}`}
    >
      <span className="breed-slot__icon">
        <PalIcon pal={pal} size={72} />
        {grade ? (
          <span
            className={`tier-badge tier-badge--sm tier-badge--${grade} breed-slot__tier`}
            title={`Combat tier ${grade}`}
          >
            {grade}
          </span>
        ) : null}
      </span>
      <strong>{pal.name}</strong>
      <ElementDots elements={pal.elements} />
    </Link>
  );
}

function BreedPairPal({
  pal,
  grade,
  highlight = false,
}: {
  pal: Pal;
  grade?: TierGrade;
  highlight?: boolean;
}) {
  return (
    <Link
      href={`/pals/${pal.slug}`}
      className={`breed-pair__pal ${highlight ? "is-match" : ""}`}
    >
      <span className="breed-pair__icon">
        <PalIcon pal={pal} size={48} />
        {grade ? (
          <span
            className={`tier-badge tier-badge--sm tier-badge--${grade} breed-pair__tier`}
            title={`Combat tier ${grade}`}
          >
            {grade}
          </span>
        ) : null}
      </span>
      <span>{pal.name}</span>
    </Link>
  );
}

function PalPicker({
  label,
  value,
  q,
  onQ,
  options,
  onChange,
  allSorted,
  autoFocus = false,
}: {
  label: string;
  value: string;
  q: string;
  onQ: (v: string) => void;
  options: Pal[];
  onChange: (slug: string) => void;
  allSorted: Pal[];
  autoFocus?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const selected =
    allSorted.find((p) => p.slug === value) ??
    options.find((p) => p.slug === value) ??
    null;

  useEffect(() => {
    if (!autoFocus) return;
    inputRef.current?.focus();
  }, [autoFocus]);

  return (
    <div className="breed-picker">
      <span className="breed-picker__label">{label}</span>
      <input
        ref={inputRef}
        type="search"
        placeholder="Type to filter…"
        value={q}
        onChange={(e) => onQ(e.target.value)}
        aria-label={`Filter ${label}`}
      />
      <div className="breed-picker__grid" role="listbox" aria-label={label}>
        {options.map((p) => (
          <button
            key={p.slug}
            type="button"
            role="option"
            aria-selected={p.slug === value}
            className={`breed-picker__opt ${p.slug === value ? "is-selected" : ""}`}
            onClick={() => onChange(p.slug)}
          >
            <PalIcon pal={p} size={40} />
            <span>
              <strong>{p.name}</strong>
            </span>
          </button>
        ))}
      </div>
      {selected ? (
        <p className="breed-picker__selected">
          Selected: <Link href={`/pals/${selected.slug}`}>{selected.name}</Link>
        </p>
      ) : null}
    </div>
  );
}
