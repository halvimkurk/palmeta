"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  MapContainer,
  ImageOverlay,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MAP_HEIGHT, MAP_IMAGE_SRC, MAP_WIDTH, mapImageBounds, normalizedToLatLng } from "@/lib/map/coords";
import {
  LAYER_LABELS,
  MODE_HINTS,
  MODE_LABELS,
  MODE_LAYERS,
  MAP_MODES,
  type MapLayerId,
  type MapMarker,
  type MapMode,
} from "@/lib/map/types";

const FOUND_KEY = "palmeta-map-found-v1";

const LAYER_COLORS: Record<MapLayerId, string> = {
  "fast-travel": "#7aa8ff",
  tower: "#ffb020",
  alpha: "#fb7185",
  "pal-spawn": "#86efac",
  effigy: "#c4b5fd",
  note: "#fde68a",
};

type Props = {
  markers: MapMarker[];
};

function parseMode(raw: string | null): MapMode {
  if (raw && (MAP_MODES as readonly string[]).includes(raw)) return raw as MapMode;
  return "hunt";
}

function loadFound(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(FOUND_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as unknown;
    return new Set(Array.isArray(arr) ? arr.filter((x) => typeof x === "string") : []);
  } catch {
    return new Set();
  }
}

function saveFound(ids: Set<string>) {
  localStorage.setItem(FOUND_KEY, JSON.stringify([...ids]));
}

function makeIcon(layer: MapLayerId, found: boolean, focus: boolean) {
  const color = LAYER_COLORS[layer];
  const size = focus ? 18 : 12;
  return L.divIcon({
    className: "map-pin",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
    html: `<span class="map-pin__dot${found ? " is-found" : ""}${focus ? " is-focus" : ""}" style="--pin:${color}"></span>`,
  });
}

function FitWorld() {
  const map = useMap();
  useEffect(() => {
    map.fitBounds(mapImageBounds(), { padding: [12, 12] });
  }, [map]);
  return null;
}

function FocusMarker({ marker }: { marker: MapMarker | null }) {
  const map = useMap();
  useEffect(() => {
    if (!marker) return;
    const target = normalizedToLatLng(marker.nx, marker.ny);
    // CRS.Simple: keep zoom near fitBounds level (≈ -1…0), never > 0.75
    const zoom = Math.min(0.35, Math.max(-1, map.getZoom()));
    map.flyTo(target, zoom, { duration: 0.45 });
  }, [map, marker]);
  return null;
}

