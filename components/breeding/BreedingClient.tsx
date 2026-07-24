"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { CompanionIntro } from "@/components/pals/CompanionIntro";
import { CompanionTools } from "@/components/pals/CompanionTools";
import { ElementDots } from "@/components/pals/ElementDots";
import { PalIcon } from "@/components/teams/PalIcon";
import {
  findParentsForChildWithCatalog,
  predictOffspringWithCatalog,
  type UniqueCombo,
} from "@/lib/breeding/engine";
import type { Pal } from "@/lib/teams/types";

type Props = {
  pals: Pal[];
  uniqueCombos: UniqueCombo[];
};

export function BreedingClient({ pals, uniqueCombos }: Props) {
  const searchParams = useSearchParams();
  const initialA = searchParams.get("a") ?? "";
  const initialB = searchParams.get("b") ?? "";
  const initialChild = searchParams.get("child") ?? "";

  const [mode, setMode] = useState<"predict" | "target">(
    initialChild ? "target" : "predict",
  );
  const [parentA, setParentA] = useState(initialA);
  const [parentB, setParentB] = useState(initialB);
  const [child, setChild] = useState(initialChild);
  const [qA, setQA] = useState("");
  const [qB, setQB] = useState("");
  const [qC, setQC] = useState("");

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

  return (
    <div className="breed-page">
      <CompanionIntro
        tone="breeding"
        title="Breeding"
        lead="Pick two parents to see what hatches, or choose a target pal and get every parent pair that produces it."
      >
        <CompanionTools />
      </CompanionIntro>

      <div className="breed-mode" role="tablist" aria-label="Breeding mode">
        <button
          type="button"
          role="tab"
          className={`breed-mode__btn ${mode === "predict" ? "is-active" : ""}`}
          aria-selected={mode === "predict"}
          onClick={() => setMode("predict")}
        >
          <strong>Parents → child</strong>
          <span>What egg do these two make?</span>
        </button>
        <button
          type="button"
          role="tab"
          className={`breed-mode__btn ${mode === "target" ? "is-active" : ""}`}
          aria-selected={mode === "target"}
          onClick={() => setMode("target")}
        >
          <strong>Child → parents</strong>
          <span>How do I breed this Pal?</span>
        </button>
      </div>

      {mode === "predict" ? (
        <section className="breed-panel" aria-label="Predict offspring">
          <div className="breed-stage" aria-live="polite">
            <BreedSlot pal={palA} emptyLabel="Parent A" />
            <span className="breed-stage__op" aria-hidden>
              ×
            </span>
            <BreedSlot pal={palB} emptyLabel="Parent B" />
            <span className="breed-stage__op breed-stage__op--egg" aria-hidden>
              →
            </span>
            <BreedSlot
              pal={prediction?.child ?? null}
              emptyLabel={parentA && parentB ? "No match" : "Egg"}
              highlight
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
              onChange={setParentA}
              allSorted={sorted}
            />
            <PalPicker
              label="Parent B"
              value={parentB}
              q={qB}
              onQ={setQB}
              options={filterOpts(qB)}
              onChange={setParentB}
              allSorted={sorted}
            />
          </div>
        </section>
      ) : (
        <section className="breed-panel" aria-label="Find parents">
          {palChild ? (
            <div className="breed-target-head">
              <PalIcon pal={palChild} size={64} />
              <div>
                <p className="breed-target-head__label">Target</p>
                <h2>{palChild.name}</h2>
                <ElementDots elements={palChild.elements} labeled />
              </div>
            </div>
          ) : null}

          <PalPicker
            label="Target child"
            value={child}
            q={qC}
            onQ={setQC}
            options={filterOpts(qC)}
            onChange={setChild}
            allSorted={sorted}
          />

          {child ? (
            pairs.length === 0 ? (
              <p className="hub-hint">
                No parent pairs inside this catalog. Some variants need a unique wild parent
                outside the curated list.
              </p>
            ) : (
              <>
                <p className="breed-pairs-count">
                  <strong>{pairs.length}</strong> pairs · unique combos listed first
                </p>
                <ul className="breed-pairs">
                  {pairs.map((pair) => (
                    <li key={`${pair.a.slug}-${pair.b.slug}-${pair.kind}`}>
                      <div className="breed-pair">
                        <Link href={`/pals/${pair.a.slug}`} className="breed-pair__pal">
                          <PalIcon pal={pair.a} size={44} />
                          <span>{pair.a.name}</span>
                        </Link>
                        <span className="breed-pair__x" aria-hidden>
                          ×
                        </span>
                        <Link href={`/pals/${pair.b.slug}`} className="breed-pair__pal">
                          <PalIcon pal={pair.b} size={44} />
                          <span>{pair.b.name}</span>
                        </Link>
                        <span
                          className={`breed-pair__tag ${pair.kind === "unique" ? "is-unique" : ""}`}
                        >
                          {pair.kind === "unique" ? "Unique" : "Standard"}
                        </span>
                        <button
                          type="button"
                          className="chip chip--btn chip--ghost breed-pair__try"
                          onClick={() => {
                            setParentA(pair.a.slug);
                            setParentB(pair.b.slug);
                            setMode("predict");
                          }}
                        >
                          Try
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </>
            )
          ) : (
            <p className="hub-hint">Choose a target Pal to list catalog parent pairs.</p>
          )}
        </section>
      )}

      <p className="breed-footnote">
        Results follow the in-game breeding rules, including unique parent combos.{" "}
        <Link href="/pals">Paldeck</Link> · <Link href="/tiers?role=combat">Tier list</Link>
      </p>
    </div>
  );
}

function BreedSlot({
  pal,
  emptyLabel,
  highlight = false,
}: {
  pal: Pal | null;
  emptyLabel: string;
  highlight?: boolean;
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
      <PalIcon pal={pal} size={72} />
      <strong>{pal.name}</strong>
      <ElementDots elements={pal.elements} />
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
}: {
  label: string;
  value: string;
  q: string;
  onQ: (v: string) => void;
  options: Pal[];
  onChange: (slug: string) => void;
  allSorted: Pal[];
}) {
  const selected =
    allSorted.find((p) => p.slug === value) ??
    options.find((p) => p.slug === value) ??
    null;

  return (
    <div className="breed-picker">
      <span className="breed-picker__label">{label}</span>
      <input
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