export function MapClient({ markers }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const mode = parseMode(searchParams.get("mode"));
  const slugFilter = searchParams.get("slug") ?? searchParams.get("pal") ?? "";
  const layerOverride = searchParams.get("layer") as MapLayerId | null;

  const [query, setQuery] = useState("");
  const [panelOpen, setPanelOpen] = useState(true);
  const [found, setFound] = useState<Set<string>>(() => new Set());
  const [hideFound, setHideFound] = useState(false);

  useEffect(() => {
    setFound(loadFound());
  }, []);

  const activeLayers = useMemo(() => {
    if (layerOverride && MODE_LAYERS[mode].includes(layerOverride)) {
      return [layerOverride];
    }
    return MODE_LAYERS[mode];
  }, [mode, layerOverride]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return markers.filter((m) => {
      if (!activeLayers.includes(m.layer)) return false;
      if (mode === "pal" && slugFilter && m.palSlug !== slugFilter) return false;
      if (hideFound && found.has(m.id)) return false;
      if (!q) return true;
      return (
        m.name.toLowerCase().includes(q) ||
        m.region?.toLowerCase().includes(q) ||
        m.palSlug?.toLowerCase().includes(q) ||
        m.note?.toLowerCase().includes(q)
      );
    });
  }, [markers, activeLayers, mode, slugFilter, hideFound, found, query]);

  const focusMarker = useMemo(() => {
    if (mode === "pal" && slugFilter) {
      return visible.find((m) => m.palSlug === slugFilter) ?? visible[0] ?? null;
    }
    if (query.trim() && visible.length === 1) return visible[0] ?? null;
    return null;
  }, [mode, slugFilter, visible, query]);

  const setMode = useCallback(
    (next: MapMode) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("mode", next);
      if (next !== "pal") {
        params.delete("slug");
        params.delete("pal");
      }
      params.delete("layer");
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const toggleFound = useCallback((id: string) => {
    setFound((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      saveFound(next);
      return next;
    });
  }, []);

  const clearFound = useCallback(() => {
    setFound(new Set());
    saveFound(new Set());
  }, []);

  return (
    <div className={`map-app${panelOpen ? " is-panel-open" : ""}`}>
      <div className="map-stage">
        <MapContainer
          className="map-stage__leaflet"
          crs={L.CRS.Simple}
          center={[MAP_HEIGHT / 2, MAP_WIDTH / 2]}
          zoom={-1}
          minZoom={-2}
          maxZoom={1}
          zoomSnap={0.25}
          attributionControl={false}
          maxBounds={mapImageBounds()}
          maxBoundsViscosity={0.85}
        >
          <ImageOverlay url={MAP_IMAGE_SRC} bounds={mapImageBounds()} />
          <FitWorld />
          <FocusMarker marker={focusMarker} />
          {visible.map((m) => {
            const isFocus = focusMarker?.id === m.id;
            const isFound = found.has(m.id);
            return (
              <Marker
                key={m.id}
                position={normalizedToLatLng(m.nx, m.ny)}
                icon={makeIcon(m.layer, isFound, isFocus)}
                opacity={isFound ? 0.45 : 1}
              >
                <Popup>
                  <div className="map-popup">
                    <p className="map-popup__layer">{LAYER_LABELS[m.layer]}</p>
                    <strong className="map-popup__name">{m.name}</strong>
                    {m.region ? <p className="map-popup__meta">{m.region}</p> : null}
                    {m.note ? <p className="map-popup__note">{m.note}</p> : null}
                    <div className="map-popup__actions">
                      <button type="button" className="chip chip--btn" onClick={() => toggleFound(m.id)}>
                        {isFound ? "Mark unfound" : "Mark found"}
                      </button>
                      {m.palSlug ? (
                        <Link href={`/pals/${m.palSlug}`} className="chip chip--link">
                          Paldeck
                        </Link>
                      ) : null}
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>

        <div className="map-stage__hud">
          <p className="map-stage__count">
            {visible.length} marker{visible.length === 1 ? "" : "s"}
            {slugFilter ? ` · ${slugFilter}` : ""}
          </p>
          <button
            type="button"
            className="map-stage__toggle"
            onClick={() => setPanelOpen((v) => !v)}
            aria-expanded={panelOpen}
          >
            {panelOpen ? "Hide panel" : "Filters"}
          </button>
        </div>
      </div>

      <aside className="map-panel" aria-label="Map controls">
        <div className="map-panel__head">
          <div>
            <p className="map-panel__eyebrow">Interactive map</p>
            <h1 className="map-panel__title">Palpagos</h1>
          </div>
          <button
            type="button"
            className="map-panel__close"
            onClick={() => setPanelOpen(false)}
            aria-label="Close panel"
          >
            ×
          </button>
        </div>

        <div className="map-modes" role="tablist" aria-label="Map mode">
          {MAP_MODES.map((m) => (
            <button
              key={m}
              type="button"
              role="tab"
              aria-selected={mode === m}
              className={mode === m ? "map-mode is-active" : "map-mode"}
              onClick={() => setMode(m)}
            >
              <strong>{MODE_LABELS[m]}</strong>
              <span>{MODE_HINTS[m]}</span>
            </button>
          ))}
        </div>

        <label className="map-search">
          <span className="sr-only">Search markers</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, region, pal…"
            autoComplete="off"
          />
        </label>

        {mode === "pal" ? (
          <label className="map-search">
            <span className="sr-only">Pal slug filter</span>
            <input
              type="text"
              value={slugFilter}
              onChange={(e) => {
                const params = new URLSearchParams(searchParams.toString());
                params.set("mode", "pal");
                const v = e.target.value.trim().toLowerCase();
                if (v) {
                  params.set("slug", v);
                  params.delete("pal");
                } else {
                  params.delete("slug");
                  params.delete("pal");
                }
                router.replace(`${pathname}?${params.toString()}`, { scroll: false });
              }}
              placeholder="Pal slug (e.g. anubis)"
              autoComplete="off"
            />
          </label>
        ) : null}

        <ul className="map-layers">
          {activeLayers.map((layer) => (
            <li key={layer}>
              <span
                className="map-layers__swatch"
                style={{ background: LAYER_COLORS[layer] }}
                aria-hidden
              />
              {LAYER_LABELS[layer]}
            </li>
          ))}
        </ul>

        <label className="map-check">
          <input
            type="checkbox"
            checked={hideFound}
            onChange={(e) => setHideFound(e.target.checked)}
          />
          Hide found markers
        </label>

        <div className="map-panel__foot">
          <p className="map-panel__hint">
            Palpagos overview map. Marker spots are curated approximations for MVP routing — we&apos;ll
            tighten them against in-game coords over time. Found state stays in this browser.
          </p>
          <button type="button" className="chip chip--btn chip--ghost" onClick={clearFound}>
            Reset found ({found.size})
          </button>
        </div>

        <ul className="map-results">
          {visible.slice(0, 40).map((m) => (
            <li key={m.id}>
              <button
                type="button"
                className={found.has(m.id) ? "map-result is-found" : "map-result"}
                onClick={() => {
                  const params = new URLSearchParams(searchParams.toString());
                  params.set("mode", mode);
                  if (m.palSlug) params.set("slug", m.palSlug);
                  router.replace(`${pathname}?${params.toString()}`, { scroll: false });
                  setQuery(m.name);
                }}
              >
                <span
                  className="map-layers__swatch"
                  style={{ background: LAYER_COLORS[m.layer] }}
                  aria-hidden
                />
                <span>
                  <strong>{m.name}</strong>
                  {m.region ? <em>{m.region}</em> : null}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}
